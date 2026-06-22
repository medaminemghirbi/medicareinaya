import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, where, getDoc, getDocs
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product, isLowStock, isNearExpiration, shouldHavePromotion } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private firestore = inject(Firestore);
  private col = collection(this.firestore, 'products');

  getAll(): Observable<Product[]> {
    return collectionData(query(this.col, orderBy('created_at', 'desc')), { idField: 'id' }) as Observable<Product[]>;
  }

  getByCategory(categoryId: string): Observable<Product[]> {
    return collectionData(
      query(this.col, where('category_id', '==', categoryId), where('status', '==', 'active')),
      { idField: 'id' }
    ) as Observable<Product[]>;
  }

  getFeatured(): Observable<Product[]> {
    return collectionData(
      query(this.col, where('status', '==', 'active'), orderBy('created_at', 'desc')),
      { idField: 'id' }
    ) as Observable<Product[]>;
  }

  async getById(id: string): Promise<Product | null> {
    const snap = await getDoc(doc(this.firestore, 'products', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } as Product : null;
  }

  async add(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const enriched = this.enrichProduct(data);
    await addDoc(this.col, { ...enriched, created_at: serverTimestamp(), updated_at: serverTimestamp() });
  }

  async update(id: string, data: Partial<Product>): Promise<void> {
    const enriched = this.enrichProduct(data as Product);
    await updateDoc(doc(this.firestore, 'products', id), { ...enriched, updated_at: serverTimestamp() });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'products', id));
  }

  async getLowStock(): Promise<Product[]> {
    const snap = await getDocs(query(this.col, where('stock_quantity', '<=', 2)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
  }

  private enrichProduct(p: Partial<Product>): Partial<Product> {
    if (p.purchase_price) {
      p.selling_price = p.purchase_price * 1.2;
    }
    if (p.expiration_date) {
      p.has_promotion = shouldHavePromotion(p as Product);
      p.promotion_discount = p.has_promotion ? 20 : 0;
    }
    return p;
  }
}
