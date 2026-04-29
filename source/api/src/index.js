import app from './app.js';
import { connectRedis } from './config/redis.js';
import { connectRabbitMQ } from './config/rabbitmq.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectRedis();
  await connectRabbitMQ();
  
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer();
