import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, addDoc, updateDoc,
  doc, query, where, orderBy, serverTimestamp, getDocs
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private firestore = inject(Firestore);
  private col = collection(this.firestore, 'orders');

  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const ref = await addDoc(this.col, {
      ...order,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return ref.id;
  }

  getByUser(userId: string): Observable<Order[]> {
    return collectionData(
      query(this.col, where('userId', '==', userId), orderBy('created_at', 'desc')),
      { idField: 'id' }
    ) as Observable<Order[]>;
  }

  getAll(): Observable<Order[]> {
    return collectionData(
      query(this.col, orderBy('created_at', 'desc')),
      { idField: 'id' }
    ) as Observable<Order[]>;
  }

  async updateStatus(id: string, status: Order['status']): Promise<void> {
    await updateDoc(doc(this.firestore, 'orders', id), {
      status,
      updated_at: serverTimestamp(),
    });
  }
}
