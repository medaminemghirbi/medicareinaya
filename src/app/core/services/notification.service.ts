import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, where, getDocs
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AppNotification } from '../models/notification.model';
import { Product, isLowStock, isNearExpiration, shouldHavePromotion } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private firestore = inject(Firestore);
  private col = collection(this.firestore, 'notifications');

  readonly unreadCount = signal(0);

  getAll(): Observable<AppNotification[]> {
    return collectionData(query(this.col, orderBy('created_at', 'desc')), { idField: 'id' }) as Observable<AppNotification[]>;
  }

  getUnread(): Observable<AppNotification[]> {
    return collectionData(
      query(this.col, where('read', '==', false), orderBy('created_at', 'desc')),
      { idField: 'id' }
    ) as Observable<AppNotification[]>;
  }

  async markRead(id: string): Promise<void> {
    await updateDoc(doc(this.firestore, 'notifications', id), { read: true });
  }

  async markAllRead(): Promise<void> {
    const snap = await getDocs(query(this.col, where('read', '==', false)));
    const updates = snap.docs.map(d => updateDoc(d.ref, { read: true }));
    await Promise.all(updates);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'notifications', id));
  }

  async checkProductAlerts(products: Product[]): Promise<void> {
    for (const p of products) {
      if (isLowStock(p) && p.id) {
        await this.addIfNotExists({
          type: 'low_stock',
          title: 'Stock faible',
          message: `Le stock de "${p.name_fr}" est de ${p.stock_quantity} unités`,
          product_id: p.id,
          read: false,
        });
      }
      if (isNearExpiration(p) && p.id) {
        await this.addIfNotExists({
          type: 'near_expiration',
          title: 'Expiration proche',
          message: `"${p.name_fr}" expire bientôt`,
          product_id: p.id,
          read: false,
        });
      }
      if (shouldHavePromotion(p) && p.id) {
        await this.addIfNotExists({
          type: 'promotion',
          title: 'Promotion activée',
          message: `Promotion 20% activée pour "${p.name_fr}"`,
          product_id: p.id,
          read: false,
        });
      }
    }
  }

  private async addIfNotExists(n: Omit<AppNotification, 'id' | 'created_at'>): Promise<void> {
    if (n.product_id) {
      const existing = await getDocs(
        query(this.col, where('product_id', '==', n.product_id), where('type', '==', n.type))
      );
      if (!existing.empty) return;
    }
    await addDoc(this.col, { ...n, created_at: serverTimestamp() });
  }
}
