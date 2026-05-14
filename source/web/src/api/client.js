import axios from 'axios';
import { clearSession, getToken } from '../utils/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const fetchWorkshops = async () => {
  const response = await apiClient.get('/workshops');
  return response.data;
};

export const createWorkshop = async (payload) => {
  const response = await apiClient.post('/workshops', payload);
  return response.data;
};

export const updateWorkshop = async (workshopId, payload) => {
  const response = await apiClient.put(`/workshops/${workshopId}`, payload);
  return response.data;
};

export const deleteWorkshop = async (workshopId) => {
  const response = await apiClient.delete(`/workshops/${workshopId}`);
  return response.data;
};

export const registerWorkshop = async (workshopId) => {
  const response = await apiClient.post(`/workshops/${workshopId}/register`);
  return response.data;
};

export const fetchWorkshopRegistrations = async (workshopId) => {
  const response = await apiClient.get(`/workshops/${workshopId}/registrations`);
  return response.data;
};

export const cancelRegistration = async (registrationId) => {
  const response = await apiClient.delete(`/registrations/${registrationId}`);
  return response.data;
};

export const checkIn = async (registrationId) => {
  const response = await apiClient.post('/checkins', {
    registration_id: registrationId,
  });
  return response.data;
};

export const fetchWorkshopStaff = async (workshopId) => {
  const response = await apiClient.get(`/workshops/${workshopId}/staff`);
  return response.data;
};

export const addWorkshopStaff = async (workshopId, email) => {
  const response = await apiClient.post(`/workshops/${workshopId}/staff`, { email });
  return response.data;
};

export const removeWorkshopStaff = async (workshopId, staffId) => {
  const response = await apiClient.delete(`/workshops/${workshopId}/staff/${staffId}`);
  return response.data;
};

// ============================
// FAILED JOBS API (Admin Only)
// ============================
export const getFailedJobs = async () => {
  const response = await apiClient.get('/failed-jobs');
  return response.data;
};

export const retryFailedJob = async (jobId) => {
  const response = await apiClient.post(`/failed-jobs/${jobId}/retry`);
  return response.data;
};

// ============================
// PAYMENTS API
// ============================
export const fetchMyPayments = async () => {
  const response = await apiClient.get('/payments/my-payments');
  return response.data;
};

export const fetchAdminPayments = async () => {
  const response = await apiClient.get('/payments');
  return response.data;
};

export const getPresignedUrl = async (filename, mimeType, size) => {
  const response = await apiClient.post('/uploads/presigned', {
    filename,
    mimeType,
    size,
  });
  return response.data.data;
};

export const confirmUpload = async (fileId) => {
  const response = await apiClient.put(`/uploads/${fileId}/confirm`);
  return response.data.data;
};

export default apiClient;
