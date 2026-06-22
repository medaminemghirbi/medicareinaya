import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold" style="color: var(--text-primary)">{{ 'ADMIN.PRODUCTS.TITLE' | translate }}</h1>
        </div>
        <a routerLink="/admin/products/new" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          {{ 'ADMIN.PRODUCTS.ADD' | translate }}
        </a>
      </div>

      <!-- Filters -->
      <div class="card p-4 flex flex-wrap gap-4">
        <input
          type="text"
          [(ngModel)]="search"
          [placeholder]="'SEARCH.PLACEHOLDER' | translate"
          class="form-input flex-1 min-w-48"
        />
        <select [(ngModel)]="filterCat" class="form-input w-auto">
          <option value="">{{ 'PRODUCTS.ALL_CATEGORIES' | translate }}</option>
          @for (c of categories(); track c.id) {
            <option [value]="c.id">{{ c.name_fr }}</option>
          }
        </select>
        <select [(ngModel)]="filterStatus" class="form-input w-auto">
          <option value="">{{ 'PRODUCT.ALL_STATUS' | translate }}</option>
          <option value="active">{{ 'PRODUCT.ACTIVE' | translate }}</option>
          <option value="inactive">{{ 'PRODUCT.INACTIVE' | translate }}</option>
        </select>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'PRODUCT.IMAGE' | translate }}</th>
                <th>{{ 'PRODUCT.NAME' | translate }}</th>
                <th>{{ 'PRODUCT.CATEGORY' | translate }}</th>
                <th>{{ 'PRODUCT.PRICE' | translate }}</th>
                <th>{{ 'PRODUCT.STOCK' | translate }}</th>
                <th>{{ 'PRODUCT.STATUS' | translate }}</th>
                <th>{{ 'ADMIN.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filtered(); track p.id) {
                <tr>
                  <td>
                    @if (p.images.length) {
                      <img [src]="p.images[0]" class="w-12 h-12 rounded-lg object-cover" />
                    } @else {
                      <div class="w-12 h-12 rounded-lg img-placeholder">
                        <svg class="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                    }
                  </td>
                  <td>
                    <div class="font-medium" style="color: var(--text-primary)">{{ p.name_fr }}</div>
                    <div class="text-xs" style="color: var(--text-secondary)">{{ p.name_en }}</div>
                  </td>
                  <td>
                    <span class="badge badge-primary">{{ getCatName(p.category_id) }}</span>
                  </td>
                  <td>
                    <div class="font-medium" style="color: var(--text-primary)">{{ p.selling_price | number:'1.0-0' }} TND</div>
                    @if (p.has_promotion) {
                      <div class="text-xs" style="color: var(--success)">-{{ p.promotion_discount }}% 🎉</div>
                    }
                  </td>
                  <td>
                    <span [class]="p.stock_quantity <= 2 ? 'badge badge-danger' : 'badge badge-success'">
                      {{ p.stock_quantity }}
                    </span>
                  </td>
                  <td>
                    <span [class]="p.status === 'active' ? 'badge badge-success' : 'badge'">
                      {{ p.status | translate }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <a [routerLink]="['/admin/products', p.id, 'edit']" class="btn-secondary py-1.5 px-3 text-xs">
                        {{ 'ADMIN.EDIT' | translate }}
                      </a>
                      <button (click)="delete(p)" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style="background: #fee2e2; color: #dc2626">
                        {{ 'ADMIN.DELETE' | translate }}
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          @if (!filtered().length) {
            <div class="text-center py-12" style="color: var(--text-secondary)">
              {{ 'ADMIN.PRODUCTS.EMPTY' | translate }}
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminProductListComponent {
  private productSvc = inject(ProductService);
  private categorySvc = inject(CategoryService);

  protected products = toSignal(this.productSvc.getAll(), { initialValue: [] as Product[] });
  protected categories = toSignal(this.categorySvc.getAll(), { initialValue: [] });

  protected search = '';
  protected filterCat = '';
  protected filterStatus = '';

  protected filtered = computed(() => {
    let list = this.products();
    const q = this.search.toLowerCase();
    if (q) list = list.filter(p => p.name_fr?.toLowerCase().includes(q) || p.name_en?.toLowerCase().includes(q));
    if (this.filterCat) list = list.filter(p => p.category_id === this.filterCat);
    if (this.filterStatus) list = list.filter(p => p.status === this.filterStatus);
    return list;
  });

  getCatName(catId: string): string {
    return this.categories().find(c => c.id === catId)?.name_fr ?? catId;
  }

  async delete(p: Product): Promise<void> {
    if (!confirm(`Supprimer "${p.name_fr}" ?`)) return;
    await this.productSvc.delete(p.id!);
  }
}
