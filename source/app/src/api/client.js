import axios from 'axios';
import { getToken, removeToken, removeUserInfo } from '../utils/storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';

const apiClient = axios.create({
  // Sử dụng biến môi trường hoặc fallback
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.7:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Thêm Token vào mỗi request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Xử lý lỗi (ví dụ Token hết hạn)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Hết hạn hoặc sai token
        await removeToken();
        await removeUserInfo();
        Alert.alert('Phiên hết hạn', 'Vui lòng đăng nhập lại.');
        router.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
