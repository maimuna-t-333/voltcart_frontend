import { create } from 'zustand';

interface User { id:string; name:string; email:string; role:'customer'|'admin'; }
interface AuthStore {
  user:User|null; accessToken:string|null; isLoading:boolean;
  setAuth:(user:User,token:string)=>void;
  clearAuth:()=>void; setLoading:(v:boolean)=>void;
}

export const useAuthStore = create<AuthStore>()((set)=>({
  user:null, accessToken:null, isLoading:true,
  setAuth:(user,accessToken)=>set({user,accessToken,isLoading:false}),
  clearAuth:()=>set({user:null,accessToken:null,isLoading:false}),
  setLoading:(isLoading)=>set({isLoading}),
}));
