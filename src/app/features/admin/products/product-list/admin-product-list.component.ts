import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap, tap } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Product } from '../../../../core/models/product.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-5">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <h1 class="text-2xl font-extrabold" style="color: var(--text-primary)">{{ 'ADMIN.PRODUCTS.TITLE' | translate }}</h1>
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Download template -->
          <button (click)="downloadTemplate()" class="btn-secondary text-sm gap-2">
            📥 Modèle Excel
          </button>
          <!-- Import Excel -->
          <button (click)="fileInput.click()" [disabled]="importing()" class="btn-secondary text-sm gap-2">
            @if (importing()) { ⏳ Import... } @else { 📂 Importer Excel }
          </button>
          <input #fileInput type="file" accept=".xlsx,.xls,.csv" class="hidden" (change)="onFileSelected($event)" />
          <!-- Add -->
          <a routerLink="/admin/products/new" class="btn-primary text-sm gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            {{ 'ADMIN.PRODUCTS.ADD' | translate }}
          </a>
        </div>
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
              @if (loading()) {
                @for (i of skeletonRows; track i) {
                  <tr class="animate-pulse">
                    <td><div class="w-12 h-12 rounded-lg skeleton"></div></td>
                    <td><div class="h-4 rounded skeleton w-36"></div></td>
                    <td><div class="h-5 rounded-full skeleton w-20"></div></td>
                    <td><div class="h-4 rounded skeleton w-16"></div></td>
                    <td><div class="h-5 rounded-full skeleton w-10"></div></td>
                    <td><div class="h-5 rounded-full skeleton w-14"></div></td>
                    <td><div class="flex gap-2"><div class="h-7 rounded-lg skeleton w-14"></div><div class="h-7 rounded-lg skeleton w-14"></div></div></td>
                  </tr>
                }
              } @else {
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
                        {{ p.status }}
                      </span>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <a [routerLink]="['/admin/products', p.id, 'edit']" class="btn-secondary py-1.5 px-3 text-xs">
                          {{ 'ADMIN.EDIT' | translate }}
                        </a>
                        <button (click)="delete(p)" class="px-3 py-1.5 rounded-lg text-xs font-medium" style="background: #fee2e2; color: #dc2626">
                          {{ 'ADMIN.DELETE' | translate }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>

          @if (!loading() && !filtered().length) {
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
  private toast = inject(ToastService);

  private refresh$ = new BehaviorSubject<void>(undefined);
  protected loading = signal(true);
  protected products = toSignal(
    this.refresh$.pipe(
      tap(() => this.loading.set(true)),
      switchMap(() => this.productSvc.getAll()),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] as Product[] }
  );
  protected categories = toSignal(this.categorySvc.getAll(), { initialValue: [] });

  protected search = '';
  protected filterCat = '';
  protected filterStatus = '';
  protected importing = signal(false);
  protected skeletonRows = Array(6).fill(0);

  protected filtered = computed(() => {
    let list = this.products();
    const q = this.search.toLowerCase();
    if (q) list = list.filter(p => p.name_fr?.toLowerCase().includes(q));
    if (this.filterCat) list = list.filter(p => p.category_id === this.filterCat);
    if (this.filterStatus) list = list.filter(p => p.status === this.filterStatus);
    return list;
  });

  getCatName(catId: string): string {
    return this.categories().find(c => c.id === catId)?.name_fr ?? '—';
  }

  async delete(p: Product): Promise<void> {
    if (!confirm(`Supprimer "${p.name_fr}" ?`)) return;
    try {
      await this.productSvc.delete(p.id!);
      this.refresh$.next();
      this.toast.success(`"${p.name_fr}" supprimé.`);
    } catch (e: any) {
      this.toast.error(e.message ?? 'Erreur lors de la suppression.');
    }
  }

  // ── Download Excel template ──────────────────────────────────────────
  downloadTemplate(): void {
    const headers = [
      ['name_fr', 'description_fr', 'category_name', 'purchase_price', 'stock_quantity', 'manufacture_date', 'expiration_date', 'status']
    ];
    const example = [
      ['Doliprane 1000mg', 'Antidouleur paracétamol', 'Médicaments', 2.50, 100, '2024-01-01', '2026-12-31', 'active'],
      ['Vitamine C 500mg', 'Complément immunité',     'Compléments',  1.80, 200, '',           '2027-06-30', 'active'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...example]);
    ws['!cols'] = [20,30,20,15,15,15,15,10].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produits');
    XLSX.writeFile(wb, 'modele-produits.xlsx');
  }

  // ── Import from Excel / CSV ──────────────────────────────────────────
  async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    (event.target as HTMLInputElement).value = '';

    this.importing.set(true);

    try {
      const rows = await this.parseFile(file);
      if (!rows.length) throw new Error('Fichier vide ou colonnes incorrectes.');

      const cats = this.categories();
      let inserted = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name_fr = String(row['name_fr'] ?? '').trim();
        if (!name_fr) { errors.push(`Ligne ${i + 2}: name_fr manquant`); continue; }

        const purchase_price = parseFloat(row['purchase_price'] ?? 0);
        if (!purchase_price) { errors.push(`Ligne ${i + 2}: purchase_price invalide`); continue; }

        const catName = String(row['category_name'] ?? '').trim();
        const cat = cats.find(c => c.name_fr.toLowerCase() === catName.toLowerCase());

        const product: Partial<Product> = {
          name_fr,
          description_fr: String(row['description_fr'] ?? '').trim(),
          category_id: cat?.id ?? undefined,
          purchase_price,
          selling_price: +(purchase_price * 1.2).toFixed(2),
          stock_quantity: parseInt(row['stock_quantity'] ?? 0),
          manufacture_date: String(row['manufacture_date'] ?? '').trim() || undefined,
          expiration_date: String(row['expiration_date'] ?? '').trim() || undefined,
          status: row['status'] === 'inactive' ? 'inactive' : 'active',
          images: [],
        };

        try {
          await this.productSvc.add(product as Product);
          inserted++;
        } catch (e: any) {
          errors.push(`Ligne ${i + 2}: ${e.message}`);
        }
      }

      if (inserted > 0) {
        this.refresh$.next();
        this.toast.success(`${inserted} produit(s) importé(s) avec succès.`);
      }
      if (errors.length) {
        this.toast.error(`${errors.length} erreur(s): ${errors.slice(0, 3).join(' | ')}${errors.length > 3 ? '…' : ''}`);
      }
    } catch (e: any) {
      this.toast.error(e.message ?? 'Erreur lors de l\'import.');
    } finally {
      this.importing.set(false);
    }
  }

  private parseFile(file: File): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array', cellDates: true });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
          resolve(rows);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}
