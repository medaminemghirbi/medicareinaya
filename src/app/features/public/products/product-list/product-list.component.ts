import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { LanguageService } from '../../../../core/services/language.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, ProductCardComponent, SearchBarComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold mb-2" style="color: var(--text-primary)">{{ 'PRODUCTS.TITLE' | translate }}</h1>
        <p style="color: var(--text-secondary)">{{ 'PRODUCTS.SUBTITLE' | translate }}</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Filters Sidebar -->
        <aside class="w-full lg:w-64 shrink-0">
          <div class="card p-5 sticky top-24">
            <h3 class="font-bold mb-4" style="color: var(--text-primary)">{{ 'PRODUCTS.FILTERS' | translate }}</h3>

            <!-- Search -->
            <div class="mb-4">
              <app-search-bar (changed)="search.set($event)" [placeholder]="'SEARCH.PLACEHOLDER' | translate" />
            </div>

            <!-- Categories -->
            <div class="mb-4">
              <label class="form-label mb-2">{{ 'PRODUCTS.CATEGORY' | translate }}</label>
              <div class="space-y-1">
                <button
                  (click)="selectedCategory.set('')"
                  class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  [class.font-semibold]="!selectedCategory()"
                  [style.background]="!selectedCategory() ? 'var(--primary-light)' : ''"
                  [style.color]="!selectedCategory() ? 'var(--primary)' : 'var(--text-secondary)'"
                >
                  {{ 'PRODUCTS.ALL_CATEGORIES' | translate }}
                </button>
                @for (cat of categories(); track cat.id) {
                  <button
                    (click)="selectedCategory.set(cat.id ?? '')"
                    class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    [class.font-semibold]="selectedCategory() === cat.id"
                    [style.background]="selectedCategory() === cat.id ? 'var(--primary-light)' : ''"
                    [style.color]="selectedCategory() === cat.id ? 'var(--primary)' : 'var(--text-secondary)'"
                  >
                    {{ getCatName(cat) }}
                  </button>
                }
              </div>
            </div>

            <!-- Price Range -->
            <div class="mb-4">
              <label class="form-label mb-2">{{ 'PRODUCTS.MAX_PRICE' | translate }}: {{ maxPrice() }} TND</label>
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                [value]="maxPrice()"
                (input)="maxPrice.set(+$any($event.target).value)"
                class="w-full accent-sky-500"
              />
            </div>

            <!-- Stock filter -->
            <div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="inStockOnly" class="w-4 h-4 accent-sky-500" />
                <span class="text-sm" style="color: var(--text-primary)">{{ 'PRODUCTS.IN_STOCK_ONLY' | translate }}</span>
              </label>
            </div>
          </div>
        </aside>

        <!-- Product Grid -->
        <div class="flex-1">
          <!-- Sort + count -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm" style="color: var(--text-secondary)">
              {{ filtered().length }} {{ 'PRODUCTS.RESULTS' | translate }}
            </span>
            <select
              [(ngModel)]="sortBy"
              class="form-input py-2 w-auto text-sm"
            >
              <option value="newest">{{ 'PRODUCTS.SORT.NEWEST' | translate }}</option>
              <option value="price_asc">{{ 'PRODUCTS.SORT.PRICE_ASC' | translate }}</option>
              <option value="price_desc">{{ 'PRODUCTS.SORT.PRICE_DESC' | translate }}</option>
              <option value="name">{{ 'PRODUCTS.SORT.NAME' | translate }}</option>
            </select>
          </div>

          @if (filtered().length) {
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              @for (p of sorted(); track p.id) {
                <app-product-card [product]="p" />
              }
            </div>
          } @else {
            <div class="card p-16 text-center">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style="background: var(--primary-light)">
                <svg class="w-8 h-8" style="color: var(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="font-bold text-lg mb-1" style="color: var(--text-primary)">{{ 'PRODUCTS.NO_RESULTS' | translate }}</h3>
              <p style="color: var(--text-secondary)">{{ 'PRODUCTS.TRY_DIFFERENT' | translate }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  private productSvc = inject(ProductService);
  private categorySvc = inject(CategoryService);
  private langSvc = inject(LanguageService);
  private route = inject(ActivatedRoute);

  protected allProducts = toSignal(this.productSvc.getFeatured(), { initialValue: [] as Product[] });
  protected categories = toSignal(this.categorySvc.getAll(), { initialValue: [] });

  protected search = signal('');
  protected selectedCategory = signal('');
  protected maxPrice = signal(100000);
  protected inStockOnly = false;
  protected sortBy = 'newest';

  protected filtered = computed(() => {
    let list = this.allProducts();
    const q = this.search().toLowerCase();
    const cat = this.selectedCategory();
    const max = this.maxPrice();

    if (q) list = list.filter(p => {
      const l = this.langSvc.lang();
      const name = ((p as any)[`name_${l}`] ?? p.name_fr ?? '').toLowerCase();
      return name.includes(q);
    });

    if (cat) list = list.filter(p => p.category_id === cat);
    list = list.filter(p => p.selling_price <= max);
    if (this.inStockOnly) list = list.filter(p => p.stock_quantity > 0);

    return list;
  });

  protected sorted = computed(() => {
    const list = [...this.filtered()];
    switch (this.sortBy) {
      case 'price_asc':  return list.sort((a, b) => a.selling_price - b.selling_price);
      case 'price_desc': return list.sort((a, b) => b.selling_price - a.selling_price);
      case 'name':       return list.sort((a, b) => (a.name_fr ?? '').localeCompare(b.name_fr ?? ''));
      default:           return list;
    }
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['category']) this.selectedCategory.set(p['category']);
      if (p['q']) this.search.set(p['q']);
    });
  }

  getCatName(cat: any): string {
    const l = this.langSvc.lang();
    return cat[`name_${l}`] ?? cat.name_fr ?? '';
  }
}
