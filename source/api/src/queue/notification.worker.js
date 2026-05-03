import { getChannel } from '../config/rabbitmq.js';
import NotificationContext from '../services/notification/NotificationContext.js';
import EmailStrategy from '../services/notification/strategies/EmailStrategy.js';
import { QUEUE_NAME } from './notification.producer.js';
import pool from '../config/db.js';

const notificationContext = new NotificationContext();
notificationContext.addStrategy(new EmailStrategy());

export const startNotificationWorker = async () => {
  const channel = getChannel();
  if (!channel) {
    console.error('[Worker] Channel RabbitMQ chưa sẵn sàng. Đang thử lại sau 5s...');
    setTimeout(startNotificationWorker, 5000);
    return;
  }

  try {
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    // Chỉ lấy 1 tin nhắn tại một thời điểm để xử lý (tránh quá tải worker)
    channel.prefetch(1);

    console.log(`[*] Đang lắng nghe tin nhắn trên Queue: ${QUEUE_NAME}`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const payload = JSON.parse(msg.content.toString());
          console.log(`[Worker] Nhận được tin nhắn: ${payload.type}`);

          if (payload.type === 'REGISTRATION_SUCCESS') {
            const { studentId, workshopId, registrationId } = payload.data;

            // Lấy thông tin sinh viên và workshop
            const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [studentId]);
            const student = userResult.rows[0];

            const workshopResult = await pool.query('SELECT title, start_time, location FROM workshops WHERE id = $1', [workshopId]);
            const workshop = workshopResult.rows[0];

            if (student && workshop) {
              const recipient = { email: student.email, name: student.name };
              const data = {
                workshopTitle: workshop.title,
                startTime: workshop.start_time,
                location: workshop.location,
                registrationId: registrationId
              };

              // Thử gửi mail
              await notificationContext.notifyAll(recipient, data);
            }
          }

          // Gửi thành công thì ack
          channel.ack(msg);
        } catch (error) {
          const payload = JSON.parse(msg.content.toString());
          const retryCount = payload.retryCount || 0;
          
          console.error(`[Worker] Lỗi xử lý tin nhắn (Lần thử ${retryCount + 1}):`, error.message);

          if (retryCount < 3) {
            // Tăng số lần thử lại
            payload.retryCount = retryCount + 1;
            
            // Tính toán độ trễ (Exponential Backoff): 5s, 15s, 30s
            const delays = [5000, 15000, 30000];
            const delay = delays[retryCount] || 30000;

            console.log(`[Worker] Đang hoãn tin nhắn ${delay/1000}s trước khi thử lại...`);

            // Tạo queue hoãn (Wait Queue)
            const WAIT_QUEUE = `notification_wait_queue_${delay}`;
            await channel.assertQueue(WAIT_QUEUE, {
              durable: true,
              arguments: {
                'x-dead-letter-exchange': '', // DLX default
                'x-dead-letter-routing-key': QUEUE_NAME, // Khi hết TTL thì bay về lại Queue chính
                'x-message-ttl': delay // Đợi n giây
              }
            });

            // Ném vào Wait Queue
            channel.sendToQueue(WAIT_QUEUE, Buffer.from(JSON.stringify(payload)), { persistent: true });
            
            // Báo đã xử lý xong cái cũ (để xóa khỏi queue chính)
            channel.ack(msg);
          } else {
            console.error('[Worker] Vượt quá số lần thử lại. Đẩy vào Database Failed Jobs.');
            
            // Lưu vào DB để Admin vào UI xử lý (DLQ dạng bảng)
            await pool.query(
              `INSERT INTO failed_jobs (payload, error_message) VALUES ($1, $2)`,
              [payload, error.message]
            );
            
            // Ack luôn để dọn dẹp hàng đợi
            channel.ack(msg);
          }
        }
      }
    });
  } catch (error) {
    console.error('[Worker] Khởi tạo thất bại:', error);
  }
};
