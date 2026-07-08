import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://backend-cub0et7yf-juaniedlpincha-6054s-projects.vercel.app/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hotelflow_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});