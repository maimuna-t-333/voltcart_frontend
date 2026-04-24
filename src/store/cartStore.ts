import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem { productId:string; variantSku:string; name:string; image:string; price:number; quantity:number; }
interface CartStore {
  items: CartItem[]; couponCode:string|null; discount:number;
  addItem:(item:CartItem)=>void; removeItem:(sku:string)=>void;
  updateQty:(sku:string,qty:number)=>void; applyCoupon:(code:string,discount:number)=>void;
  clearCart:()=>void; getTotal:()=>number; getCount:()=>number;
}

export const useCartStore = create<CartStore>()(persist((set,get) => ({
  items:[], couponCode:null, discount:0,
  addItem:(item)=>set(s=>{
    const ex=s.items.find(i=>i.variantSku===item.variantSku);
    if(ex) return {items:s.items.map(i=>i.variantSku===item.variantSku?{...i,quantity:i.quantity+item.quantity}:i)};
    return {items:[...s.items,item]};
  }),
  removeItem:(sku)=>set(s=>({items:s.items.filter(i=>i.variantSku!==sku)})),
  updateQty:(sku,qty)=>set(s=>({items:s.items.map(i=>i.variantSku===sku?{...i,quantity:qty}:i)})),
  applyCoupon:(code,discount)=>set({couponCode:code,discount}),
  clearCart:()=>set({items:[],couponCode:null,discount:0}),
  getTotal:()=>{const s=get();return s.items.reduce((n,i)=>n+i.price*i.quantity,0)-s.discount;},
  getCount:()=>get().items.reduce((n,i)=>n+i.quantity,0),
}),{name:'tv-cart'}));
