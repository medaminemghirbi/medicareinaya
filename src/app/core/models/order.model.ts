export interface OrderItem {
  productId: string;
  name_fr: string;
  name_en: string;
  name_ar: string;
  image: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface DeliveryAddress {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  wilaya: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id?: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_method: 'cod';
  delivery_address: DeliveryAddress;
  notes?: string;
  created_at: any;
  updated_at: any;
}
