import {
  getAdminStats,
  getWorkshopOccupancy,
  getRecentCheckins,
} from '../repositories/workshop.repository.js';

export const getDashboardStats = async () => {
  const [stats, occupancy, recentCheckins] = await Promise.all([
    getAdminStats(),
    getWorkshopOccupancy(),
    getRecentCheckins(8),
  ]);

  return {
    ...stats,
    occupancy,
    recentCheckins,
  };
};
