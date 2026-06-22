import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="max-w-4xl">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/admin/products" class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700" style="border: 1px solid var(--border)">
          <svg class="w-4 h-4" style="color: var(--text-secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </a>
        <h1 class="text-2xl font-extrabold" style="color: var(--text-primary)">
          {{ isEdit() ? ('ADMIN.PRODUCTS.EDIT' | translate) : ('ADMIN.PRODUCTS.ADD' | translate) }}
        </h1>
      </div>

      <form (ngSubmit)="save()" class="space-y-6">
        <!-- Basic Info -->
        <div class="card p-6">
          <h2 class="font-bold mb-4" style="color: var(--text-primary)">{{ 'ADMIN.PRODUCTS.BASIC_INFO' | translate }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.NAME_FR' | translate }} *</label>
              <input type="text" [(ngModel)]="form.name_fr" name="name_fr" required class="form-input" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.NAME_AR' | translate }}</label>
              <input type="text" [(ngModel)]="form.name_ar" name="name_ar" class="form-input" dir="rtl" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.NAME_EN' | translate }}</label>
              <input type="text" [(ngModel)]="form.name_en" name="name_en" class="form-input" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.DESC_FR' | translate }}</label>
              <textarea [(ngModel)]="form.description_fr" name="description_fr" rows="3" class="form-input resize-none"></textarea>
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.DESC_AR' | translate }}</label>
              <textarea [(ngModel)]="form.description_ar" name="description_ar" rows="3" class="form-input resize-none" dir="rtl"></textarea>
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.DESC_EN' | translate }}</label>
              <textarea [(ngModel)]="form.description_en" name="description_en" rows="3" class="form-input resize-none"></textarea>
            </div>
          </div>

          <div class="mt-4">
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.CATEGORY' | translate }} *</label>
              <select [(ngModel)]="form.category_id" name="category_id" required class="form-input">
                <option value="">-- {{ 'PRODUCT.SELECT_CATEGORY' | translate }} --</option>
                @for (c of categories(); track c.id) {
                  <option [value]="c.id">{{ c.name_fr }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <!-- Pricing & Inventory -->
        <div class="card p-6">
          <h2 class="font-bold mb-4" style="color: var(--text-primary)">{{ 'ADMIN.PRODUCTS.PRICING' | translate }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.PURCHASE_PRICE' | translate }} (TN) *</label>
              <input type="number" [(ngModel)]="form.purchase_price" name="purchase_price" required min="0" class="form-input" (ngModelChange)="computePrice()" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.SELLING_PRICE' | translate }} (TN)</label>
              <div class="form-input flex items-center gap-2" style="background: var(--bg); cursor: default">
                <span class="font-bold" style="color: var(--primary)">{{ form.selling_price | number:'1.2-2' }}</span>
                <span class="text-xs" style="color: var(--text-secondary)">(+20%)</span>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.STOCK' | translate }} *</label>
              <input type="number" [(ngModel)]="form.stock_quantity" name="stock_quantity" required min="0" class="form-input" />
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="card p-6">
          <h2 class="font-bold mb-4" style="color: var(--text-primary)">{{ 'ADMIN.PRODUCTS.DATES' | translate }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.MANUFACTURE_DATE' | translate }}</label>
              <input type="date" [(ngModel)]="form.manufacture_date" name="manufacture_date" class="form-input" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'PRODUCT.EXPIRATION_DATE' | translate }}</label>
              <input type="date" [(ngModel)]="form.expiration_date" name="expiration_date" class="form-input" />
              <p class="text-xs mt-1" style="color: var(--text-secondary)">{{ 'ADMIN.PRODUCTS.EXPIRY_NOTE' | translate }}</p>
            </div>
          </div>
        </div>

        <!-- Images (Google Drive URLs) -->
        <div class="card p-6">
          <h2 class="font-bold mb-4" style="color: var(--text-primary)">{{ 'ADMIN.PRODUCTS.IMAGES' | translate }}</h2>
          <p class="text-sm mb-4" style="color: var(--text-secondary)">{{ 'ADMIN.PRODUCTS.IMAGES_NOTE' | translate }}</p>
          @for (url of imageUrls; track $index; let i = $index) {
            <div class="flex gap-2 mb-2">
              <input
                type="url"
                [(ngModel)]="imageUrls[i]"
                [name]="'img_' + i"
                [placeholder]="'ADMIN.PRODUCTS.IMAGE_URL' | translate"
                class="form-input flex-1"
              />
              <button type="button" (click)="removeImage(i)" class="px-3 py-2 rounded-lg text-sm" style="background: #fee2e2; color: #dc2626">✕</button>
            </div>
          }
          <button type="button" (click)="addImage()" class="btn-secondary text-sm mt-2">+ {{ 'ADMIN.PRODUCTS.ADD_IMAGE' | translate }}</button>
        </div>

        <!-- Status -->
        <div class="card p-6">
          <h2 class="font-bold mb-4" style="color: var(--text-primary)">{{ 'PRODUCT.STATUS' | translate }}</h2>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" [(ngModel)]="form.status" name="status" value="active" class="accent-sky-500" />
              <span class="font-medium" style="color: var(--text-primary)">{{ 'PRODUCT.ACTIVE' | translate }}</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" [(ngModel)]="form.status" name="status" value="inactive" class="accent-sky-500" />
              <span class="font-medium" style="color: var(--text-primary)">{{ 'PRODUCT.INACTIVE' | translate }}</span>
            </label>
          </div>
        </div>

        @if (error()) {
          <div class="rounded-xl p-4 text-sm" style="background: #fee2e2; color: #dc2626">{{ error() }}</div>
        }

        <div class="flex gap-3">
          <button type="submit" [disabled]="saving()" class="btn-primary py-3 px-8" [class.opacity-60]="saving()">
            @if (saving()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            }
            {{ 'ADMIN.SAVE' | translate }}
          </button>
          <a routerLink="/admin/products" class="btn-secondary py-3 px-8">{{ 'ADMIN.CANCEL' | translate }}</a>
        </div>
      </form>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  private productSvc = inject(ProductService);
  private categorySvc = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected categories = toSignal(this.categorySvc.getAll(), { initialValue: [] });
  protected isEdit = signal(false);
  protected saving = signal(false);
  protected error = signal('');
  protected imageUrls: string[] = [''];

  protected form: Partial<Product> = {
    name_fr: '', name_ar: '', name_en: '',
    description_fr: '', description_ar: '', description_en: '',
    category_id: '',
    purchase_price: 0, selling_price: 0, stock_quantity: 0,
    manufacture_date: '', expiration_date: '',
    images: [], status: 'active',
  };

  private editId: string | null = null;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.editId = id;
      const p = await this.productSvc.getById(id);
      if (p) {
        this.form = { ...p };
        this.imageUrls = p.images?.length ? [...p.images] : [''];
      }
    }
  }

  computePrice(): void {
    this.form.selling_price = (this.form.purchase_price ?? 0) * 1.2;
  }

  addImage(): void { this.imageUrls.push(''); }

  removeImage(i: number): void { this.imageUrls.splice(i, 1); }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set('');
    try {
      this.form.images = this.imageUrls.filter(u => u.trim());
      if (this.isEdit() && this.editId) {
        await this.productSvc.update(this.editId, this.form as Product);
      } else {
        await this.productSvc.add(this.form as Product);
      }
      this.router.navigate(['/admin/products']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Erreur lors de l\'enregistrement');
    } finally {
      this.saving.set(false);
    }
  }
}
