import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example API call functions
export const locationService = {
  getAll: () => apiClient.get('/locations/'),
  getById: (id: number) => apiClient.get(`/locations/${id}/`),
  create: (data: any) => apiClient.post('/locations/', data),
  update: (id: number, data: any) => apiClient.put(`/locations/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/locations/${id}/`),
};

export default apiClient;
