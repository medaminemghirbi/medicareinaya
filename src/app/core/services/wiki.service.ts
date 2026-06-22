import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { WikiPage } from '../models/wiki.model';

@Injectable({ providedIn: 'root' })
export class WikiService {
  private firestore = inject(Firestore);
  private col = collection(this.firestore, 'wiki_pages');

  getAll(): Observable<WikiPage[]> {
    return collectionData(query(this.col, orderBy('created_at', 'desc')), { idField: 'id' }) as Observable<WikiPage[]>;
  }

  getPublished(): Observable<WikiPage[]> {
    return collectionData(
      query(this.col, where('published', '==', true), orderBy('created_at', 'desc')),
      { idField: 'id' }
    ) as Observable<WikiPage[]>;
  }

  async add(data: Omit<WikiPage, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const slug = this.toSlug(data.title_en || data.title_fr);
    await addDoc(this.col, { ...data, slug, created_at: serverTimestamp(), updated_at: serverTimestamp() });
  }

  async update(id: string, data: Partial<WikiPage>): Promise<void> {
    await updateDoc(doc(this.firestore, 'wiki_pages', id), { ...data, updated_at: serverTimestamp() });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'wiki_pages', id));
  }

  private toSlug(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60);
  }
}
