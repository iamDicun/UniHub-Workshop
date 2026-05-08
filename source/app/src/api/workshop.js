import apiClient from './client';

// Lấy danh sách workshop hôm nay hoặc workshop Staff đang được phân công
export const getAssignedWorkshops = async () => {
  try {
    // Tạm thời mock data để test App
    return [
      {
        id: 'ws1',
        title: 'Kỹ năng Viết CV & Phỏng vấn',
        speaker: 'Mr. John Doe',
        time: '08:00 - 11:30 | 15/05/2026',
        room: 'Hội trường A',
        status: 'ongoing',
        registeredCount: 150,
      },
      {
        id: 'ws2',
        title: 'Định hướng nghề nghiệp IT',
        speaker: 'Ms. Jane Smith',
        time: '13:00 - 16:30 | 15/05/2026',
        room: 'Phòng 204, Tòa B',
        status: 'upcoming',
        registeredCount: 80,
      }
    ];
    
    // Code gọi API thật:
    // const response = await apiClient.get('/workshops?role=staff'); 
    // return response.data;
  } catch (error) {
    throw error;
  }
};

// Gửi một Check-in online trực tiếp lên server
export const checkInStudent = async (workshopId, qrData) => {
  try {
    // Mock API
    return { success: true, message: 'Check-in thành công!', studentId: qrData };

    // Code thật:
    // const response = await apiClient.post(`/workshops/${workshopId}/checkin`, { qrData });
    // return response.data;
  } catch (error) {
    throw error;
  }
};

// Đồng bộ danh sách check-in offline lên server
export const syncOfflineCheckins = async (offlineQueue) => {
  try {
    // Mock API
    return { success: true, syncedCount: offlineQueue.length, failedCount: 0 };
    
    // Code thật:
    // const response = await apiClient.post('/workshops/checkin/batch', { checkins: offlineQueue });
    // return response.data;
  } catch (error) {
    throw error;
  }
};
