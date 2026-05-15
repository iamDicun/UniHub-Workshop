import { createSyncJob, getAllSyncJobs } from '../repositories/user.repository.js';
import { publishUserSyncJob } from '../queue/userSync.producer.js';

export const syncUsers = async (req, res, next) => {
  try {
    const { fileKey, isImmediate } = req.body;
    const adminId = req.user ? req.user.id : null;

    if (!fileKey) {
      return res.status(400).json({ status: 'error', message: 'Thiếu fileKey' });
    }

    const immediate = Boolean(isImmediate);

    // 1. Tạo job trong database
    const job = await createSyncJob(fileKey, immediate, adminId);

    // 2. Kích hoạt queue nếu yêu cầu chạy ngay
    if (immediate) {
      await publishUserSyncJob(job.id, fileKey, true);
    } else {
      console.log(`[Sync] Job ${job.id} được tạo và chờ chạy ban đêm.`);
    }

    res.status(200).json({
      status: 'success',
      data: {
        jobId: job.id,
        status: 'Pending',
        isImmediate: immediate,
        message: immediate 
          ? 'Đã gửi yêu cầu đồng bộ. Đang xử lý.' 
          : 'Đã lưu yêu cầu đồng bộ. Sẽ thực hiện vào ban đêm.'
      }
    });

  } catch (error) {
    console.error('[Sync] Lỗi khi tạo yêu cầu đồng bộ:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
  }
};

export const getSyncJobs = async (req, res, next) => {
  try {
    const jobs = await getAllSyncJobs();
    res.status(200).json({
      status: 'success',
      data: jobs
    });
  } catch (error) {
    console.error('[Sync] Lỗi khi lấy danh sách job đồng bộ:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
  }
};

