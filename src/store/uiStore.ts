import { create } from 'zustand';
interface UIStore {
  isCartOpen:boolean; isChatOpen:boolean;
  openCart:()=>void; closeCart:()=>void; toggleChat:()=>void;
}
export const useUIStore = create<UIStore>()((set)=>({
  isCartOpen:false, isChatOpen:false,
  openCart:()=>set({isCartOpen:true}),
  closeCart:()=>set({isCartOpen:false}),
  toggleChat:()=>set(s=>({isChatOpen:!s.isChatOpen})),
}));
