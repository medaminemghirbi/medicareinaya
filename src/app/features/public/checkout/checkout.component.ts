import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';

const DELIVERY = 8;

const WILAYAS = [
  'Tunis','Ariana','Ben Arous','Manouba','Nabeul','Zaghouan','Bizerte',
  'Béja','Jendouba','Kef','Siliana','Sousse','Monastir','Mahdia',
  'Sfax','Kairouan','Kasserine','Sidi Bouzid','Gabès','Medenine',
  'Tataouine','Gafsa','Tozeur','Kébili',
];

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-extrabold mb-8" style="color:var(--text-primary)">
        📦 {{ 'CHECKOUT.TITLE' | translate }}
      </h1>

      @if (success()) {
        <div class="card p-16 text-center">
          <div class="text-6xl mb-4">✅</div>
          <h2 class="text-2xl font-bold mb-2" style="color:var(--text-primary)">{{ 'CHECKOUT.SUCCESS_TITLE' | translate }}</h2>
          <p class="mb-2" style="color:var(--text-secondary)">{{ 'CHECKOUT.SUCCESS_MSG' | translate }}</p>
          <p class="text-sm font-mono mb-6 font-bold" style="color:var(--primary)">{{ orderId() }}</p>
          <div class="flex gap-3 justify-center">
            <a routerLink="/client/orders" class="btn-primary">{{ 'CHECKOUT.MY_ORDERS' | translate }}</a>
            <a routerLink="/products" class="btn-secondary">{{ 'CART.BROWSE' | translate }}</a>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Form -->
          <div class="lg:col-span-2">
            <div class="card p-6">
              <h2 class="text-lg font-bold mb-5" style="color:var(--text-primary)">{{ 'CHECKOUT.DELIVERY_INFO' | translate }}</h2>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="form-field">
                  <label class="form-label">{{ 'CHECKOUT.FULL_NAME' | translate }}</label>
                  <input [(ngModel)]="form.full_name" class="form-input" required />
                </div>
                <div class="form-field">
                  <label class="form-label">{{ 'CHECKOUT.PHONE' | translate }}</label>
                  <input [(ngModel)]="form.phone" type="tel" class="form-input" required />
                </div>
                <div class="form-field sm:col-span-2">
                  <label class="form-label">{{ 'CHECKOUT.ADDRESS' | translate }}</label>
                  <input [(ngModel)]="form.address" class="form-input" required />
                </div>
                <div class="form-field">
                  <label class="form-label">{{ 'CHECKOUT.CITY' | translate }}</label>
                  <input [(ngModel)]="form.city" class="form-input" required />
                </div>
                <div class="form-field">
                  <label class="form-label">{{ 'CHECKOUT.WILAYA' | translate }}</label>
                  <select [(ngModel)]="form.wilaya" class="form-input">
                    <option value="">— {{ 'CHECKOUT.SELECT_WILAYA' | translate }} —</option>
                    @for (w of wilayas; track w) {
                      <option [value]="w">{{ w }}</option>
                    }
                  </select>
                </div>
                <div class="form-field sm:col-span-2">
                  <label class="form-label">{{ 'CHECKOUT.NOTES' | translate }}</label>
                  <textarea [(ngModel)]="form.notes" class="form-input" rows="3"></textarea>
                </div>
              </div>

              <!-- Payment -->
              <div class="mt-6 rounded-xl p-4" style="background:var(--primary-light)">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">💵</span>
                  <div>
                    <p class="font-bold" style="color:var(--primary)">{{ 'CHECKOUT.PAYMENT_COD' | translate }}</p>
                    <p class="text-sm" style="color:var(--text-secondary)">{{ 'CHECKOUT.PAYMENT_COD_DESC' | translate }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order summary -->
          <div class="lg:col-span-1">
            <div class="card p-5 sticky top-24">
              <h2 class="text-lg font-bold mb-4" style="color:var(--text-primary)">{{ 'CART.SUMMARY' | translate }}</h2>
              <div class="space-y-3 mb-4 max-h-60 overflow-y-auto">
                @for (item of cart.items(); track item.productId) {
                  <div class="flex gap-3 items-center text-sm">
                    <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0" style="border:1px solid var(--border)">
                      @if (item.image) { <img [src]="item.image" class="w-full h-full object-cover" /> }
                      @else { <div class="img-placeholder w-full h-full text-xs">💊</div> }
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="truncate font-medium" style="color:var(--text-primary)">{{ item.name_fr }}</p>
                      <p style="color:var(--text-secondary)">x{{ item.quantity }}</p>
                    </div>
                    <span class="font-bold shrink-0" style="color:var(--primary)">
                      {{ item.unit_price * item.quantity | number:'1.2-2' }}
                    </span>
                  </div>
                }
              </div>
              <div class="border-t pt-3 space-y-2 text-sm" style="border-color:var(--border)">
                <div class="flex justify-between">
                  <span style="color:var(--text-secondary)">{{ 'CART.SUBTOTAL' | translate }}</span>
                  <span>{{ cart.subtotal() | number:'1.2-2' }} TND</span>
                </div>
                <div class="flex justify-between">
                  <span style="color:var(--text-secondary)">{{ 'CART.DELIVERY' | translate }}</span>
                  <span>{{ delivery }} TND</span>
                </div>
                <div class="flex justify-between font-bold text-base pt-1 border-t" style="border-color:var(--border)">
                  <span>{{ 'CART.TOTAL' | translate }}</span>
                  <span style="color:var(--primary)">{{ cart.subtotal() + delivery | number:'1.2-2' }} TND</span>
                </div>
              </div>
              <button
                (click)="placeOrder()"
                [disabled]="loading() || !isFormValid()"
                class="btn-primary w-full justify-center mt-5"
                [style.opacity]="loading() || !isFormValid() ? '0.6' : '1'"
              >
                @if (loading()) { ⏳ {{ 'CHECKOUT.PLACING' | translate }} }
                @else { ✅ {{ 'CHECKOUT.PLACE_ORDER' | translate }} }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CheckoutComponent {
  protected cart = inject(CartService);
  private orderSvc = inject(OrderService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly delivery = DELIVERY;
  readonly wilayas = WILAYAS;
  readonly loading = signal(false);
  readonly success = signal(false);
  readonly orderId = signal('');

  form = {
    full_name: '',
    phone: '',
    address: '',
    city: '',
    wilaya: '',
    notes: '',
  };

  isFormValid(): boolean {
    return !!(this.form.full_name && this.form.phone && this.form.address && this.form.city && this.form.wilaya);
  }

  async placeOrder(): Promise<void> {
    if (!this.isFormValid() || this.cart.items().length === 0) return;
    const user = this.auth.currentUser();
    if (!user) { this.router.navigate(['/auth/login']); return; }

    this.loading.set(true);
    try {
      const items = this.cart.items().map(i => ({
        productId: i.productId,
        name_fr: i.name_fr,
        image: i.image,
        unit_price: i.unit_price,
        quantity: i.quantity,
        subtotal: +(i.unit_price * i.quantity).toFixed(2),
      }));

      const subtotal = +this.cart.subtotal().toFixed(2);
      const id = await this.orderSvc.create({
        user_id: user.id,
        user_email: user.email ?? '',
        items,
        subtotal,
        delivery_fee: DELIVERY,
        total: +(subtotal + DELIVERY).toFixed(2),
        status: 'pending',
        payment_method: 'cod',
        delivery_address: {
          full_name: this.form.full_name,
          phone: this.form.phone,
          address: this.form.address,
          city: this.form.city,
          wilaya: this.form.wilaya,
        },
        notes: this.form.notes || undefined,
      });

      this.cart.clear();
      this.orderId.set(id);
      this.success.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
