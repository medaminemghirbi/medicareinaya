import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold" style="color: var(--text-primary)">{{ 'ADMIN.CATEGORIES.TITLE' | translate }}</h1>
        <a routerLink="/admin/categories/new" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          {{ 'ADMIN.CATEGORIES.ADD' | translate }}
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (cat of categories(); track cat.id) {
          <div class="card p-5 flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style="background: var(--primary-light)">
              {{ cat.icon || '🏥' }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold truncate" style="color: var(--text-primary)">{{ cat.name_fr }}</h3>
              <p class="text-sm truncate" style="color: var(--text-secondary)">{{ cat.name_en }}</p>
            </div>
            <div class="flex gap-1">
              <a [routerLink]="['/admin/categories', cat.id, 'edit']" class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                <svg class="w-4 h-4" style="color: var(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </a>
              <button (click)="delete(cat)" class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50">
                <svg class="w-4 h-4" style="color: var(--danger)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        }

        @if (!categories().length) {
          <div class="col-span-3 card p-16 text-center" style="color: var(--text-secondary)">
            {{ 'ADMIN.CATEGORIES.EMPTY' | translate }}
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminCategoryListComponent {
  private categorySvc = inject(CategoryService);
  protected categories = toSignal(this.categorySvc.getAll(), { initialValue: [] as Category[] });

  async delete(cat: Category): Promise<void> {
    if (!confirm(`Supprimer "${cat.name_fr}" ?`)) return;
    await this.categorySvc.delete(cat.id!);
  }
}
