import { getRedisClient } from '../config/redis.js';

const CACHE_PREFIX = 'workshop:';

// Default durations if not set in env
const DEFAULT_NEW_DURATION = 3600; 
const DEFAULT_EVENT_WINDOW = 1800;

export const calculateCacheTTL = (workshop) => {
  const now = new Date();
  const createdAt = new Date(workshop.created_at);
  const startTime = new Date(workshop.start_time);
  const endTime = new Date(workshop.end_time);

  const newDuration = process.env.CACHE_WORKSHOP_NEW_DURATION 
    ? parseInt(process.env.CACHE_WORKSHOP_NEW_DURATION, 10) 
    : DEFAULT_NEW_DURATION;

  const eventWindow = process.env.CACHE_WORKSHOP_EVENT_WINDOW 
    ? parseInt(process.env.CACHE_WORKSHOP_EVENT_WINDOW, 10) 
    : DEFAULT_EVENT_WINDOW;

  let maxTTL = 0;

  // Window 1: Newly created
  const createdWindowEnd = new Date(createdAt.getTime() + newDuration * 1000);
  if (now < createdWindowEnd) {
    const ttl = Math.floor((createdWindowEnd - now) / 1000);
    maxTTL = Math.max(maxTTL, ttl);
  }

  // Window 2: Event time +/- 30 mins
  const eventWindowStart = new Date(startTime.getTime() - eventWindow * 1000);
  const eventWindowEnd = new Date(endTime.getTime() + eventWindow * 1000);

  if (now >= eventWindowStart && now <= eventWindowEnd) {
    const ttl = Math.floor((eventWindowEnd - now) / 1000);
    maxTTL = Math.max(maxTTL, ttl);
  }

  return maxTTL;
};

export const getCachedWorkshop = async (workshopId) => {
  const client = getRedisClient();
  if (!client?.isOpen) return null;

  try {
    const data = await client.get(`${CACHE_PREFIX}${workshopId}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Redis GET error:', error);
  }
  return null;
};

export const setCachedWorkshop = async (workshop) => {
  const client = getRedisClient();
  if (!client?.isOpen) return;

  const ttl = calculateCacheTTL(workshop);
  if (ttl > 0) {
    try {
      await client.setEx(`${CACHE_PREFIX}${workshop.id}`, ttl, JSON.stringify(workshop));
    } catch (error) {
      console.error('Redis SETEX error:', error);
    }
  }
};

export const deleteCachedWorkshop = async (workshopId) => {
  const client = getRedisClient();
  if (!client?.isOpen) return;

  try {
    await client.del(`${CACHE_PREFIX}${workshopId}`);
  } catch (error) {
    console.error('Redis DEL error:', error);
  }
};
