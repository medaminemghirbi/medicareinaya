import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

const STATUS_CLASSES: Record<string, string> = {
  pending:   'badge-warning',
  confirmed: 'badge-primary',
  shipped:   'badge-primary',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-5">
      <h1 class="text-2xl font-extrabold" style="color:var(--text-primary)">{{ 'ORDERS.ADMIN_TITLE' | translate }}</h1>

      @if (!orders() || orders()!.length === 0) {
        <div class="card p-16 text-center" style="color:var(--text-secondary)">{{ 'ORDERS.EMPTY' | translate }}</div>
      } @else {
        <div class="space-y-4">
          @for (order of orders()!; track order.id) {
            <div class="card p-5">
              <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p class="text-xs font-mono" style="color:var(--text-secondary)">{{ order.id }}</p>
                  <p class="text-sm font-medium" style="color:var(--text-primary)">{{ order.user_email }}</p>
                  <p class="text-xs" style="color:var(--text-secondary)">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span [class]="'badge ' + getStatusClass(order.status)">
                    {{ 'ORDERS.STATUS.' + order.status.toUpperCase() | translate }}
                  </span>
                  <select
                    [value]="order.status"
                    (change)="changeStatus(order.id!, $any($event.target).value)"
                    class="form-input text-sm py-1 px-2 w-auto"
                    style="height:auto"
                  >
                    @for (s of statuses; track s) {
                      <option [value]="s">{{ 'ORDERS.STATUS.' + s.toUpperCase() | translate }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Items summary -->
              <div class="text-sm mb-3 space-y-1">
                @for (item of order.items; track item.productId) {
                  <div class="flex justify-between" style="color:var(--text-secondary)">
                    <span>{{ item.name_fr }} x{{ item.quantity }}</span>
                    <span>{{ item.subtotal | number:'1.2-2' }} TND</span>
                  </div>
                }
              </div>

              <div class="border-t pt-3 flex flex-wrap items-center justify-between gap-2 text-sm" style="border-color:var(--border)">
                <p style="color:var(--text-secondary)">
                  📍 {{ order.delivery_address.full_name }} — {{ order.delivery_address.phone }}<br>
                  {{ order.delivery_address.address }}, {{ order.delivery_address.city }}, {{ order.delivery_address.wilaya }}
                </p>
                <div class="text-right">
                  <p style="color:var(--text-secondary)">Livraison: {{ order.delivery_fee }} TND</p>
                  <p class="font-bold text-base" style="color:var(--primary)">Total: {{ order.total | number:'1.2-2' }} TND</p>
                  <p class="text-xs" style="color:var(--text-secondary)">💵 Paiement à la livraison</p>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class AdminOrdersComponent {
  private orderSvc = inject(OrderService);
  protected orders = toSignal(this.orderSvc.getAll(), { initialValue: [] as Order[] });
  protected statuses = STATUSES;

  getStatusClass(status: string): string {
    return STATUS_CLASSES[status] ?? 'badge-primary';
  }

  async changeStatus(id: string, status: OrderStatus): Promise<void> {
    await this.orderSvc.updateStatus(id, status);
  }
}
