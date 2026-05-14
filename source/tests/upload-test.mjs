import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = path.resolve(__dirname, '../api/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.substring(0, eqIdx).trim();
  const value = trimmed.substring(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

// Dynamic import AFTER env is set (S3Client needs env vars at init)
const { generatePresignedUrl, validateUpload } = await import('../api/src/services/s3.service.js');

const BASE = 'http://localhost:3000/api';
const CDN = process.env.CDN_BASE_URL || 'https://unihub-cdn-worker.buicuong7954.workers.dev';

const log = (label, data) => console.log(`\n[${label}]`, JSON.stringify(data, null, 2));
const pass = (msg) => console.log(`  ✅ ${msg}`);
const fail = (msg) => console.log(`  ❌ ${msg}`);

// ─── Case 1: Validation ───
log('TEST 1', 'validateUpload — MIME hợp lệ');
try {
  validateUpload('test.jpg', 'image/jpeg', 500000);
  pass('image/jpeg 500KB hợp lệ');
} catch (e) { fail(e.message); }

log('TEST 2', 'validateUpload — MIME không hợp lệ');
try {
  validateUpload('test.gif', 'image/gif', 500000);
  fail('Đáng lẽ phải reject image/gif');
} catch (e) { pass(`Rejected: ${e.message}`); }

log('TEST 3', 'validateUpload — Ảnh > 10MB');
try {
  validateUpload('big.jpg', 'image/jpeg', 11 * 1024 * 1024);
  fail('Đáng lẽ phải reject ảnh > 10MB');
} catch (e) { pass(`Rejected: ${e.message}`); }

log('TEST 4', 'validateUpload — PDF 15MB hợp lệ');
try {
  validateUpload('doc.pdf', 'application/pdf', 15 * 1024 * 1024);
  pass('PDF 15MB hợp lệ');
} catch (e) { fail(e.message); }

log('TEST 5', 'validateUpload — PDF > 20MB');
try {
  validateUpload('big.pdf', 'application/pdf', 21 * 1024 * 1024);
  fail('Đáng lẽ phải reject PDF > 20MB');
} catch (e) { pass(`Rejected: ${e.message}`); }

log('TEST 6', 'validateUpload — Video > 50MB');
try {
  validateUpload('big.mp4', 'video/mp4', 51 * 1024 * 1024);
  fail('Đáng lẽ phải reject video > 50MB');
} catch (e) { pass(`Rejected: ${e.message}`); }

// ─── Case 2: Generate presigned URL ───
log('TEST 7', 'generatePresignedUrl — ảnh');
try {
  const result = await generatePresignedUrl('user-123', 'photo.jpg', 'image/jpeg', 500000);
  pass('Tạo presigned URL thành công');
  console.log(`    uploadUrl: ${result.uploadUrl.substring(0, 80)}...`);
  console.log(`    objectKey: ${result.objectKey}`);
  console.log(`    cdnUrl:    ${result.cdnUrl}`);
  if (result.objectKey.startsWith('users/user-123/original/')) pass('Path đúng: users/user-123/original/');
  else fail('Path sai');
  if (result.cdnProcessed && result.cdnProcessed.thumb && result.cdnProcessed.medium && result.cdnProcessed.large) {
    pass('cdnProcessed có thumb/medium/large');
    console.log(`    thumb:  ${result.cdnProcessed.thumb.substring(0, 60)}...`);
    console.log(`    medium: ${result.cdnProcessed.medium.substring(0, 60)}...`);
    console.log(`    large:  ${result.cdnProcessed.large.substring(0, 60)}...`);
  } else fail('cdnProcessed thiếu hoặc null');
} catch (e) { fail(e.message); }

log('TEST 8', 'generatePresignedUrl — PDF');
try {
  const result = await generatePresignedUrl('user-456', 'report.pdf', 'application/pdf', 2000000);
  pass('Tạo presigned URL PDF thành công');
  console.log(`    objectKey: ${result.objectKey}`);
  if (result.objectKey.startsWith('users/user-456/documents/') && result.objectKey.endsWith('.pdf')) pass('Path PDF đúng: documents/');
  else fail('Path PDF sai');
  if (result.cdnProcessed === null) pass('PDF: cdnProcessed = null (không resize)');
  else fail(`PDF: cdnProcessed đáng lẽ phải null, nhận: ${JSON.stringify(result.cdnProcessed)}`);
} catch (e) { fail(e.message); }

log('TEST 9', 'generatePresignedUrl — CSV');
try {
  const result = await generatePresignedUrl('user-789', 'data.csv', 'text/csv', 100000);
  pass('Tạo presigned URL CSV thành công');
  console.log(`    objectKey: ${result.objectKey}`);
  if (result.objectKey.startsWith('users/user-789/documents/') && result.objectKey.endsWith('.csv')) pass('Path CSV đúng: documents/');
  else fail('Path CSV sai');
} catch (e) { fail(e.message); }

log('TEST 10', 'generatePresignedUrl — Video');
try {
  const result = await generatePresignedUrl('user-123', 'clip.mp4', 'video/mp4', 3000000);
  pass('Tạo presigned URL video thành công');
  console.log(`    objectKey: ${result.objectKey}`);
  if (result.objectKey.startsWith('users/user-123/videos/')) pass('Path video đúng: videos/');
  else fail('Path video sai');
} catch (e) { fail(e.message); }

// ─── API test (cần backend chạy) ───
console.log('\n══════════════════════════════════════════');
console.log('API Tests (cần backend chạy trên localhost:3000)');
console.log('══════════════════════════════════════════');

const apiTest = async () => {
  // Login
  log('API-1', 'Đăng nhập lấy token');
  try {
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@unihub.com', password: 'admin123' }),
    });
    const loginData = await loginRes.json();
    if (loginRes.ok) {
      pass('Login OK');
      const token = loginData.data.token;
      console.log(`    role: ${loginData.data.user.role}`);

      // Get presigned URL
      log('API-2', 'POST /api/uploads/presigned');
      const presignRes = await fetch(`${BASE}/uploads/presigned`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ filename: 'test.jpg', mimeType: 'image/jpeg', size: 1000 }),
      });
      const presignData = await presignRes.json();
      if (presignRes.ok) {
        pass('Presigned URL OK');
        console.log(`    uploadUrl: ${presignData.data.uploadUrl.substring(0, 60)}...`);
        console.log(`    cdnUrl:    ${presignData.data.cdnUrl}`);

        // Upload thẳng lên S3
        log('API-3', 'Upload file lên S3 qua presigned URL');
        const testBuffer = Buffer.from('FAKE_JPEG_DATA');
        const uploadRes = await fetch(presignData.data.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'image/jpeg' },
          body: testBuffer,
        });
        if (uploadRes.ok) {
          pass('Upload OK — S3 accepted');
          console.log(`    Chờ 5s cho Lambda resize...`);

          // Check CDN
          await new Promise(r => setTimeout(r, 5000));
          log('API-4', `Check CDN: ${presignData.data.cdnUrl}`);
          const cdnRes = await fetch(presignData.data.cdnUrl);
          console.log(`    Status: ${cdnRes.status}`);
          if (cdnRes.ok) pass('CDN accessible');
          else console.log(`    (Expected - fake JPEG, S3 may reject)`);

          // Check CDN processed 
          const uuid = presignData.data.objectKey.split('/').pop().replace(/\.[^.]+$/, '');
          const userId = presignData.data.objectKey.split('/')[1];
          const thumbUrl = `${CDN}/users/${userId}/processed/thumb/${uuid}.webp`;
          log('API-5', `Check processed thumb: ${thumbUrl}`);
          const thumbRes = await fetch(thumbUrl);
          console.log(`    Status: ${thumbRes.status}`);
          if (thumbRes.ok) pass('Lambda đã resize — thumb tồn tại trên CDN!');
          else console.log(`    Lambda chưa resize hoặc file fake`);
        } else {
          fail(`Upload failed: ${uploadRes.status}`);
        }
      } else {
        fail(`Presigned API: ${presignData.message}`);
      }
    } else {
      fail(`Login: ${loginData.message}`);
      console.log('   Thử email/password khác hoặc kiểm tra DB');
    }
  } catch (e) {
    fail(`API test error: ${e.message}`);
  }
};

// Kiểm tra backend trước khi gọi API
const checkBackend = async () => {
  try {
    const res = await fetch('http://localhost:3000/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      await apiTest();
    }
  } catch {
    console.log('\n⚠️  Backend chưa chạy. Start bằng:');
    console.log('   cd source/api && npm run dev');
    console.log('   Sau đó chạy lại script này.');
  }
};

// Tạo file test ảnh thật để upload manual test
console.log('\n══════════════════════════════════════════');
console.log('MANUAL TEST (upload ảnh thật)');
console.log('══════════════════════════════════════════');
console.log('1. Start backend:  cd source/api && npm run dev');
console.log('2. Login:          curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d \'{"email":"admin@unihub.com","password":"..."}\'');
console.log('3. Get presigned:  curl -X POST http://localhost:3000/api/uploads/presigned -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d \'{"filename":"photo.jpg","mimeType":"image/jpeg","size":500000}\'');
console.log('4. Upload to S3:   curl -X PUT "<uploadUrl>" -H "Content-Type: image/jpeg" --data-binary @photo.jpg');
console.log('5. Check CDN:      Mở browser: <cdnUrl>');
console.log('6. Check resize:   Vào S3 Console -> users/<id>/processed/');
console.log('7. Check Lambda:   CloudWatch -> /aws/lambda/unihub-image-processor');

await checkBackend();
