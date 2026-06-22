import { Injectable, signal, inject, computed } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { UserProfile, UserRole } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly userProfile = signal<UserProfile | null>(null);
  readonly loading = signal(true);

  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.userProfile()?.role === 'admin');

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser.set(user);
      if (user) {
        await this.loadProfile(user.uid);
      } else {
        this.userProfile.set(null);
      }
      this.loading.set(false);
    });
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string, profile: Partial<UserProfile>): Promise<void> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await setDoc(doc(this.firestore, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email,
      role: 'client' as UserRole,
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      phone: profile.phone ?? '',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/']);
  }

  private async loadProfile(uid: string): Promise<void> {
    const snap = await getDoc(doc(this.firestore, 'users', uid));
    if (snap.exists()) {
      this.userProfile.set(snap.data() as UserProfile);
    }
  }
}
