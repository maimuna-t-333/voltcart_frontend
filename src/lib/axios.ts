import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL:         `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(res=>res, async err=>{
  const orig = err.config;
  if (err.response?.status===401 && !orig._retry) {
    orig._retry = true;
    try {
      const {data} = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,{},{withCredentials:true});
      useAuthStore.getState().setAuth(data.data.user, data.data.accessToken);
      orig.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api(orig);
    } catch { useAuthStore.getState().clearAuth(); }
  }
  return Promise.reject(err);
});

export default api;
