import { getDbStatus } from '../repositories/health.repository.js';

export const checkHealth = async () => {
  const dbStatus = await getDbStatus();
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
    },
  };
};
