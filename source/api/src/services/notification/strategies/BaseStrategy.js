export default class BaseStrategy {
  /**
   * Phương thức chung cho tất cả các chiến lược (Email, Telegram, SMS...)
   * @param {Object} recipient - Thông tin người nhận
   * @param {Object} data - Dữ liệu thông báo
   */
  async send(recipient, data) {
    throw new Error('Bạn phải override lại phương thức send() trong Strategy con');
  }
}
