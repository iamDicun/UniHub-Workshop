import app from './app.js';
import { connectRedis } from './config/redis.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { startNotificationWorker } from './queue/notification.worker.js';
import { startUserSyncWorker } from './queue/userSync.worker.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectRedis();
  await connectRabbitMQ();
  
  // Khá»Ÿi Ä‘á»™ng cÃ¡c Worker cháº¡y ngáº§m
  startNotificationWorker();
  startUserSyncWorker();
  
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer();
