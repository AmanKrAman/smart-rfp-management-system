import axios from 'axios';

const API_BASE_URL = 'http://localhost:4200';

export const api = axios.create({
  baseURL: API_BASE_URL,
//   withCredentials: false, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // No response received
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
