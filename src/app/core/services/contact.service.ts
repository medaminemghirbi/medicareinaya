import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, addDoc, updateDoc,
  doc, serverTimestamp, query, orderBy, where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ContactRequest } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private firestore = inject(Firestore);
  private col = collection(this.firestore, 'contact_requests');

  getAll(): Observable<ContactRequest[]> {
    return collectionData(query(this.col, orderBy('created_at', 'desc')), { idField: 'id' }) as Observable<ContactRequest[]>;
  }

  getNew(): Observable<ContactRequest[]> {
    return collectionData(
      query(this.col, where('status', '==', 'new'), orderBy('created_at', 'desc')),
      { idField: 'id' }
    ) as Observable<ContactRequest[]>;
  }

  async submit(data: Omit<ContactRequest, 'id' | 'status' | 'created_at'>): Promise<void> {
    await addDoc(this.col, { ...data, status: 'new', created_at: serverTimestamp() });
  }

  async updateStatus(id: string, status: ContactRequest['status']): Promise<void> {
    await updateDoc(doc(this.firestore, 'contact_requests', id), { status });
  }
}
