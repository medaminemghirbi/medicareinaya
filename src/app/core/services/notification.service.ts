import { Injectable, inject, signal } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { AppNotification } from '../models/notification.model';
import { Product, isLowStock, isNearExpiration, shouldHavePromotion } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private sb = inject(SupabaseService).client;
  readonly unreadCount = signal(0);

  getAll(): Observable<AppNotification[]> {
    return from(
      this.sb.from('notifications').select('*').order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as AppNotification[])
    );
  }

  getUnread(): Observable<AppNotification[]> {
    return from(
      this.sb.from('notifications').select('*').eq('read', false).order('created_at', { ascending: false })
        .then(({ data }) => (data ?? []) as AppNotification[])
    );
  }

  async markRead(id: string): Promise<void> {
    await this.sb.from('notifications').update({ read: true }).eq('id', id);
  }

  async markAllRead(): Promise<void> {
    await this.sb.from('notifications').update({ read: true }).eq('read', false);
  }

  async delete(id: string): Promise<void> {
    await this.sb.from('notifications').delete().eq('id', id);
  }

  async checkProductAlerts(products: Product[]): Promise<void> {
    for (const p of products) {
      if (!p.id) continue;
      if (isLowStock(p)) await this.addIfNotExists({ type: 'low_stock', title: 'Stock faible', message: `Le stock de "${p.name_fr}" est de ${p.stock_quantity} unités`, product_id: p.id, read: false });
      if (isNearExpiration(p)) await this.addIfNotExists({ type: 'near_expiration', title: 'Expiration proche', message: `"${p.name_fr}" expire bientôt`, product_id: p.id, read: false });
      if (shouldHavePromotion(p)) await this.addIfNotExists({ type: 'promotion', title: 'Promotion activée', message: `Promotion 20% activée pour "${p.name_fr}"`, product_id: p.id, read: false });
    }
  }

  private async addIfNotExists(n: Omit<AppNotification, 'id' | 'created_at'>): Promise<void> {
    const { data } = await this.sb.from('notifications').select('id').eq('product_id', n.product_id ?? '').eq('type', n.type).limit(1);
    if (data && data.length > 0) return;
    await this.sb.from('notifications').insert(n);
  }
}
