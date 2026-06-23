import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private sb = inject(SupabaseService).client;

  getAll(): Observable<Category[]> {
    return from(
      this.sb.from('categories').select('*').order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as Category[])
    );
  }

  async getById(id: string): Promise<Category | null> {
    const { data } = await this.sb.from('categories').select('*').eq('id', id).single();
    return data as Category ?? null;
  }

  async add(data: Omit<Category, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.sb.from('categories').insert(data);
    if (error) throw error;
  }

  async update(id: string, data: Partial<Category>): Promise<void> {
    const { error } = await this.sb.from('categories').update(data).eq('id', id);
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.sb.from('categories').delete().eq('id', id);
    if (error) throw error;
  }
}
