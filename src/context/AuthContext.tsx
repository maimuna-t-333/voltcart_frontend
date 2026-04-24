'use client';
import { createContext, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({children}:{children:React.ReactNode}) {
  const { setAuth, clearAuth } = useAuthStore();
  useEffect(()=>{
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,{},{withCredentials:true})
      .then(({data})=>setAuth(data.data.user, data.data.accessToken))
      .catch(()=>clearAuth());
  },[]);
  return <>{children}</>;
}
