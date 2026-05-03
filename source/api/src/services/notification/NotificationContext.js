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
    const results = await Promise.allSettled(this.strategies.map((strategy) => strategy.send(recipient, data)));
    
    // Tìm các kênh bị lỗi
    const failures = results.filter(r => r.status === 'rejected');
    
    if (failures.length > 0) {
      // Throw lỗi của kênh đầu tiên để Worker bắt được và kích hoạt cơ chế Retry
      throw failures[0].reason;
    }
  }
}
