import { getPresignedUrl, confirmUpload } from '../api/client';

export const uploadToS3 = (uploadUrl, file, mimeType, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', mimeType);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      console.log('[Upload] S3 response status:', xhr.status);
      if (xhr.status === 200) {
        console.log('[Upload] Success - file uploaded to S3');
        resolve();
      } else {
        console.error('[Upload] S3 error body:', xhr.responseText);
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      console.error('[Upload] Network error - CORS or S3 unreachable');
      reject(new Error('Network error - check S3 CORS config'));
    };

    xhr.ontimeout = () => {
      console.error('[Upload] Timeout');
      reject(new Error('Upload timeout'));
    };

    console.log('[Upload] Sending file to S3...', { uploadUrl: uploadUrl.substring(0, 80) + '...', mimeType, fileSize: file.size });
    xhr.send(file);
  });
};

export const uploadWithPresigned = async (file, onProgress) => {
  const filename = file.name;
  const mimeType = file.type || 'application/octet-stream';
  const size = file.size;

  console.log('[Upload] Getting presigned URL...', { filename, mimeType, size });

  const { uploadUrl, objectKey, cdnUrl, cdnProcessed, fileId } = await getPresignedUrl(
    filename,
    mimeType,
    size,
  );

  console.log('[Upload] Got presigned URL', { fileId, objectKey, cdnUrl, cdnProcessed });

  await uploadToS3(uploadUrl, file, mimeType, onProgress);

  if (fileId) {
    try {
      await confirmUpload(fileId);
      console.log('[Upload] File confirmed in DB', { fileId });
    } catch (err) {
      console.warn('[Upload] Confirm skipped:', err.message);
    }
  }

  console.log('[Upload] Done!', { objectKey, cdnUrl });
  return { objectKey, cdnUrl, cdnProcessed, fileId };
};

