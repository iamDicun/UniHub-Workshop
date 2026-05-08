import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@unihub_staff_token';
const OFFLINE_QUEUE_KEY = '@unihub_offline_queue';
const USER_INFO_KEY = '@unihub_user_info';

export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Lỗi khi lưu token:', error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Lỗi khi lấy token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Lỗi khi xóa token:', error);
  }
};

export const setUserInfo = async (user) => {
  try {
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Lỗi khi lưu thông tin user:', error);
  }
};

export const getUserInfo = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_INFO_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin user:', error);
    return null;
  }
};

export const removeUserInfo = async () => {
  try {
    await AsyncStorage.removeItem(USER_INFO_KEY);
  } catch (error) {
    console.error('Lỗi khi xóa thông tin user:', error);
  }
};

// --- Xử lý Check-in Offline Queue ---

export const getOfflineQueue = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Lỗi khi lấy queue offline:', error);
    return [];
  }
};

export const addOfflineCheckin = async (workshopId, qrData, timestamp) => {
  try {
    const queue = await getOfflineQueue();
    // Chống trùng lặp mã QR quét offline
    const isExist = queue.find(item => item.qrData === qrData && item.workshopId === workshopId);
    if (!isExist) {
      queue.push({
        workshopId,
        qrData,
        timestamp: timestamp || new Date().toISOString(),
        id: Math.random().toString(36).substring(7), // Tạo ID tạm thời
      });
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      return true; // Thêm thành công
    }
    return false; // Bị trùng
  } catch (error) {
    console.error('Lỗi khi lưu check-in offline:', error);
    return false;
  }
};

export const removeOfflineCheckins = async (idsToRemove) => {
  try {
    const queue = await getOfflineQueue();
    const newQueue = queue.filter(item => !idsToRemove.includes(item.id));
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
  } catch (error) {
    console.error('Lỗi khi xóa check-in offline:', error);
  }
};

export const clearOfflineQueue = async () => {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('Lỗi khi xóa toàn bộ queue offline:', error);
  }
};
