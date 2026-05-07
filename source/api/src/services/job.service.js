import { getFailedJobs, getFailedJobById, updateFailedJobStatus } from '../repositories/job.repository.js';
import { publishRegistrationEvent } from '../queue/notification.producer.js';

export const listFailedJobs = async () => {
  return await getFailedJobs();
};

export const retryJob = async (jobId) => {
  const job = await getFailedJobById(jobId);
  if (!job) {
    throw new Error('Không tìm thấy job');
  }

  // Khôi phục payload và reset retryCount
  const payload = job.payload;
  payload.retryCount = 0; 
  
  // Đẩy lại vào RabbitMQ
  await publishRegistrationEvent(payload.data);
  
  // Cập nhật trạng thái trong database
  await updateFailedJobStatus(jobId, 'retried');
  
  return { status: 'success', message: 'Đã đưa vào hàng đợi xử lý lại' };
};
