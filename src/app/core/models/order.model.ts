export interface OrderItem {
  productId: string;
  name_fr: string;
  image?: string;
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
  user_id: string;
  user_email: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_method: 'cod';
  delivery_address: DeliveryAddress;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
