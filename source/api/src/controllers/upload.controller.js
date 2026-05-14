import { generatePresignedUrl } from '../services/s3.service.js';
import {
  insertFile,
  updateFileStatus,
  getFileById,
} from '../repositories/files.repository.js';

export const getPresignedUrl = async (req, res, next) => {
  try {
    const { filename, mimeType, size } = req.body;
    const userId = req.user.id;

    console.log('[Presigned] Request:', { userId, filename, mimeType, size });

    const result = await generatePresignedUrl(userId, filename, mimeType, size);

    const file = await insertFile({
      user_id: userId,
      object_key: result.objectKey,
      file_name: filename,
      status: 'uploaded',
      mime_type: mimeType,
      size,
    });

    console.log('[Presigned] File record created:', {
      fileId: file.id,
      objectKey: result.objectKey,
    });

    res.status(200).json({
      status: 'success',
      data: {
        fileId: file.id,
        uploadUrl: result.uploadUrl,
        objectKey: result.objectKey,
        cdnUrl: result.cdnUrl,
        cdnProcessed: result.cdnProcessed,
      },
    });
  } catch (error) {
    console.error('[Presigned] Error:', error.message);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const confirmUpload = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    const file = await getFileById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File khong ton tai' });
    }

    if (file.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Ban khong co quyen cap nhat file nay' });
    }

    const updated = await updateFileStatus(fileId, 'done');
    console.log('[Confirm] File status updated:', { fileId, status: 'done' });

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    console.error('[Confirm] Error:', error.message);
    next(error);
  }
};
