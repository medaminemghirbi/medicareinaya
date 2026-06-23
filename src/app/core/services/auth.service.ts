import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { UserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb = inject(SupabaseService).client;
  private router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly userProfile = signal<UserProfile | null>(null);
  readonly loading = signal(true);

  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.userProfile()?.role === 'admin');

  constructor() {
    // On app start: restore session from localStorage and load profile
    this.sb.auth.getSession()
      .then(async ({ data: { session } }) => {
        try {
          this.currentUser.set(session?.user ?? null);
          if (session?.user) await this.loadProfile(session.user.id);
        } finally {
          this.loading.set(false);
        }
      })
      .catch(() => this.loading.set(false));

    // Only handle logout here — login() handles profile loading after sign-in
    this.sb.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
      if (!session?.user) this.userProfile.set(null);
    });
  }

  // Returns the profile so the login component can navigate based on role immediately
  async login(email: string, password: string): Promise<UserProfile | null> {
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) return null;
    this.currentUser.set(data.user);
    const profile = await this.loadProfile(data.user.id);
    return profile;
  }

  async register(email: string, password: string, profile: Partial<UserProfile>): Promise<void> {
    const { error } = await this.sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: profile.first_name ?? '',
          last_name: profile.last_name ?? '',
          phone: profile.phone ?? '',
        },
      },
    });
    if (error) throw error;
  }

  logout(): void {
    this.sb.auth.signOut().catch(() => {});
    this.currentUser.set(null);
    this.userProfile.set(null);
    this.router.navigate(['/']);
  }

  private async loadProfile(uid: string): Promise<UserProfile | null> {
    const { data } = await this.sb.from('users').select('*').eq('id', uid).single();
    const profile = (data as UserProfile) ?? null;
    this.userProfile.set(profile);
    return profile;
  }
}
