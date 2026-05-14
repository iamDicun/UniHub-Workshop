# UniHub-Workshop — S3 Upload (Presigned URL) Todo list (chỉ dẫn cụ thể)

Mục tiêu: triển khai upload file (ảnh/video) cho UniHub-Workshop bằng S3 + presigned PUT URL, xử lý ảnh bằng Lambda (sharp), và phân phối bằng Cloudflare CDN. Tất cả bước sau là bắt buộc và dùng công cụ/thiết lập cụ thể được ghi rõ.

## Phase 1 — Chuẩn bị AWS (bắt buộc)

- [ ] Tạo IAM user `unihub-backend-uploader` (không dùng root). Gán policy chỉ đủ cho S3 PutObject/GetObject/ListBucket và Lambda invoke (nếu cần).
- [ ] Bật MFA cho root/admin account theo chính sách công ty.
- [ ] Tạo Access Key cho `unihub-backend-uploader` và lưu `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` vào secrets môi trường của backend (ví dụ GitHub Actions / .env trên server).
- [ ] Chọn region cụ thể: `ap-southeast-1` (Singapore).

## Phase 2 — Tạo bucket S3 (bắt buộc)

- [ ] Tạo bucket tên `unihub-workshop-uploads` ở `ap-southeast-1`.
- [ ] Block all public access (Bucket > Permissions > Block public access: ON).
- [ ] Bật Versioning (Bucket > Properties > Versioning: Enable).
- [ ] Kích hoạt Server-side encryption mặc định: `AES-256` hoặc `aws:kms` (chọn `AES-256` nếu chưa có KMS key).

### Cấu trúc object keys (bắt buộc)

- `users/{userId}/original/{uuid}.{ext}`
- `users/{userId}/processed/{size}/{uuid}.webp` (size = `thumb`, `medium`, `large`)
- `users/{userId}/videos/{uuid}.{ext}`

### CORS (bắt buộc, cấu hình chính xác)

Thêm CORS cho bucket (JSON):

```
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "GET", "HEAD"],
        "AllowedOrigins": ["http://localhost:3000", "http://localhost:19006", "http://localhost:5173"],
        "ExposeHeaders": ["ETag"]
    }
]
```

## Phase 3 — Backend API (bắt buộc)

Ghi chú: backend hiện tại dùng Node.js (xem `source/api/src`). Thực hiện theo các bước sau:

- [ ] Cài SDK AWS v3 trên backend:

```
cd source/api
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
```

- [ ] Thêm biến môi trường (production & development): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=ap-southeast-1`, `S3_BUCKET_NAME=unihub-workshop-uploads`, `CDN_BASE_URL=https://cdn.unihub.example`.

- [ ] Tạo endpoint bảo mật: `POST /api/uploads/presigned` (middleware auth hiện có `auth.middleware.js` phải được dùng). Request body: `{ "filename": "img.png", "mimeType": "image/png", "size": 12345 }`.

- [ ] Validation server-side (bắt buộc):
    - Xác thực JWT bằng `auth.middleware.js`.
    - Chỉ chấp nhận MIME: `image/png`, `image/jpeg`, `image/webp`, `video/mp4`.
    - Kích thước tối đa: ảnh 10 MB, video 50 MB.
    - Sinh `uuid` bằng `uuid.v4()` và đặt `objectKey = users/{userId}/original/{uuid}{ext}`.

- [ ] Tạo presigned PUT URL bằng `@aws-sdk/s3-request-presigner` với `expiresIn: 60` (60 giây). Sử dụng `PutObjectCommand`.

- [ ] Response (JSON): `{ "uploadUrl": "...", "objectKey": "...", "cdnUrl": "${CDN_BASE_URL}/${objectKey}" }`.

## Phase 4 — Frontend upload (bắt buộc)

- [ ] FE gọi `POST /api/uploads/presigned` và nhận `uploadUrl`.
- [ ] FE upload bằng `XMLHttpRequest` để có progress events (khuyến nghị):

```
const xhr = new XMLHttpRequest();
xhr.open('PUT', uploadUrl);
xhr.setRequestHeader('Content-Type', mimeType);
xhr.upload.onprogress = (e) => { /* update progress */ };
xhr.send(file);
```

- [ ] Sau upload thành công, FE gọi backend (tuỳ chọn) để xác nhận xử lý async hoặc hiển thị tạm `cdnUrl` trả về trước đó.

## Phase 5 — Xử lý ảnh (AWS Lambda) (bắt buộc)

Chiến lược: dùng Lambda Node.js 18 với `sharp` đóng gói dưới dạng Lambda Layer (để giảm kích thước deployment) và trigger S3 `ObjectCreated:Put` cho folder `users/*/original/*`.

- [ ] Tạo Lambda function `unihub-image-processor` runtime `nodejs18.x`.
- [ ] Tạo Lambda Layer chứa `sharp` (build trên Amazon Linux compatible image) hoặc dùng container image có sẵn.
- [ ] Thiết lập S3 trigger: Event `s3:ObjectCreated:Put`, filter key prefix `users/` và suffix phù hợp (`.jpg,.jpeg,.png,.webp`).
- [ ] Logic resize (bắt buộc sizes):
    - `thumb` = 100x100 (crop center)
    - `medium` = 300x300 (fit inside)
    - `large` = 800x800 (fit inside)
    - Chuyển đổi đầu ra sang `webp` (quality 80) và upload vào `users/{userId}/processed/{size}/{uuid}.webp` với ACL private.

- [ ] Thiết lập retry and error logging (CloudWatch). Nếu xử lý thất bại, ghi record vào DynamoDB hoặc gửi message sang queue (tuỳ kế hoạch mở rộng).

## Phase 6 — Cloudflare CDN (bắt buộc)

Hướng dẫn rõ ràng:

- [ ] Tạo CDN hostname `cdn.unihub.example` trên Cloudflare.
- [ ] Origin: sử dụng S3 bucket public origin endpoint (nếu bucket private thì thiết lập Signed Origin Pulls/Worker; hướng đi hiện tại: sử dụng Cloudflare Worker để authenticated origin pull — nếu cần, tôi sẽ viết Worker cụ thể).
- [ ] Tạo CNAME `cdn.unihub.example` trỏ tới `unihub-workshop-uploads.s3.ap-southeast-1.amazonaws.com` (hoặc S3 website endpoint nếu cần header rewrite).
- [ ] Cache rules: Cache static images + long TTL (30 days) cho `/*/processed/*`.

## Phase 7 — Database metadata (bắt buộc)

- [ ] Tạo bảng `files` trên PostgreSQL (migrations) có schema sau.

```
create table public.files (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  object_key text not null,
  file_name text null,
  status text not null,
  created_at timestamp without time zone null default now(),
  mime_type text null,
  size bigint null,
  updated_at timestamp with time zone not null default now(),
  constraint files_pkey primary key (id),
  constraint files_object_key_unique unique (object_key),
  constraint fk_file_user foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint files_size_check check (
    (
      (size is null)
      or (size >= 0)
    )
  ),
  constraint files_status_check check (
    (
      status = any (
        array[
          'uploaded'::text,
          'processing'::text,
          'done'::text,
          'failed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_file_user on public.files using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_files_user_id on public.files using btree (user_id) TABLESPACE pg_default;
```

- [ ] Sau upload (hoặc sau Lambda xử lý), ghi record vào `files` với `processed=true` khi các bản resized đã có.

## Phase 8 — Bảo mật (bắt buộc)

- [ ] Presigned URL expire = 60s.
- [ ] Bucket private; chỉ truy cập qua presigned URL hoặc origin pull cấu hình trên Cloudflare.
- [ ] Server-side validate MIME và size (như Phase 3).
- [ ] Hạn chế quyền IAM cho `unihub-backend-uploader` chỉ tới các prefix `users/*` và chỉ cho phép `s3:PutObject`, `s3:PutObjectAcl`, `s3:GetObject`, `s3:ListBucket` trên prefix cần thiết.

## Phase 9 — Cleanup & Cost (bắt buộc)

- [ ] Lifecycle rule: chuyển object trong `users/*/original/` sang GLACIER/IA sau 30 ngày.
- [ ] Xoá các object temp (nếu có) sau 7 ngày.

## Phase 10 — CI/CD & Deployment (bắt buộc)

- [ ] Thêm secrets cho GitHub Actions: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `CDN_BASE_URL`.
- [ ] Tạo workflow triển khai Lambda (container hoặc zip) và deploy backend thay đổi cấu hình môi trường.

## Kiểm tra & xác nhận (bắt buộc)

- [ ] Test end-to-end: FE upload ảnh -> backend cấp presigned -> FE PUT lên S3 -> Lambda resize tự động -> resized files xuất hiện trên CDN URL.
- [ ] Test failure cases: upload MIME sai, quá kích thước, presigned bị expire.

---