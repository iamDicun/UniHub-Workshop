import pool from '../config/db.js';
import payos from '../config/payos.js';
import { getPaymentByOrderCodeForUpdate, updatePaymentStatus, getMyPayments, getAllPayments } from '../repositories/payment.repository.js';
import { updateRegistrationStatus, getRegistrationByIdForUpdate } from '../repositories/registration.repository.js';
import { publishRegistrationEvent } from '../queue/notification.producer.js';

const processVerifiedWebhook = async (webhookData) => {
  if (webhookData.code !== '00') {
    return;
  }

  const orderCode = webhookData.orderCode;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const payment = await getPaymentByOrderCodeForUpdate(orderCode, client);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status === 'paid') {
      await client.query('COMMIT');
      return { status: 'already_processed' };
    }
    
    // Check registration
    const registration = await getRegistrationByIdForUpdate(payment.registration_id, client);
    if (registration.status === 'cancelled') {
       await client.query('COMMIT');
       return { status: 'cancelled' };
    }

    await updatePaymentStatus(payment.id, 'paid', client);
    await updateRegistrationStatus(payment.registration_id, 'confirmed', client);
    
    await client.query('COMMIT');
    
    // Đẩy Queue Gửi Email (đã tách ra khỏi Transaction)
    await publishRegistrationEvent({
      studentId: registration.student_id,
      workshopId: registration.workshop_id,
      registrationId: payment.registration_id
    });
    
    return { status: 'success' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const processWebhook = async (webhookBody) => {
  const webhookData = await payos.webhooks.verify(webhookBody);
  return await processVerifiedWebhook(webhookData);
};

export const processWebhookTest = async (webhookBody) => {
  const webhookData = webhookBody?.webhookData || webhookBody?.data || webhookBody;
  return await processVerifiedWebhook(webhookData);
};

export const markPaymentAsFailed = async (orderCode) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const payment = await getPaymentByOrderCodeForUpdate(orderCode, client);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status === 'paid') {
      await client.query('COMMIT');
      return { status: 'already_paid' };
    }
    
    // Mark payment as failed
    await updatePaymentStatus(payment.id, 'failed', client);
    await client.query('COMMIT');
    
    console.log('[Payment] Marked as failed - Order Code:', orderCode);
    return { status: 'failed' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const listMyPayments = async (studentId) => {
  return await getMyPayments(studentId);
};

export const listAdminPayments = async () => {
  return await getAllPayments();
};
