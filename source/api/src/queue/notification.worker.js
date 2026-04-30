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

            // 1. Lấy thông tin sinh viên
            const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [studentId]);
            const student = userResult.rows[0];

            // 2. Lấy thông tin workshop
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

              // 3. Thực thi gửi thông báo qua tất cả các kênh (hiện tại có Email)
              await notificationContext.notifyAll(recipient, data);
            }
          }

          // Xác nhận đã xử lý xong (ack)
          channel.ack(msg);
        } catch (error) {
          console.error('[Worker] Lỗi xử lý tin nhắn:', error);
          // Gửi lại vào queue nếu lỗi (hoặc cho vào Dead Letter Queue)
          // Tạm thời nack(msg, false, false) để loại bỏ tránh kẹt loop
          channel.nack(msg, false, false); 
        }
      }
    });
  } catch (error) {
    console.error('[Worker] Khởi tạo thất bại:', error);
  }
};
