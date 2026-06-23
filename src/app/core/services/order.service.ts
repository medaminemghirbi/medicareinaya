import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private sb = inject(SupabaseService).client;

  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await this.sb.from('orders').insert(order).select('id').single();
    if (error) throw error;
    return data.id;
  }

  getByUser(userId: string): Observable<Order[]> {
    return from(
      this.sb.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as Order[])
    );
  }

  getAll(): Observable<Order[]> {
    return from(
      this.sb.from('orders').select('*').order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as Order[])
    );
  }

  async updateStatus(id: string, status: Order['status']): Promise<void> {
    const { error } = await this.sb.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }
}
