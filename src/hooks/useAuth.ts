import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, accessToken, isLoading, setAuth, clearAuth } = useAuthStore();

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAuth(data.data.user, data.data.accessToken);
    toast.success(`Welcome back, ${data.data.user.name}!`);
    return data.data.user;
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setAuth(data.data.user, data.data.accessToken);
    toast.success('Account created successfully!');
    return data.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    clearAuth();
    toast.success('Logged out successfully');
  };

  return {
    user,
    accessToken,
    isLoading,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };
}

export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading]);

  return { user, isLoading };
}

export function useRequireAdmin() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login');
    else if (!isLoading && user?.role !== 'admin') router.push('/');
  }, [user, isLoading]);

  return { user, isLoading };
}
