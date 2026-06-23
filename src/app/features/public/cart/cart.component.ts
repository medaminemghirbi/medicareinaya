import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CartService } from '../../../core/services/cart.service';
import { LanguageService } from '../../../core/services/language.service';
import { AuthService } from '../../../core/services/auth.service';

const DELIVERY = 8;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-extrabold mb-8" style="color:var(--text-primary)">
        🛒 {{ 'CART.TITLE' | translate }}
      </h1>

      @if (cart.items().length === 0) {
        <div class="card p-16 text-center">
          <div class="text-6xl mb-4">🛒</div>
          <p class="text-lg mb-6" style="color:var(--text-secondary)">{{ 'CART.EMPTY' | translate }}</p>
          <a routerLink="/products" class="btn-primary">{{ 'CART.BROWSE' | translate }}</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Items -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of cart.items(); track item.productId) {
              <div class="card p-4 flex gap-4 items-center">
                <!-- Image -->
                <div class="w-20 h-20 rounded-xl overflow-hidden shrink-0" style="border:1px solid var(--border)">
                  @if (item.image) {
                    <img [src]="item.image" class="w-full h-full object-cover" />
                  } @else {
                    <div class="img-placeholder w-full h-full text-2xl">💊</div>
                  }
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold truncate" style="color:var(--text-primary)">{{ getName(item) }}</h3>
                  <p class="text-sm font-bold mt-1" style="color:var(--primary)">
                    {{ item.unit_price | number:'1.2-2' }} TND
                  </p>
                </div>

                <!-- Qty -->
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    (click)="cart.updateQty(item.productId, item.quantity - 1)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-colors"
                    style="border:1px solid var(--border);color:var(--text-primary)"
                  >−</button>
                  <span class="w-8 text-center font-semibold" style="color:var(--text-primary)">{{ item.quantity }}</span>
                  <button
                    (click)="cart.updateQty(item.productId, item.quantity + 1)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-colors"
                    style="border:1px solid var(--border);color:var(--text-primary)"
                  >+</button>
                </div>

                <!-- Line total -->
                <div class="shrink-0 text-right w-24">
                  <p class="font-bold" style="color:var(--text-primary)">
                    {{ item.unit_price * item.quantity | number:'1.2-2' }} TND
                  </p>
                </div>

                <!-- Remove -->
                <button (click)="cart.remove(item.productId)" class="text-red-400 hover:text-red-600 ml-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <!-- Summary -->
          <div class="lg:col-span-1">
            <div class="card p-6 sticky top-24">
              <h2 class="text-lg font-bold mb-4" style="color:var(--text-primary)">{{ 'CART.SUMMARY' | translate }}</h2>

              <div class="space-y-3 text-sm mb-4">
                <div class="flex justify-between">
                  <span style="color:var(--text-secondary)">{{ 'CART.SUBTOTAL' | translate }}</span>
                  <span style="color:var(--text-primary)">{{ cart.subtotal() | number:'1.2-2' }} TND</span>
                </div>
                <div class="flex justify-between">
                  <span style="color:var(--text-secondary)">{{ 'CART.DELIVERY' | translate }}</span>
                  <span style="color:var(--text-primary)">{{ delivery }} TND</span>
                </div>
                <div class="pt-3 border-t flex justify-between font-bold text-base" style="border-color:var(--border)">
                  <span style="color:var(--text-primary)">{{ 'CART.TOTAL' | translate }}</span>
                  <span style="color:var(--primary)">{{ cart.subtotal() + delivery | number:'1.2-2' }} TND</span>
                </div>
              </div>

              <div class="rounded-xl p-3 mb-4 text-sm text-center" style="background:var(--primary-light);color:var(--primary)">
                🚚 {{ 'CART.COD_ONLY' | translate }}
              </div>

              @if (auth.isLoggedIn()) {
                <a routerLink="/checkout" class="btn-primary w-full justify-center">
                  {{ 'CART.CHECKOUT' | translate }}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </a>
              } @else {
                <a routerLink="/auth/login" class="btn-primary w-full justify-center">
                  {{ 'CART.LOGIN_TO_ORDER' | translate }}
                </a>
              }

              <button (click)="cart.clear()" class="btn-secondary w-full mt-3 text-sm">
                {{ 'CART.CLEAR' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CartComponent {
  protected cart = inject(CartService);
  protected auth = inject(AuthService);
  private lang = inject(LanguageService);
  readonly delivery = DELIVERY;

  getName(item: any): string {
    const l = this.lang.lang();
    return item[`name_${l}`] ?? item.name_fr ?? item.name_en;
  }
}
