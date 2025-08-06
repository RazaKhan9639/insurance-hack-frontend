// API Configuration
export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API Configuration for development fallback
export const getApiUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
}; 