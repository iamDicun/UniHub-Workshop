import { listFailedJobs, retryJob } from '../services/job.service.js';

export const getFailedJobs = async (req, res) => {
  try {
    const jobs = await listFailedJobs();
    res.json({ status: 'success', data: jobs });
  } catch (error) {
    console.error('[Jobs] Lỗi khi lấy danh sách DLQ:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi server' });
  }
};

export const retryFailedJob = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await retryJob(id);
    res.json(result);
  } catch (error) {
    console.error('[Jobs] Lỗi khi retry job:', error);
    res.status(400).json({ status: 'error', message: error.message || 'Lỗi server' });
  }
};
