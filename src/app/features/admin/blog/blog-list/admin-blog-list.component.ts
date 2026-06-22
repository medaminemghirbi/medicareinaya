import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BlogService } from '../../../../core/services/blog.service';
import { BlogArticle } from '../../../../core/models/blog.model';

@Component({
  selector: 'app-admin-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-extrabold" style="color: var(--text-primary)">{{ 'ADMIN.BLOG.TITLE' | translate }}</h1>
        <a routerLink="/admin/blog/new" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          {{ 'ADMIN.BLOG.ADD' | translate }}
        </a>
      </div>

      <div class="card overflow-hidden">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ 'BLOG.TITLE_COL' | translate }}</th>
              <th>{{ 'BLOG.TAGS' | translate }}</th>
              <th>{{ 'BLOG.STATUS' | translate }}</th>
              <th>{{ 'ADMIN.ACTIONS' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (a of articles(); track a.id) {
              <tr>
                <td>
                  <div class="font-medium" style="color: var(--text-primary)">{{ a.title_fr }}</div>
                  <div class="text-xs truncate max-w-xs" style="color: var(--text-secondary)">{{ a.title_en }}</div>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    @for (tag of a.tags.slice(0,3); track tag) {
                      <span class="badge badge-primary">{{ tag }}</span>
                    }
                  </div>
                </td>
                <td>
                  <span [class]="a.published ? 'badge badge-success' : 'badge'">
                    {{ a.published ? ('BLOG.PUBLISHED' | translate) : ('BLOG.DRAFT' | translate) }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <a [routerLink]="['/admin/blog', a.id, 'edit']" class="btn-secondary py-1.5 px-3 text-xs">{{ 'ADMIN.EDIT' | translate }}</a>
                    <button (click)="delete(a)" class="px-3 py-1.5 rounded-lg text-xs font-medium" style="background: #fee2e2; color: #dc2626">{{ 'ADMIN.DELETE' | translate }}</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (!articles().length) {
          <div class="text-center py-12" style="color: var(--text-secondary)">{{ 'ADMIN.BLOG.EMPTY' | translate }}</div>
        }
      </div>
    </div>
  `,
})
export class AdminBlogListComponent {
  private blogSvc = inject(BlogService);
  protected articles = toSignal(this.blogSvc.getAll(), { initialValue: [] as BlogArticle[] });

  async delete(a: BlogArticle): Promise<void> {
    if (!confirm(`Supprimer "${a.title_fr}" ?`)) return;
    await this.blogSvc.delete(a.id!);
  }
}
