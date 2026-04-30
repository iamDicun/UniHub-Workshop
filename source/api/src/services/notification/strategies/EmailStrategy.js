import nodemailer from 'nodemailer';
import BaseStrategy from './BaseStrategy.js';

export default class EmailStrategy extends BaseStrategy {
  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Hoặc Mailtrap, SendGrid tùy bạn cấu hình
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async send(recipient, data) {
    if (!recipient.email) return;

    const mailOptions = {
      from: `"UniHub Workshop" <${process.env.MAIL_USER}>`,
      to: recipient.email,
      subject: `Xác nhận đăng ký thành công: ${data.workshopTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Xin chào ${recipient.name},</h2>
          <p>Bạn đã đăng ký thành công workshop <strong>${data.workshopTitle}</strong>.</p>
          <p><strong>Thời gian:</strong> ${new Date(data.startTime).toLocaleString('vi-VN')}</p>
          <p><strong>Địa điểm:</strong> ${data.location}</p>
          <hr/>
          <p>Mã vé (Registration ID) của bạn là: <strong>${data.registrationId}</strong></p>
          <p>Vui lòng đưa mã này (hoặc mã QR trên app) cho nhân sự khi check-in tại sự kiện.</p>
          <p>Hẹn gặp lại bạn!</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EmailStrategy] Gửi mail thành công đến ${recipient.email} - MessageId: ${info.messageId}`);
    } catch (error) {
      console.error(`[EmailStrategy] Lỗi khi gửi mail: ${error.message}`);
      throw error; // Quăng lỗi để Worker biết và xử lý gửi lại nếu cần
    }
  }
}
