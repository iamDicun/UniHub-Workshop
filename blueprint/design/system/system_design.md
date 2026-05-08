# Tài liệu Thiết kế Hệ thống (System Design Document)

## 1. Kiến trúc tổng thể và Lý do lựa chọn

Hệ thống UniHub Workshop được thiết kế theo kiến trúc **Distributed Modular Monolith (Monolith phân tán kết hợp Micro-services linh hoạt)** chạy hoàn toàn trên nền tảng container hóa (Docker).

**Lý do lựa chọn kiến trúc này:**

- Hệ thống dự kiến phải chịu tải trọng đột biến với khoảng 12.000 sinh viên truy cập trong 10 phút đầu khi mở đăng ký. Một instance Node.js đơn lẻ không thể xử lý nổi lượng connection này. Do đó, việc chia nhỏ thành nhiều instance Node.js đặt sau một Load Balancer là giải pháp bắt buộc.
    
- Phân tách rõ ràng các tầng giao tiếp: Cụm mạng biên (Cloudflare), Cụm điều phối (Nginx), Cụm ứng dụng (Node.js) và Cụm dữ liệu/Bộ đệm (PostgreSQL, Redis, RabbitMQ). Điều này giúp hệ thống dễ dàng mở rộng cục bộ ở bất kỳ nút thắt cổ chai nào mà không cần đập bỏ xây lại.
    

---

## 2. Các thành phần chính và Cách chúng giao tiếp

Hệ thống bao gồm các container giao tiếp với nhau theo luồng dữ liệu một chiều (Unidirectional Data Flow) từ ngoài vào trong:

1. **Cloudflare (Lớp bảo vệ biên):**
    
    - **Vai trò:** Hoạt động như một WAF (Tường lửa ứng dụng web) miễn phí.
        
    - **Giao tiếp:** Hứng toàn bộ traffic từ Internet, cản lọc DDoS, botnet trước khi chuyển tiếp (forward) các request hợp lệ đến IP của server.
        
2. **Nginx (Load Balancer & Reverse Proxy):**
    
    - **Vai trò:** Đứng trước các ứng dụng Node.js để cân bằng tải (Load Balancing) theo thuật toán Round Robin.
        
    - **Giao tiếp:** Nhận request từ Cloudflare và phân phát đều luồng truy cập của sinh viên vào 3-4 instance Node.js đang chạy song song.
        
3. **Cụm Ứng dụng Node.js (Application API):**
    
    - **Vai trò:** Xử lý logic nghiệp vụ cốt lõi (Đăng ký, kiểm tra ghế, check-in).
        
    - **Giao tiếp:** Truy vấn dữ liệu với PostgreSQL, giao tiếp với Redis để check rate-limit, và đẩy message vào RabbitMQ.
        
4. **Redis (In-memory Cache & Rate Limiter):**
    
    - **Vai trò:** Bộ nhớ đệm tốc độ cao. Giải quyết bài toán rate limiting (ngăn chặn spam request liên tục) và cache các dữ liệu ít thay đổi (như danh sách workshop).
        
5. **RabbitMQ (Message Broker):**
    
    - **Vai trò:** Giải quyết bài toán hàng đợi cho các tác vụ nặng hoặc bất đồng bộ (Thanh toán có phí, Gửi Email thông báo).
        
6. **PostgreSQL (Database lõi):**
    
    - **Vai trò:** Lưu trữ trạng thái vĩnh viễn, đảm bảo tính toàn vẹn (ACID) cho dữ liệu ghế ngồi và thanh toán.
        

---

## 3. Quản trị rủi ro: Khi một phần sự cố, hệ thống ảnh hưởng ra sao?

Tài liệu phân tích kịch bản chịu lỗi (Fault Tolerance) của hệ thống:

- **Trường hợp lỗi 1 instance Node.js:** Nginx sẽ tự động phát hiện instance này bị ngỏm (thông qua health check) và lập tức điều hướng traffic sang các instance Node.js còn lại. Người dùng hầu như không cảm nhận được sự gián đoạn.
    
- **Trường hợp Redis gặp sự cố:** Tính năng Rate Limiting sẽ bị vô hiệu hóa, hệ thống mất lá chắn chống spam ở tầng ứng dụng. Các truy vấn cache sẽ rơi thẳng (cache miss) vào PostgreSQL, làm tăng tải cho Database, nhưng hệ thống nghiệp vụ chính vẫn hoạt động.
    
- **Trường hợp RabbitMQ gặp sự cố:** Luồng đăng ký có phí và thông báo email sẽ bị nghẽn. Tuy nhiên, luồng xem danh sách workshop và đăng ký workshop miễn phí (những tác vụ đồng bộ) vẫn diễn ra bình thường.
    
- **Trường hợp Cổng thanh toán (Bên thứ 3) lỗi liên tục:** RabbitMQ sẽ đóng vai trò như một bộ đệm (Circuit Breaker). Các request thanh toán được giữ lại trong hàng đợi. Trạng thái giao dịch của sinh viên sẽ hiển thị "Đang xử lý". Luồng đăng ký không bị sập và các tính năng khác vẫn hoạt động bình thường.
    

---

## 4. Các giải pháp kỹ thuật, Quy trình & Trade-off (Sự đánh đổi)

### A. Giải quyết bài toán Tải đột biến & Nghiệp vụ

- **Giải pháp:** Sử dụng nhiều instance Node.js, Redis (Rate Limiting) và RabbitMQ (Hàng đợi thanh toán).
    
- **Trade-off:**
    
    - **Đánh đổi Độ phức tạp:** Quản lý cấu hình, log và giám sát nhiều container phức tạp hơn rất nhiều so với một cục Monolith đơn giản.
        
    - **Đánh đổi Nhất quán (Consistency) vs Hiệu năng (Latency):** Việc đẩy thanh toán vào RabbitMQ biến hệ thống sang trạng thái Nhất quán cuối cùng (Eventual Consistency) ở luồng giao dịch, người dùng phải đợi một lúc mới thấy kết quả, đổi lại hệ thống không bị nghẽn băng thông.
        

### B. Giải quyết bài toán Đảm bảo Chất lượng Code & Maintainability

- **Giải pháp:** Sử dụng bộ công cụ kiểm soát mã nguồn nghiêm ngặt:
    
    - **ESLint + Prettier:** Ép chuẩn format code đồng nhất.
        
    - **Husky:** Chặn đứng (hook) quá trình commit nếu code vi phạm rule hoặc bị lỗi.
        
    - **Jest + Supertest:** Bộ test tự động các kịch bản API cốt lõi.
        
- **Trade-off:** Đánh đổi **Tốc độ phát triển ban đầu** lấy **Sự ổn định dài hạn**. Giai đoạn đầu, thành viên trong team sẽ cảm thấy "khó chịu" vì liên tục bị Husky và ESLint từ chối commit, tiến độ dường như chậm lại. Tuy nhiên, về sau sẽ triệt tiêu được rủi ro vỡ logic hoặc conflict code.
    

### C. Giải quyết bài toán Triển khai (CI/CD Pipeline)

- **Giải pháp:** Toàn bộ cấu hình hệ thống (Node.js, Postgres, Redis, RabbitMQ) được đóng gói qua `Dockerfile` và `docker-compose.yml`.
    
    - **CI (Continuous Integration):** Dùng **GitHub Actions** tự động chạy Jest test và kiểm duyệt Pull Request.
        
    - **CD (Continuous Deployment):** Deploy tự động lên **VPS ARM của Oracle Cloud**.
        
- **Luồng vận hành chuẩn cho Team:** Thành viên viết code $\rightarrow$ Chạy Jest Test cục bộ $\rightarrow$ Husky check syntax $\rightarrow$ Commit $\rightarrow$ Tạo Pull Request $\rightarrow$ GitHub Actions tự động check $\rightarrow$ Merge vào nhánh `main` $\rightarrow$ Hệ thống tự động pull về VPS và `docker-compose up -d --build` để khởi chạy lại.
    
- **Trade-off:** Pipeline tự động phụ thuộc vào dịch vụ đám mây miễn phí (GitHub Actions, Oracle Cloud). Nếu máy chủ Oracle bị thu hồi (do chính sách tài khoản Free) hoặc GitHub Actions bảo trì, luồng CD tự động sẽ đứt gãy, buộc team phải SSH vào server tự deploy bằng tay.