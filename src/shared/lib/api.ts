import axios, { AxiosError } from 'axios';

import { useAuthStore } from '~/features/auth/store/auth-state';
import { useLoadingStore } from '~/features/loading/store/loading-store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  useLoadingStore.getState().setLoading(true);
  return config;
});

api.interceptors.response.use(
  (res) => {
    useLoadingStore.getState().setLoading(false);
    return res;
  },
  async (err: AxiosError) => {
    useLoadingStore.getState().setLoading(false);
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/refresh')) {
      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        if (refreshResponse.status === 200 && err.config) {
          return api(err.config); // 요청 재시도
        }
      } catch {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(new Error(err.message || 'Request failed'));
  }
);

export default api;
