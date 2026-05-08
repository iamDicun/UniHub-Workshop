import apiClient from './client';
import { setToken, setUserInfo, removeToken, removeUserInfo } from '../utils/storage';

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    
    // Lưu token và thông tin user xuống storage
    await setToken(token);
    await setUserInfo(user);
    
    return { token, user };
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await removeToken();
    await removeUserInfo();
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
  }
};
