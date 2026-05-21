export interface Variant {
  _id: string;
  sku: string;
  color: string;
  storage: string;
  price: number;
  stock: number;
  images: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  basePrice: number;
  comparePrice?: number;
  variants: Variant[];
  specs: { key: string; value: string }[];
  isFeatured: boolean;
  status: string;
  avgRating: number;
  reviewCount: number;
  soldCount: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface CartItem {
  productId: string;
  variantSku: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string };
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  status: string;
  total: number;
  items: CartItem[];
  createdAt: string;
}
