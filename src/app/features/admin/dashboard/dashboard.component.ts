import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ContactService } from '../../../core/services/contact.service';
import { NotificationService } from '../../../core/services/notification.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Page title -->
      <div>
        <h1 class="text-2xl font-extrabold" style="color: var(--text-primary)">{{ 'ADMIN.DASHBOARD.TITLE' | translate }}</h1>
        <p style="color: var(--text-secondary)">{{ 'ADMIN.DASHBOARD.SUBTITLE' | translate }}</p>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (stat of stats(); track stat.label) {
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium" style="color: var(--text-secondary)">{{ stat.label | translate }}</span>
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" [style.background]="stat.bg">{{ stat.icon }}</div>
            </div>
            <div class="text-3xl font-extrabold mb-1" style="color: var(--text-primary)">{{ stat.value }}</div>
            <div class="text-xs" [style.color]="stat.alertColor ?? 'var(--text-secondary)'">{{ stat.sub | translate }}</div>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Alerts -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Low stock -->
          @if (lowStockProducts().length) {
            <div class="card p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold" style="color: var(--text-primary)">
                  ⚠️ {{ 'ADMIN.DASHBOARD.LOW_STOCK' | translate }}
                </h3>
                <a routerLink="/admin/products" class="text-sm" style="color: var(--primary)">{{ 'ADMIN.VIEW_ALL' | translate }}</a>
              </div>
              <div class="space-y-2">
                @for (p of lowStockProducts().slice(0, 5); track p.id) {
                  <div class="flex items-center justify-between p-3 rounded-xl" style="background: var(--bg)">
                    <span class="text-sm font-medium" style="color: var(--text-primary)">{{ p.name_fr }}</span>
                    <span class="badge badge-warning">{{ p.stock_quantity }} {{ 'PRODUCT.UNITS' | translate }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Expiring -->
          @if (expiringProducts().length) {
            <div class="card p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold" style="color: var(--text-primary)">
                  📅 {{ 'ADMIN.DASHBOARD.EXPIRING' | translate }}
                </h3>
                <a routerLink="/admin/products" class="text-sm" style="color: var(--primary)">{{ 'ADMIN.VIEW_ALL' | translate }}</a>
              </div>
              <div class="space-y-2">
                @for (p of expiringProducts().slice(0, 5); track p.id) {
                  <div class="flex items-center justify-between p-3 rounded-xl" style="background: var(--bg)">
                    <span class="text-sm font-medium" style="color: var(--text-primary)">{{ p.name_fr }}</span>
                    <span class="badge badge-danger">{{ p.expiration_date }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Product distribution chart (simple bars) -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" style="color: var(--text-primary)">{{ 'ADMIN.DASHBOARD.DISTRIBUTION' | translate }}</h3>
            <div class="space-y-2">
              @for (bar of categoryBars(); track bar.name) {
                <div>
                  <div class="flex justify-between text-xs mb-1" style="color: var(--text-secondary)">
                    <span>{{ bar.name }}</span>
                    <span>{{ bar.count }}</span>
                  </div>
                  <div class="h-2 rounded-full overflow-hidden" style="background: var(--border)">
                    <div class="h-full rounded-full transition-all duration-700" style="background: linear-gradient(90deg, var(--primary), var(--accent))" [style.width.%]="bar.pct"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Recent contacts -->
        <div class="space-y-4">
          <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold" style="color: var(--text-primary)">📬 {{ 'ADMIN.DASHBOARD.RECENT_CONTACTS' | translate }}</h3>
              <a routerLink="/admin/contacts" class="text-sm" style="color: var(--primary)">{{ 'ADMIN.VIEW_ALL' | translate }}</a>
            </div>
            @if (contacts().length) {
              <div class="space-y-3">
                @for (c of contacts().slice(0, 5); track c.id) {
                  <div class="flex items-start gap-3 p-3 rounded-xl" style="background: var(--bg)">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style="background: linear-gradient(135deg, var(--primary), var(--accent))">
                      {{ c.first_name[0] }}{{ c.last_name[0] }}
                    </div>
                    <div class="min-w-0">
                      <div class="text-sm font-medium truncate" style="color: var(--text-primary)">{{ c.first_name }} {{ c.last_name }}</div>
                      <div class="text-xs truncate" style="color: var(--text-secondary)">{{ c.email }}</div>
                      <span [class]="c.status === 'new' ? 'badge badge-primary' : 'badge'" style="font-size:0.65rem; padding: 0.1rem 0.5rem">{{ c.status }}</span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-sm text-center py-4" style="color: var(--text-secondary)">{{ 'ADMIN.DASHBOARD.NO_CONTACTS' | translate }}</p>
            }
          </div>

          <!-- Quick actions -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" style="color: var(--text-primary)">{{ 'ADMIN.DASHBOARD.QUICK_ACTIONS' | translate }}</h3>
            <div class="grid grid-cols-2 gap-2">
              @for (action of quickActions; track action.path) {
                <a [routerLink]="action.path" class="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all hover:scale-105" style="background: var(--bg)">
                  <span class="text-2xl">{{ action.icon }}</span>
                  <span class="text-xs font-medium" style="color: var(--text-secondary)">{{ action.label | translate }}</span>
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private productSvc = inject(ProductService);
  private categorySvc = inject(CategoryService);
  private contactSvc = inject(ContactService);
  private notifSvc = inject(NotificationService);

  protected allProducts = toSignal(this.productSvc.getAll(), { initialValue: [] });
  protected allCategories = toSignal(this.categorySvc.getAll(), { initialValue: [] });
  protected contacts = toSignal(this.contactSvc.getAll(), { initialValue: [] });

  protected lowStockProducts = computed(() =>
    this.allProducts().filter(p => p.stock_quantity <= 2)
  );

  protected expiringProducts = computed(() =>
    this.allProducts().filter(p => {
      if (!p.expiration_date) return false;
      const days = Math.ceil((new Date(p.expiration_date).getTime() - Date.now()) / 86400000);
      return days > 0 && days <= 30;
    })
  );

  protected stats = computed(() => [
    {
      label: 'ADMIN.STATS.TOTAL_PRODUCTS',
      value: this.allProducts().length,
      icon: '📦',
      bg: 'var(--primary-light)',
      sub: 'ADMIN.STATS.PRODUCTS_SUB',
    },
    {
      label: 'ADMIN.STATS.TOTAL_CATEGORIES',
      value: this.allCategories().length,
      icon: '🏷️',
      bg: '#d1fae5',
      sub: 'ADMIN.STATS.CATEGORIES_SUB',
    },
    {
      label: 'ADMIN.STATS.LOW_STOCK',
      value: this.lowStockProducts().length,
      icon: '⚠️',
      bg: '#fef3c7',
      sub: 'ADMIN.STATS.LOW_STOCK_SUB',
      alertColor: this.lowStockProducts().length > 0 ? 'var(--warning)' : undefined,
    },
    {
      label: 'ADMIN.STATS.CONTACT_REQUESTS',
      value: this.contacts().filter(c => c.status === 'new').length,
      icon: '📬',
      bg: '#fee2e2',
      sub: 'ADMIN.STATS.CONTACTS_SUB',
      alertColor: 'var(--danger)',
    },
  ]);

  protected categoryBars = computed(() => {
    const products = this.allProducts();
    const cats = this.allCategories();
    const max = Math.max(...cats.map(c => products.filter(p => p.category_id === c.id).length), 1);
    return cats.slice(0, 6).map(c => ({
      name: c.name_fr,
      count: products.filter(p => p.category_id === c.id).length,
      pct: (products.filter(p => p.category_id === c.id).length / max) * 100,
    }));
  });

  protected quickActions = [
    { path: '/admin/products/new', icon: '➕', label: 'ADMIN.DASHBOARD.ADD_PRODUCT' },
    { path: '/admin/categories/new', icon: '🏷️', label: 'ADMIN.DASHBOARD.ADD_CATEGORY' },
    { path: '/admin/blog/new', icon: '✍️', label: 'ADMIN.DASHBOARD.ADD_ARTICLE' },
    { path: '/admin/wiki/new', icon: '📄', label: 'ADMIN.DASHBOARD.ADD_WIKI' },
  ];

  async ngOnInit(): Promise<void> {
    const products = this.allProducts();
    if (products.length) {
      await this.notifSvc.checkProductAlerts(products);
    }
  }
}
