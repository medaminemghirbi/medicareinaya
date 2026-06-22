export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id?: string;
  category_id: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
  description_ar: string;
  description_fr: string;
  description_en: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  manufacture_date?: string;
  expiration_date?: string;
  images: string[];
  status: ProductStatus;
  has_promotion?: boolean;
  promotion_discount?: number;
  created_at?: Date;
  updated_at?: Date;
}

export function computeSellingPrice(purchasePrice: number): number {
  return purchasePrice * 1.2;
}

export function isLowStock(product: Product): boolean {
  return product.stock_quantity <= 2;
}

export function isNearExpiration(product: Product): boolean {
  if (!product.expiration_date) return false;
  const days = Math.ceil((new Date(product.expiration_date).getTime() - Date.now()) / 86400000);
  return days > 0 && days <= 30;
}

export function shouldHavePromotion(product: Product): boolean {
  if (!product.expiration_date) return false;
  const days = Math.ceil((new Date(product.expiration_date).getTime() - Date.now()) / 86400000);
  return days > 0 && days <= 60;
}
