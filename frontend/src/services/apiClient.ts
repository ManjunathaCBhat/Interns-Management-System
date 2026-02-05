// src/services/apiClient.ts
// import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// const apiClient: AxiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor - Add auth token
// apiClient.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = localStorage.getItem('ilm_token');
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle errors
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       // Unauthorized - clear token and redirect to login
//       localStorage.removeItem('ilm_token');
//       localStorage.removeItem('ilm_user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;


// src/services/apiClient.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("ilm_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ✅ Handle unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ilm_token");
      localStorage.removeItem("ilm_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
