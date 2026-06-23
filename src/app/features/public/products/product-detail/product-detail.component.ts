import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../../../core/services/product.service';
import { LanguageService } from '../../../../core/services/language.service';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm mb-6" style="color: var(--text-secondary)">
        <a routerLink="/" class="hover:text-sky-500 transition-colors">{{ 'NAV.HOME' | translate }}</a>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <a routerLink="/products" class="hover:text-sky-500 transition-colors">{{ 'NAV.PRODUCTS' | translate }}</a>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <span>{{ getName() }}</span>
      </nav>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div class="skeleton h-96 rounded-2xl"></div>
          <div class="space-y-4">
            <div class="skeleton h-8 w-3/4 rounded"></div>
            <div class="skeleton h-4 w-full rounded"></div>
            <div class="skeleton h-4 w-2/3 rounded"></div>
          </div>
        </div>
      } @else if (product()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <!-- Images -->
          <div>
            <div class="rounded-2xl overflow-hidden h-80 mb-3" style="border: 1px solid var(--border)">
              @if (product()!.images.length) {
                <img
                  [src]="product()!.images[activeImage()]"
                  [alt]="getName()"
                  class="w-full h-full object-contain"
                  style="background: var(--bg)"
                />
              } @else {
                <div class="img-placeholder w-full h-full">
                  <svg class="w-24 h-24 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              }
            </div>
            @if (product()!.images.length > 1) {
              <div class="flex gap-2 overflow-x-auto">
                @for (img of product()!.images; track img; let i = $index) {
                  <button
                    (click)="activeImage.set(i)"
                    class="w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all"
                    [style.border-color]="activeImage() === i ? 'var(--primary)' : 'var(--border)'"
                  >
                    <img [src]="img" class="w-full h-full object-cover" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Info -->
          <div>
            <div class="flex flex-wrap gap-2 mb-3">
              @if (product()!.has_promotion) {
                <span class="badge badge-danger">-{{ product()!.promotion_discount }}%</span>
              }
              @if (product()!.stock_quantity <= 2) {
                <span class="badge badge-warning">{{ 'PRODUCT.LOW_STOCK' | translate }}</span>
              }
              <span [class]="product()!.status === 'active' ? 'badge badge-success' : 'badge badge-danger'">
                {{ product()!.status === 'active' ? ('PRODUCT.ACTIVE' | translate) : ('PRODUCT.INACTIVE' | translate) }}
              </span>
            </div>

            <h1 class="text-3xl font-extrabold mb-3" style="color: var(--text-primary)">{{ getName() }}</h1>
            <p class="text-base leading-relaxed mb-6" style="color: var(--text-secondary)">{{ getDesc() }}</p>

            <!-- Price -->
            <div class="card p-5 mb-6">
              @if (product()!.has_promotion) {
                <div class="flex items-baseline gap-3 mb-1">
                  <span class="text-3xl font-extrabold" style="color: var(--primary)">
                    {{ (product()!.selling_price * 0.8) | number:'1.2-2' }} TND
                  </span>
                  <span class="text-lg line-through" style="color: var(--text-secondary)">
                    {{ product()!.selling_price | number:'1.2-2' }} TND
                  </span>
                </div>
                <p class="text-sm" style="color: var(--success)">
                  {{ 'PRODUCT.PROMOTION_ACTIVE' | translate }}
                </p>
              } @else {
                <span class="text-3xl font-extrabold" style="color: var(--primary)">
                  {{ product()!.selling_price | number:'1.2-2' }} TND
                </span>
              }
              <p class="text-sm mt-2" style="color: var(--text-secondary)">
                {{ 'PRODUCT.STOCK' | translate }}: <strong>{{ product()!.stock_quantity }}</strong>
              </p>
            </div>

            <!-- Details -->
            <div class="space-y-2 mb-6 text-sm">
              @if (product()!.manufacture_date) {
                <div class="flex justify-between py-2 border-b" style="border-color: var(--border)">
                  <span style="color: var(--text-secondary)">{{ 'PRODUCT.MANUFACTURE_DATE' | translate }}</span>
                  <span style="color: var(--text-primary)">{{ product()!.manufacture_date }}</span>
                </div>
              }
              @if (product()!.expiration_date) {
                <div class="flex justify-between py-2 border-b" style="border-color: var(--border)">
                  <span style="color: var(--text-secondary)">{{ 'PRODUCT.EXPIRATION_DATE' | translate }}</span>
                  <span style="color: var(--text-primary)">{{ product()!.expiration_date }}</span>
                </div>
              }
            </div>

            <!-- CTA -->
            <div class="flex gap-3">
              <button
                (click)="addToCart()"
                [disabled]="product()!.stock_quantity === 0"
                class="btn-primary flex-1 justify-center py-3 text-base"
                [style.opacity]="product()!.stock_quantity === 0 ? '0.5' : '1'"
              >
                @if (inCart()) {
                  ✓ {{ 'CART.IN_CART' | translate }}
                } @else {
                  🛒 {{ 'CART.ADD' | translate }}
                }
              </button>
              <button
                (click)="toggleWishlist()"
                class="w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all"
                [style.border-color]="inWishlist() ? '#ef4444' : 'var(--border)'"
                [style.background]="inWishlist() ? 'rgba(239,68,68,0.08)' : 'var(--bg-card)'"
              >
                <svg class="w-5 h-5" [style.fill]="inWishlist() ? '#ef4444' : 'none'" [style.stroke]="inWishlist() ? '#ef4444' : 'var(--text-secondary)'" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      } @else {
        <div class="card p-16 text-center">
          <p style="color: var(--text-secondary)">{{ 'PRODUCT.NOT_FOUND' | translate }}</p>
          <a routerLink="/products" class="btn-primary mt-4">{{ 'PRODUCTS.BACK' | translate }}</a>
        </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  private productSvc = inject(ProductService);
  private langSvc = inject(LanguageService);
  private cartSvc = inject(CartService);
  private wishSvc = inject(WishlistService);
  private route = inject(ActivatedRoute);

  protected product = signal<Product | null>(null);
  protected loading = signal(true);
  protected activeImage = signal(0);

  inCart(): boolean { return this.cartSvc.isInCart(this.product()?.id ?? ''); }
  inWishlist(): boolean { return this.wishSvc.isInWishlist(this.product()?.id ?? ''); }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartSvc.add({
      productId: p.id!,
      name_fr: p.name_fr,
      name_en: p.name_en,
      name_ar: p.name_ar,
      image: p.images?.[0] ?? '',
      unit_price: p.has_promotion ? +(p.selling_price * 0.8).toFixed(2) : p.selling_price,
      quantity: 1,
    });
  }

  toggleWishlist(): void {
    const p = this.product();
    if (!p) return;
    this.wishSvc.toggle({
      productId: p.id!,
      name_fr: p.name_fr,
      name_en: p.name_en,
      name_ar: p.name_ar,
      image: p.images?.[0] ?? '',
      selling_price: p.selling_price,
      has_promotion: p.has_promotion ?? false,
      promotion_discount: p.promotion_discount ?? 0,
    });
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.product.set(await this.productSvc.getById(id));
    }
    this.loading.set(false);
  }

  getName(): string {
    const p = this.product();
    if (!p) return '';
    const l = this.langSvc.lang();
    return (p as any)[`name_${l}`] ?? p.name_fr ?? p.name_en;
  }

  getDesc(): string {
    const p = this.product();
    if (!p) return '';
    const l = this.langSvc.lang();
    return (p as any)[`description_${l}`] ?? p.description_fr ?? p.description_en;
  }
}
