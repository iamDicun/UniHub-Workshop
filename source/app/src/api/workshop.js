import apiClient from './client';

// Lấy danh sách workshop
export const getAssignedWorkshops = async () => {
  try {
    const response = await apiClient.get('/workshops'); 
    return response.data.data.workshops || []; 
  } catch (error) {
    throw error;
  }
};

// Gửi một Check-in online trực tiếp lên server
// data là registration_id từ QR code
export const checkInStudent = async (workshopId, qrData) => {
  try {
    const response = await apiClient.post('/checkins', {
      registration_id: qrData,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Đồng bộ danh sách check-in offline lên server
export const syncOfflineCheckins = async (offlineQueue) => {
  let syncedCount = 0;
  let failedCount = 0;

  for (const checkin of offlineQueue) {
    try {
      await apiClient.post('/checkins', {
        registration_id: checkin.qrData,
        offline_scanned_at: checkin.timestamp,
      });
      syncedCount++;
    } catch (error) {
      failedCount++;
    }
  }

  return { success: true, syncedCount, failedCount };
};
