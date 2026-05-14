import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

const BUCKET = process.env.S3_BUCKET_NAME || 'project-unihub-bucket';
const CDN_BASE_URL = process.env.CDN_BASE_URL || 'https://cdn.unihub.example';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'text/csv'];
const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOC_TYPES];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_DOC_SIZE = 20 * 1024 * 1024; // 20 MB

const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getExtension = (filename, mimeType) => {
  const ext = path.extname(filename).toLowerCase();
  if (ext) return ext;

  const extMap = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
    "application/pdf": ".pdf",
    "text/csv": ".csv",
  };
  return extMap[mimeType] || '';
};

const getMediaFolder = (mimeType) => {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'original';
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'videos';
  if (ALLOWED_DOC_TYPES.includes(mimeType)) return 'documents';
  return 'original';
};

export const validateUpload = (filename, mimeType, size) => {
  if (!filename || !mimeType || size === undefined || size === null) {
    throw buildError('filename, mimeType và size là bắt buộc', 400);
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw buildError(
      `MIME type khong hop le. Chi chap nhan: ${ALLOWED_MIME_TYPES.join(', ')}`,
      400,
    );
  }

  if (ALLOWED_IMAGE_TYPES.includes(mimeType) && size > MAX_IMAGE_SIZE) {
    throw buildError(
      `Kich thuoc anh toi da la ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      400,
    );
  }

  if (ALLOWED_VIDEO_TYPES.includes(mimeType) && size > MAX_VIDEO_SIZE) {
    throw buildError(
      `Kich thuoc video toi da la ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
      400,
    );
  }

  if (ALLOWED_DOC_TYPES.includes(mimeType) && size > MAX_DOC_SIZE) {
    throw buildError(
      `Kich thuoc tai lieu toi da la ${MAX_DOC_SIZE / 1024 / 1024}MB`,
      400,
    );
  }
};

export const generatePresignedUrl = async (
  userId,
  filename,
  mimeType,
  size,
) => {
  validateUpload(filename, mimeType, size);

  const uuid = uuidv4();
  const ext = getExtension(filename, mimeType);
  const mediaFolder = getMediaFolder(mimeType);
  const objectKey = `users/${userId}/${mediaFolder}/${uuid}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);

  return {
    uploadUrl,
    objectKey,
    cdnUrl: `${CDN_BASE_URL}/${objectKey}`,
    cdnProcessed: isImage
      ? {
          thumb: `${CDN_BASE_URL}/users/${userId}/processed/thumb/${uuid}.webp`,
          medium: `${CDN_BASE_URL}/users/${userId}/processed/medium/${uuid}.webp`,
          large: `${CDN_BASE_URL}/users/${userId}/processed/large/${uuid}.webp`,
        }
      : null,
    uuid,
  };
};
