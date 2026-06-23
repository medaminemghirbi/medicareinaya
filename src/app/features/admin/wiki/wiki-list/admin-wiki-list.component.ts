import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WikiService } from '../../../../core/services/wiki.service';
import { WikiPage } from '../../../../core/models/wiki.model';

@Component({
  selector: 'app-admin-wiki-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold" style="color: var(--text-primary)">{{ 'ADMIN.WIKI.TITLE' | translate }}</h1>
        <a routerLink="/admin/wiki/new" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          {{ 'ADMIN.WIKI.ADD' | translate }}
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (p of pages(); track p.id) {
          <div class="card p-5 flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-bold truncate" style="color: var(--text-primary)">{{ p.title_fr }}</h3>
                <span [class]="p.published ? 'badge badge-success' : 'badge'" style="font-size:0.65rem">
                  {{ p.published ? ('BLOG.PUBLISHED' | translate) : ('BLOG.DRAFT' | translate) }}
                </span>
              </div>
              @if (p.category) {
                <span class="badge badge-primary">{{ p.category }}</span>
              }
            </div>
            <div class="flex gap-1 shrink-0">
              <a [routerLink]="['/admin/wiki', p.id, 'edit']" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <svg class="w-4 h-4" style="color: var(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </a>
              <button (click)="delete(p)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50">
                <svg class="w-4 h-4" style="color: var(--danger)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        }
        @if (!pages().length) {
          <div class="col-span-2 card p-16 text-center" style="color: var(--text-secondary)">{{ 'ADMIN.WIKI.EMPTY' | translate }}</div>
        }
      </div>
    </div>
  `,
})
export class AdminWikiListComponent {
  private wikiSvc = inject(WikiService);
  protected pages = toSignal(this.wikiSvc.getAll(), { initialValue: [] as WikiPage[] });

  async delete(p: WikiPage): Promise<void> {
    if (!confirm(`Supprimer "${p.title_fr}" ?`)) return;
    await this.wikiSvc.delete(p.id!);
  }
}
