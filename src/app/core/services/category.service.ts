import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private firestore = inject(Firestore);
  private col = collection(this.firestore, 'categories');

  getAll(): Observable<Category[]> {
    return collectionData(query(this.col, orderBy('created_at', 'desc')), { idField: 'id' }) as Observable<Category[]>;
  }

  async add(data: Omit<Category, 'id' | 'created_at'>): Promise<void> {
    await addDoc(this.col, { ...data, created_at: serverTimestamp() });
  }

  async update(id: string, data: Partial<Category>): Promise<void> {
    await updateDoc(doc(this.firestore, 'categories', id), data);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'categories', id));
  }
}
