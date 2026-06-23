import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Product, shouldHavePromotion } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private sb = inject(SupabaseService).client;

  getAll(): Observable<Product[]> {
    return from(
      this.sb.from('products').select('*').order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as Product[])
    );
  }

  getFeatured(): Observable<Product[]> {
    return from(
      this.sb.from('products').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(8)
        .then(({ data }) => (data ?? []) as Product[])
    );
  }

  getByCategory(categoryId: string): Observable<Product[]> {
    return from(
      this.sb.from('products').select('*').eq('category_id', categoryId).eq('status', 'active')
        .then(({ data }) => (data ?? []) as Product[])
    );
  }

  async getById(id: string): Promise<Product | null> {
    const { data } = await this.sb.from('products').select('*').eq('id', id).single();
    return data as Product ?? null;
  }

  async getLowStock(): Promise<Product[]> {
    const { data } = await this.sb.from('products').select('*').lte('stock_quantity', 2);
    return (data ?? []) as Product[];
  }

  async add(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const enriched = this.enrich(data);
    const { error } = await this.sb.from('products').insert(enriched);
    if (error) throw error;
  }

  async update(id: string, data: Partial<Product>): Promise<void> {
    const enriched = this.enrich(data as Product);
    const { error } = await this.sb.from('products').update({ ...enriched, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.sb.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  private enrich(p: Partial<Product>): Partial<Product> {
    if (p.purchase_price) p.selling_price = +(p.purchase_price * 1.2).toFixed(2);
    if (p.expiration_date) {
      p.has_promotion = shouldHavePromotion(p as Product);
      p.promotion_discount = p.has_promotion ? 20 : 0;
    }
    return p;
  }
}
