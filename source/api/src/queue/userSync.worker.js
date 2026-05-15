import { getChannel } from '../config/rabbitmq.js';
import { getS3ReadStream } from '../services/s3.service.js';
import {
  updateSyncJobStatus,
  truncateStagingUsers,
  copyUsersFromStream,
  mergeStagingUsersIntoMain
} from '../repositories/user.repository.js';
import cron from 'node-cron';

const QUEUE_NAME = 'user_sync_queue';

export const startUserSyncWorker = async () => {
  const channel = getChannel();
  if (!channel) return;

  await channel.assertQueue(QUEUE_NAME, { durable: true });

  // Limit processing 1 file at a time
  channel.prefetch(1);

  console.log(`[*] Waiting for messages in ${QUEUE_NAME}. To exit press CTRL+C`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      const { jobId, fileKey, isImmediate } = data;

      try {
        console.log(`[Worker] Processing Sync Job: ${jobId}`);
        await updateSyncJobStatus(jobId, 'Processing');

        // 1. Download stream từ S3
        console.log(`[Worker - ${jobId}] fetching S3 object: ${fileKey}`);
        const readStream = await getS3ReadStream(fileKey);

        // 2. Truncate staging
        console.log(`[Worker - ${jobId}] Truncating staging users...`);
        await truncateStagingUsers();

        // 3. Postgres Copy Stream 
        console.log(`[Worker - ${jobId}] Copying stream to staging table...`);
        await copyUsersFromStream(readStream);

        // 4. Lệnh Merge sang DB chính
        console.log(`[Worker - ${jobId}] Merging staging to main table...`);
        await mergeStagingUsersIntoMain();

        // Hoàn thành
        await updateSyncJobStatus(jobId, 'Completed');
        console.log(`[Worker] Completed sync job: ${jobId}`);

        channel.ack(msg);
      } catch (error) {
        console.error(`[Worker] Failed sync job ${jobId}:`, error);
        await updateSyncJobStatus(jobId, 'Failed', error.message);
        
        // Trả lại queue hoặc quăng đi tùy setup (ở đây ack luôn vì đã failed rạch ròi, ko retry tự động để tránh loop lỗi file csv)
        channel.ack(msg);
      }
    }
  });

  // Setup cron job nếu có cron config lấy pending messages cho chạy ban đêm
  const syncSchedule = process.env.SYNC_CRON_SCHEDULE;
  if (syncSchedule) {
    cron.schedule(syncSchedule, async () => {
      console.log(`[Cron] Triggering pending sync jobs (Schedule: ${syncSchedule})`);
      const { getPendingSyncJobs } = await import('../repositories/user.repository.js');
      const { publishUserSyncJob } = await import('./userSync.producer.js');
      
      try {
        const pendingJobs = await getPendingSyncJobs();
        console.log(`[Cron] Found ${pendingJobs.length} pending jobs`);
        for (const job of pendingJobs) {
          await publishUserSyncJob(job.id, job.file_key, false);
        }
      } catch (err) {
        console.error('[Cron] Failed to process scheduled sync jobs:', err);
      }
    });
    console.log(`[Worker] Cron job for Sync Jobs scheduled at ${syncSchedule}`);
  }
};
