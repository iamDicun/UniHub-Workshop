export default class NotificationContext {
  constructor() {
    this.strategies = [];
  }

  // Thêm một kênh thông báo mới
  addStrategy(strategy) {
    this.strategies.push(strategy);
  }

  // Chạy đồng loạt tất cả các kênh
  async notifyAll(recipient, data) {
    const promises = this.strategies.map((strategy) => strategy.send(recipient, data));
    // Dùng allSettled để nếu 1 kênh lỗi (VD: SMS lỗi) thì kênh khác (Email) vẫn gửi bình thường
    await Promise.allSettled(promises);
  }
}
