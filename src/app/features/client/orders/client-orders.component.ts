import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { Order } from '../../../core/models/order.model';
import { switchMap, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

const STATUS_CLASSES: Record<string, string> = {
  pending:   'badge-warning',
  confirmed: 'badge-primary',
  shipped:   'badge-primary',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-10">
      <h1 class="text-3xl font-extrabold mb-8" style="color:var(--text-primary)">
        📋 {{ 'ORDERS.TITLE' | translate }}
      </h1>

      @if (!auth.isLoggedIn()) {
        <div class="card p-16 text-center">
          <p class="mb-4" style="color:var(--text-secondary)">{{ 'ORDERS.LOGIN_REQUIRED' | translate }}</p>
          <a routerLink="/auth/login" class="btn-primary">{{ 'NAV.LOGIN' | translate }}</a>
        </div>
      } @else if (!orders() || orders()!.length === 0) {
        <div class="card p-16 text-center">
          <div class="text-6xl mb-4">📭</div>
          <p class="mb-6" style="color:var(--text-secondary)">{{ 'ORDERS.EMPTY' | translate }}</p>
          <a routerLink="/products" class="btn-primary">{{ 'CART.BROWSE' | translate }}</a>
        </div>
      } @else {
        <div class="space-y-5">
          @for (order of orders()!; track order.id) {
            <div class="card p-5">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <p class="text-xs font-mono mb-1" style="color:var(--text-secondary)">{{ 'ORDERS.ORDER_ID' | translate }}: {{ order.id }}</p>
                  <p class="text-sm" style="color:var(--text-secondary)">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <span [class]="'badge ' + getStatusClass(order.status)">
                  {{ 'ORDERS.STATUS.' + order.status.toUpperCase() | translate }}
                </span>
              </div>

              <!-- Items -->
              <div class="space-y-2 mb-4">
                @for (item of order.items; track item.productId) {
                  <div class="flex items-center gap-3 text-sm">
                    <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0" style="border:1px solid var(--border)">
                      @if (item.image) { <img [src]="item.image" class="w-full h-full object-cover" /> }
                    </div>
                    <span class="flex-1" style="color:var(--text-primary)">{{ getName(item) }}</span>
                    <span style="color:var(--text-secondary)">x{{ item.quantity }}</span>
                    <span class="font-bold" style="color:var(--primary)">{{ item.subtotal | number:'1.2-2' }} TND</span>
                  </div>
                }
              </div>

              <!-- Totals -->
              <div class="border-t pt-3 text-sm space-y-1" style="border-color:var(--border)">
                <div class="flex justify-between">
                  <span style="color:var(--text-secondary)">{{ 'CART.DELIVERY' | translate }}</span>
                  <span>{{ order.delivery_fee }} TND</span>
                </div>
                <div class="flex justify-between font-bold">
                  <span style="color:var(--text-primary)">{{ 'CART.TOTAL' | translate }}</span>
                  <span style="color:var(--primary)">{{ order.total | number:'1.2-2' }} TND</span>
                </div>
                <p class="text-xs pt-1" style="color:var(--text-secondary)">
                  📍 {{ order.delivery_address.full_name }} — {{ order.delivery_address.address }}, {{ order.delivery_address.city }}, {{ order.delivery_address.wilaya }}
                </p>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ClientOrdersComponent {
  protected auth = inject(AuthService);
  private orderSvc = inject(OrderService);
  private lang = inject(LanguageService);

  protected orders = toSignal(
    toObservable(this.auth.currentUser).pipe(
      switchMap(user => user ? this.orderSvc.getByUser(user.id) : of([]))
    ),
    { initialValue: [] as Order[] }
  );

  getStatusClass(status: string): string {
    return STATUS_CLASSES[status] ?? 'badge-primary';
  }

  getName(item: any): string {
    const l = this.lang.lang();
    return item[`name_${l}`] ?? item.name_fr ?? item.name_en;
  }
}
