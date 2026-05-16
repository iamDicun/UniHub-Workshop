/**
 * Workshop AI Generation Prompt
 *
 * Sends to DeepSeek along with cleaned PDF text.
 * Requests structured JSON matching the workshop form schema.
 */
export const buildWorkshopPrompt = (cleanedText) => {
  return `Bạn là trợ lý tạo workshop cho trường đại học. Dựa trên nội dung tài liệu bên dưới, hãy trích xuất thông tin để tạo một workshop.

Trả về CHỈ một JSON object (không markdown, không giải thích) theo schema này:

{
  "title": "Tiêu đề workshop (tiếng Việt, ngắn gọn, hấp dẫn)",
  "description": "Mô tả chi tiết workshop bằng HTML (dùng thẻ <p>, <ul>, <li>, <strong>, <em>). 2-4 đoạn văn. Bao gồm: nội dung chính, lợi ích, đối tượng tham gia.",
  "capacity": số_nguyên_dương (số lượng chỗ, mặc định 50 nếu không rõ),
  "price": số (VNĐ, mặc định 0 nếu miễn phí),
  "start_time": "ISO 8601 datetime (dự đoán thời gian bắt đầu nếu không có, mặc định 7 ngày sau hiện tại, 8:00 sáng)",
  "end_time": "ISO 8601 datetime (dự đoán thời gian kết thúc, mặc định sau start_time 3 tiếng)",
  "location": "Địa điểm tổ chức (nếu có trong tài liệu, nếu không để chuỗi rỗng)",
  "speaker": "Tên diễn giả (nếu có trong tài liệu, nếu không để chuỗi rỗng)"
}

QUAN TRỌNG:
- Chỉ trả về JSON, không thêm bất kỳ text nào khác
- Tất cả text tiếng Việt có dấu đầy đủ
- description phải là HTML hợp lệ
- start_time và end_time phải là ISO 8601 hợp lệ (vd: "2026-05-23T08:00:00.000Z")

NỘI DUNG TÀI LIỆU:
${cleanedText}`;
};
