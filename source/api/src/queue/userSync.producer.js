import { getChannel } from '../config/rabbitmq.js';

const QUEUE_NAME = 'user_sync_queue';

export const publishUserSyncJob = async (jobId, fileKey, isImmediate) => {
  const channel = getChannel();
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
  });

  const payload = {
    jobId,
    fileKey,
    isImmediate,
    timestamp: new Date().toISOString(),
  };

  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });

  console.log(`[Producer] User sync job pushed to queue: ${jobId}`);
};
