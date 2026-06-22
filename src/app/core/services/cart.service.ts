import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart.model';

const KEY = 'medicare-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>(this.load());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((s, i) => s + i.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((s, i) => s + i.unit_price * i.quantity, 0));

  add(item: CartItem): void {
    const list = this._items();
    const idx = list.findIndex(i => i.productId === item.productId);
    if (idx >= 0) {
      const updated = [...list];
      updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + item.quantity };
      this._items.set(updated);
    } else {
      this._items.set([...list, item]);
    }
    this.save();
  }

  remove(productId: string): void {
    this._items.set(this._items().filter(i => i.productId !== productId));
    this.save();
  }

  updateQty(productId: string, qty: number): void {
    if (qty <= 0) { this.remove(productId); return; }
    this._items.set(this._items().map(i => i.productId === productId ? { ...i, quantity: qty } : i));
    this.save();
  }

  isInCart(productId: string): boolean {
    return this._items().some(i => i.productId === productId);
  }

  clear(): void {
    this._items.set([]);
    localStorage.removeItem(KEY);
  }

  private save(): void {
    localStorage.setItem(KEY, JSON.stringify(this._items()));
  }

  private load(): CartItem[] {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
    catch { return []; }
  }
}
