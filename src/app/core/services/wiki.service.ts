import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { WikiPage } from '../models/wiki.model';

@Injectable({ providedIn: 'root' })
export class WikiService {
  private sb = inject(SupabaseService).client;

  getAll(): Observable<WikiPage[]> {
    return from(
      this.sb.from('wiki_pages').select('*').order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as WikiPage[])
    );
  }

  getPublished(): Observable<WikiPage[]> {
    return from(
      this.sb.from('wiki_pages').select('*').eq('status', 'published').order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as WikiPage[])
    );
  }

  async getById(id: string): Promise<WikiPage | null> {
    const { data } = await this.sb.from('wiki_pages').select('*').eq('id', id).single();
    return data as WikiPage ?? null;
  }

  async add(data: Omit<WikiPage, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const slug = this.toSlug(data.title_en || data.title_fr);
    const { error } = await this.sb.from('wiki_pages').insert({ ...data, slug });
    if (error) throw error;
  }

  async update(id: string, data: Partial<WikiPage>): Promise<void> {
    const { error } = await this.sb.from('wiki_pages').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.sb.from('wiki_pages').delete().eq('id', id);
    if (error) throw error;
  }

  private toSlug(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60);
  }
}
