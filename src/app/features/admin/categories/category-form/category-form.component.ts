import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';

const ICONS = ['🏥','🖥️','🔬','💊','🩺','🩻','💉','🩹','🧬','🫀','🧪','🦷','🏋️','❤️','💛','🌡️'];

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="max-w-2xl">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/admin/categories" class="w-9 h-9 flex items-center justify-center rounded-xl" style="border: 1px solid var(--border)">
          <svg class="w-4 h-4" style="color: var(--text-secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </a>
        <h1 class="text-2xl font-extrabold" style="color: var(--text-primary)">
          {{ isEdit() ? ('ADMIN.CATEGORIES.EDIT' | translate) : ('ADMIN.CATEGORIES.ADD' | translate) }}
        </h1>
      </div>

      <form (ngSubmit)="save()" class="space-y-5">
        <div class="card p-6 space-y-4">
          <div class="form-field">
            <label class="form-label">{{ 'CATEGORY.NAME_FR' | translate }} *</label>
            <input type="text" [(ngModel)]="form.name_fr" name="name_fr" required class="form-input" />
          </div>
          <div class="form-field">
            <label class="form-label">{{ 'CATEGORY.NAME_AR' | translate }}</label>
            <input type="text" [(ngModel)]="form.name_ar" name="name_ar" class="form-input" dir="rtl" />
          </div>
          <div class="form-field">
            <label class="form-label">{{ 'CATEGORY.NAME_EN' | translate }}</label>
            <input type="text" [(ngModel)]="form.name_en" name="name_en" class="form-input" />
          </div>
          <div class="form-field">
            <label class="form-label">{{ 'CATEGORY.DESCRIPTION' | translate }}</label>
            <textarea [(ngModel)]="form.description" name="description" rows="2" class="form-input resize-none"></textarea>
          </div>
          <div class="form-field">
            <label class="form-label">{{ 'CATEGORY.ICON' | translate }}</label>
            <div class="flex flex-wrap gap-2 mt-1">
              @for (ico of icons; track ico) {
                <button type="button" (click)="form.icon = ico"
                  class="w-10 h-10 text-xl rounded-xl border-2 transition-all"
                  [style.border-color]="form.icon === ico ? 'var(--primary)' : 'var(--border)'"
                  [style.background]="form.icon === ico ? 'var(--primary-light)' : 'var(--bg)'"
                >{{ ico }}</button>
              }
            </div>
          </div>
        </div>

        @if (error()) {
          <div class="rounded-xl p-4 text-sm" style="background: #fee2e2; color: #dc2626">{{ error() }}</div>
        }

        <div class="flex gap-3">
          <button type="submit" [disabled]="saving()" class="btn-primary py-3 px-8">{{ 'ADMIN.SAVE' | translate }}</button>
          <a routerLink="/admin/categories" class="btn-secondary py-3 px-8">{{ 'ADMIN.CANCEL' | translate }}</a>
        </div>
      </form>
    </div>
  `,
})
export class CategoryFormComponent implements OnInit {
  private categorySvc = inject(CategoryService);
  private firestore = inject(Firestore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected isEdit = signal(false);
  protected saving = signal(false);
  protected error = signal('');
  protected icons = ICONS;
  protected form: Partial<Category> = { name_fr: '', name_ar: '', name_en: '', description: '', icon: '🏥' };
  private editId: string | null = null;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.editId = id;
      const snap = await getDoc(doc(this.firestore, 'categories', id));
      if (snap.exists()) this.form = { id, ...snap.data() } as Category;
    }
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set('');
    try {
      if (this.isEdit() && this.editId) {
        await this.categorySvc.update(this.editId, this.form);
      } else {
        await this.categorySvc.add(this.form as Category);
      }
      this.router.navigate(['/admin/categories']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Erreur');
    } finally {
      this.saving.set(false);
    }
  }
}
