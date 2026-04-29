import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis connected'));

export const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
};

export const getRedisClient = () => client;

export default client;
