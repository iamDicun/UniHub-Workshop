const TOKEN_KEY = 'unihub_token';
const USER_KEY = 'unihub_user';

export const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getHomeForRole = (role) => {
  if (role === 'admin') {
    return '/admin';
  }
  if (role === 'staff') {
    return '/staff';
  }
  return '/student';
};

export const getRoleLabel = (role) => {
  if (role === 'admin') {
    return 'Quản trị';
  }
  if (role === 'staff') {
    return 'Nhân sự';
  }
  return 'Sinh viên';
};
