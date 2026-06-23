import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { BlogArticle } from '../models/blog.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private sb = inject(SupabaseService).client;

  getAll(): Observable<BlogArticle[]> {
    return from(
      this.sb.from('blog_articles').select('*').order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as BlogArticle[])
    );
  }

  getPublished(): Observable<BlogArticle[]> {
    return from(
      this.sb.from('blog_articles').select('*').eq('status', 'published').order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as BlogArticle[])
    );
  }

  async getById(id: string): Promise<BlogArticle | null> {
    const { data } = await this.sb.from('blog_articles').select('*').eq('id', id).single();
    return data as BlogArticle ?? null;
  }

  async add(data: Omit<BlogArticle, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const slug = this.toSlug(data.title_en || data.title_fr);
    const { error } = await this.sb.from('blog_articles').insert({ ...data, slug });
    if (error) throw error;
  }

  async update(id: string, data: Partial<BlogArticle>): Promise<void> {
    const { error } = await this.sb.from('blog_articles').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.sb.from('blog_articles').delete().eq('id', id);
    if (error) throw error;
  }

  private toSlug(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60);
  }
}
