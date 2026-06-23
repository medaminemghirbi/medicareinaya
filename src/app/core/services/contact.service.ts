import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { ContactRequest } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private sb = inject(SupabaseService).client;

  getAll(): Observable<ContactRequest[]> {
    return from(
      this.sb.from('contact_requests').select('*').order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as ContactRequest[])
    );
  }

  getNew(): Observable<ContactRequest[]> {
    return from(
      this.sb.from('contact_requests').select('*').eq('status', 'new').order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as ContactRequest[])
    );
  }

  async submit(data: Omit<ContactRequest, 'id' | 'status' | 'created_at'>): Promise<void> {
    const { error } = await this.sb.from('contact_requests').insert({ ...data, status: 'new' });
    if (error) throw error;
  }

  async updateStatus(id: string, status: ContactRequest['status']): Promise<void> {
    const { error } = await this.sb.from('contact_requests').update({ status }).eq('id', id);
    if (error) throw error;
  }
}
