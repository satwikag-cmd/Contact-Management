import axios, { AxiosError } from 'axios';
import { type ApiErrorResponse } from '../types/api';
import { env } from '../utils/env';


export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Passes his security gate automatically on every request
    'X-API-Key': env.NEXT_PUBLIC_API_KEY, 
  },
});

// Request Interceptor: Inject Authorization tokens or multi-tenant headers dynamically
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('crm_session_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Flatten error schemas into standard ApiErrorResponse structures
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const fallbackError: ApiErrorResponse = {
      success: false,
      message: 'An unexpected system error occurred down-circuit.',
    };

    if (error.response?.data) {
      // Server returned a structural error message envelope
      return Promise.reject(error.response.data);
    }

    if (error.request) {
      fallbackError.message = 'No data validation handshake returned from backend servers.';
    }

    return Promise.reject(fallbackError);
  }
);