import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BlogArticle } from '../models/blog.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private firestore = inject(Firestore);
  private col = collection(this.firestore, 'blog_articles');

  getAll(): Observable<BlogArticle[]> {
    return collectionData(query(this.col, orderBy('created_at', 'desc')), { idField: 'id' }) as Observable<BlogArticle[]>;
  }

  getPublished(): Observable<BlogArticle[]> {
    return collectionData(
      query(this.col, where('published', '==', true), orderBy('created_at', 'desc')),
      { idField: 'id' }
    ) as Observable<BlogArticle[]>;
  }

  async add(data: Omit<BlogArticle, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const slug = this.toSlug(data.title_en || data.title_fr);
    await addDoc(this.col, { ...data, slug, created_at: serverTimestamp(), updated_at: serverTimestamp() });
  }

  async update(id: string, data: Partial<BlogArticle>): Promise<void> {
    await updateDoc(doc(this.firestore, 'blog_articles', id), { ...data, updated_at: serverTimestamp() });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'blog_articles', id));
  }

  private toSlug(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60);
  }
}
