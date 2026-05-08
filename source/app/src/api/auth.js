import apiClient from './client';
import { setToken, setUserInfo, removeToken, removeUserInfo } from '../utils/storage';

export const login = async (email, password) => {
  try {
    // Tạm thời cho phép dùng tài khoản mock để Staff test tính năng Check-in Offline
    if (email === 'staff@university.edu' && password === '123456') {
      const mockToken = 'mock_jwt_token_for_staff';
      const mockUser = { name: 'Nguyễn Văn Staff', email, role: 'staff' };
      
      await setToken(mockToken);
      await setUserInfo(mockUser);
      return { token: mockToken, user: mockUser };
    }

    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
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
