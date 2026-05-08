import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis connected'));

export const connectRedis = async (retryCount = 5) => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (err) {
    console.error(`Redis Connection Failed. Retries left: ${retryCount}`, err.message);
    if (retryCount > 0) {
      console.log('Retrying Redis in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectRedis(retryCount - 1);
    } else {
      console.error('Redis Connection failed after maximum retries');
    }
  }
};

export const getRedisClient = () => client;

export default client;
