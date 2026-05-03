import pool from '../config/db.js';
import {
  getWorkshopForUpdate,
  getWorkshopById,
} from '../repositories/workshop.repository.js';
import {
  findRegistrationByStudentAndWorkshop,
  findRegistrationForCancel,
  createRegistration,
  updateRegistrationStatus,
} from '../repositories/registration.repository.js';
import { findCheckinByRegistrationId } from '../repositories/checkin.repository.js';
import { deleteCachedWorkshop, setCachedWorkshop } from './workshop.cache.js';
import { publishRegistrationEvent } from '../queue/notification.producer.js';
import { payosCircuitBreaker } from '../config/payos.breaker.js';

const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const registerForWorkshop = async (workshopId, studentId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const workshop = await getWorkshopForUpdate(workshopId, client);
    if (!workshop) {
      throw buildError('Workshop khong ton tai', 404);
    }

    const existing = await findRegistrationByStudentAndWorkshop(studentId, workshopId, client);
    if (existing && existing.status !== 'cancelled' && existing.status !== 'pending') {
      throw buildError('Ban da dang ky workshop nay', 409);
    }

    // Nếu pending mà đã có payment rồi thì phải xử lý resume chứ không giảm ghế nữa
    if (existing && existing.status === 'pending') {
      console.log('[RESUME] Tìm existing registration với status=pending:', existing.id);
      // Query ANY payment (không filter by status) để tìm payment reuse
      let paymentRes = await client.query('SELECT id, order_code, checkout_url, status FROM payments WHERE registration_id = $1 ORDER BY created_at DESC LIMIT 1', [existing.id]);
      console.log('[RESUME] Payment query result:', paymentRes.rowCount, 'rows');
      
      let payment = paymentRes.rowCount > 0 ? paymentRes.rows[0] : null;
      let checkoutUrl = payment?.checkout_url || null;
      let lastCircuitError = null;
      console.log('[RESUME] Existing payment status:', payment?.status, 'checkoutUrl:', checkoutUrl);
      
      // Nếu không có payment hoặc payment không có link, phải tạo link mới
      if (Number(workshop.price) > 0 && (!payment || !checkoutUrl || payment.status === 'failed')) {
        // Nếu payment chưa tồn tại HOẶC payment bị failed, tạo mới
        if (!payment || payment.status === 'failed') {
          console.log('[RESUME] Không tìm thấy payment hoặc payment bị failed, tạo mới...');
          const newPaymentRes = await client.query(
            `INSERT INTO payments (registration_id, amount, status) 
             VALUES ($1, $2, 'pending') RETURNING order_code, id`,
            [existing.id, workshop.price]
          );
          payment = newPaymentRes.rows[0];
          checkoutUrl = null;
          console.log('[RESUME] Payment mới được tạo:', payment.id);
        }
        
        const body = {
          orderCode: Number(payment.order_code),
          amount: Number(workshop.price),
          description: `Thanh toan WS`,
          returnUrl: process.env.PAYOS_RETURN_URL,
          cancelUrl: process.env.PAYOS_CANCEL_URL
        };
        
        try {
          console.log('[RESUME] Tạo checkout link mới...');
          const payosRes = await payosCircuitBreaker.fire(body);
          checkoutUrl = payosRes.checkoutUrl;
          await client.query(
            `UPDATE payments SET external_id = $1, checkout_url = $2 WHERE id = $3`,
            [payosRes.paymentLinkId, checkoutUrl, payment.id]
          );
          console.log('[RESUME] Checkout link tạo thành công');
        } catch (circuitError) {
          lastCircuitError = circuitError;
          console.warn('[Payment Fallback] Không thể tạo link thanh toán (Retry):', circuitError.message);
        }
      }

      await client.query('COMMIT');
      
      let fallbackMessage = null;
      if (!checkoutUrl) {
        fallbackMessage = lastCircuitError ? lastCircuitError.message : 'Hệ thống thanh toán đang gián đoạn. Vui lòng thử lại sau ít phút.';
        console.log('[RESUME] Trả về fallback message:', fallbackMessage);
      }

      const resumeResponse = {
        registration_id: existing.id,
        status: existing.status,
        workshop_id: existing.workshop_id,
        checkout_url: checkoutUrl,
        order_code: payment?.order_code,
        ...(fallbackMessage ? { message: fallbackMessage } : {})
      };
      console.log('[RESUME] Returning response:', JSON.stringify(resumeResponse));
      return resumeResponse;
    }

    const isPaid = Number(workshop.price) > 0;
    const initialStatus = isPaid ? 'pending' : 'confirmed';

    let registration;
    if (existing && existing.status === 'cancelled') {
      registration = await updateRegistrationStatus(existing.id, initialStatus, client);
    } else {
      registration = await createRegistration(studentId, workshopId, initialStatus, client);
    }

    let checkoutUrl = null;
    let circuitBreakerError = null;
    let paymentOrderCode = null;
    if (isPaid) {
      const paymentRes = await client.query(
        `INSERT INTO payments (registration_id, amount, status) 
         VALUES ($1, $2, 'pending') RETURNING order_code, id`,
         [registration.id, workshop.price]
      );
      const payment = paymentRes.rows[0];
      paymentOrderCode = payment.order_code;

      const body = {
        orderCode: Number(payment.order_code),
        amount: Number(workshop.price),
        description: `Thanh toan WS`,
        returnUrl: process.env.PAYOS_RETURN_URL,
        cancelUrl: process.env.PAYOS_CANCEL_URL
      };

      let payosRes;
      try {
        // Dùng Circuit Breaker để gọi thay vì gọi trực tiếp
        payosRes = await payosCircuitBreaker.fire(body);
        checkoutUrl = payosRes.checkoutUrl;

        await client.query(
          `UPDATE payments SET external_id = $1, checkout_url = $2 WHERE id = $3`,
          [payosRes.paymentLinkId, checkoutUrl, payment.id]
        );
      } catch (circuitError) {
        // Nếu cổng thanh toán sập (Open) hoặc Timeout -> Áp dụng Graceful Degradation
        // CHÚ Ý: Không throw error, không Rollback. Chúng ta vẫn giữ Registration và Payment ở trạng thái PENDING.
        circuitBreakerError = circuitError;
        console.warn('[Payment Fallback] Không thể tạo link thanh toán:', circuitError.message);
        // Frontend sẽ nhận ra checkoutUrl = null và thông báo cho người dùng
      }
    }

    await client.query('COMMIT');
    
    const updatedWorkshop = await getWorkshopById(workshopId);
    if (updatedWorkshop) {
      await setCachedWorkshop(updatedWorkshop);
    }

    if (!isPaid) {
      await publishRegistrationEvent({
        studentId: studentId,
        workshopId: workshopId,
        registrationId: registration.id
      });
    }

    let fallbackMessage = null;
    if (isPaid && !checkoutUrl) {
      fallbackMessage = circuitBreakerError 
        ? `Hệ thống thanh toán tạm thời gián đoạn. Đơn đăng ký của bạn đã được ghi nhận. Vui lòng quay lại thanh toán sau. (${circuitBreakerError.message})`
        : 'Hệ thống thanh toán tạm thời gián đoạn. Đơn đăng ký của bạn đã được ghi nhận. Vui lòng quay lại thanh toán sau.';
    }

    return {
      registration_id: registration.id,
      status: registration.status,
      workshop_id: registration.workshop_id,
      checkout_url: checkoutUrl,
      order_code: paymentOrderCode,
      ...(fallbackMessage && { message: fallbackMessage })
    };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.message === 'Workshop da het cho') {
      throw buildError('Workshop da het cho', 409);
    }
    if (error.code === '23505') {
      throw buildError('Ban da dang ky workshop nay', 409);
    }
    throw error;
  } finally {
    client.release();
  }
};

export const cancelRegistration = async (registrationId, studentId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const registration = await findRegistrationForCancel(registrationId, studentId, client);
    if (!registration) {
      throw buildError('Dang ky khong ton tai', 404);
    }

    if (registration.status === 'cancelled') {
      throw buildError('Dang ky da duoc huy truoc do', 400);
    }

    const checkin = await findCheckinByRegistrationId(registrationId, client);
    if (checkin) {
      throw buildError('Khong the huy dang ky da check-in', 409);
    }

    await updateRegistrationStatus(registrationId, 'cancelled', client);

    await client.query('COMMIT');

    const updatedWorkshop = await getWorkshopById(registration.workshop_id);
    if (updatedWorkshop) {
      await setCachedWorkshop(updatedWorkshop);
    }

    return {
      registration_id: registrationId,
      status: 'cancelled',
      workshop_id: registration.workshop_id,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.message === 'Workshop da het cho') {
      throw buildError('Workshop da het cho', 409);
    }
    throw error;
  } finally {
    client.release();
  }
};
