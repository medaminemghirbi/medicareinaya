import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, RouterLinkActive, TranslatePipe, ThemeToggleComponent, LanguageSwitcherComponent],
  template: `
    <div class="flex h-screen overflow-hidden" style="background: var(--bg)">

      <!-- Sidebar -->
      <aside
        class="flex flex-col border-r transition-all duration-300 shrink-0"
        [class.w-64]="sidebarOpen()"
        [class.w-16]="!sidebarOpen()"
        style="background: var(--bg-card); border-color: var(--border)"
      >
        <!-- Logo -->
        <div class="flex items-center gap-3 h-16 px-4 border-b" style="border-color: var(--border)">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background: linear-gradient(135deg, var(--primary), var(--accent))">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          @if (sidebarOpen()) {
            <span class="text-base font-bold" style="color: var(--text-primary)">
              Medicare<span style="color: var(--primary)">Inaya</span>
            </span>
          }
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto py-4 px-2">
          @for (link of navLinks; track link.path) {
            <a
              [routerLink]="link.path"
              [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
              routerLinkActive="active"
              class="sidebar-link mb-1"
              [class.justify-center]="!sidebarOpen()"
              [attr.title]="!sidebarOpen() ? (link.label | translate) : null"
            >
              <span class="shrink-0 w-5 h-5" [innerHTML]="link.icon"></span>
              @if (sidebarOpen()) {
                <span>{{ link.label | translate }}</span>
              }
            </a>
          }
        </nav>

        <!-- Bottom -->
        <div class="p-3 border-t" style="border-color: var(--border)">
          <button
            (click)="auth.logout()"
            class="sidebar-link w-full"
            [class.justify-center]="!sidebarOpen()"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            @if (sidebarOpen()) {
              <span>{{ 'NAV.LOGOUT' | translate }}</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Topbar -->
        <header
          class="h-16 flex items-center justify-between px-6 border-b shrink-0"
          style="background: var(--bg-card); border-color: var(--border)"
        >
          <div class="flex items-center gap-3">
            <button
              (click)="sidebarOpen.set(!sidebarOpen())"
              class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <svg class="w-5 h-5" style="color: var(--text-secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <span class="font-semibold text-base" style="color: var(--text-primary)">{{ 'ADMIN.TITLE' | translate }}</span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Notifications -->
            <a routerLink="/admin/notifications" class="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg class="w-5 h-5" style="color: var(--text-secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span class="notif-dot"></span>
            </a>

            <app-language-switcher />
            <app-theme-toggle />

            <!-- Avatar -->
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style="background: linear-gradient(135deg, var(--primary), var(--accent))">
              {{ initials() }}
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  protected auth = inject(AuthService);
  protected sidebarOpen = signal(true);

  protected initials() {
    const p = this.auth.userProfile();
    if (!p) return 'A';
    return `${p.first_name[0] ?? ''}${p.last_name[0] ?? ''}`.toUpperCase();
  }

  protected navLinks = [
    {
      path: '/admin/dashboard', exact: true, label: 'ADMIN.NAV.DASHBOARD',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>'
    },
    {
      path: '/admin/products', label: 'ADMIN.NAV.PRODUCTS',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>'
    },
    {
      path: '/admin/categories', label: 'ADMIN.NAV.CATEGORIES',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>'
    },
    {
      path: '/admin/blog', label: 'ADMIN.NAV.BLOG',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>'
    },
    {
      path: '/admin/wiki', label: 'ADMIN.NAV.WIKI',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>'
    },
    {
      path: '/admin/contacts', label: 'ADMIN.NAV.CONTACTS',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>'
    },
    {
      path: '/admin/notifications', label: 'ADMIN.NAV.NOTIFICATIONS',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>'
    },
    {
      path: '/admin/orders', label: 'ADMIN.NAV.ORDERS',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>'
    },
  ];
}
