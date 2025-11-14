import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Optional: Logging for development
if (import.meta.env.DEV) {
  apiClient.interceptors.request.use(config => {
    console.log(`🔗 Axios Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  });

  apiClient.interceptors.response.use(
    response => {
      console.log(`✅ Axios Response: ${response.status} ${response.config.url}`);
      return response;
    },
    error => {
      console.error(`❌ Axios Error: ${error.config?.url}`, error.message);
      return Promise.reject(error);
    }
  );
}

export default apiClient;
