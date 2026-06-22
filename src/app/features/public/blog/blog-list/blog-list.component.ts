import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BlogService } from '../../../../core/services/blog.service';
import { LanguageService } from '../../../../core/services/language.service';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, SearchBarComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold mb-2" style="color: var(--text-primary)">{{ 'BLOG.TITLE' | translate }}</h1>
        <p style="color: var(--text-secondary)">{{ 'BLOG.SUBTITLE' | translate }}</p>
      </div>

      <!-- Search -->
      <div class="max-w-lg mb-8">
        <app-search-bar (changed)="search.set($event)" [placeholder]="'BLOG.SEARCH' | translate" />
      </div>

      @if (filtered().length) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (a of filtered(); track a.id) {
            <a [routerLink]="['/blog', a.id]" class="card overflow-hidden group block">
              <div class="h-48 overflow-hidden">
                @if (a.image) {
                  <img [src]="a.image" [alt]="getTitle(a)" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                } @else {
                  <div class="img-placeholder w-full h-full">
                    <svg class="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                    </svg>
                  </div>
                }
              </div>
              <div class="p-5">
                <div class="flex flex-wrap gap-1 mb-3">
                  @for (tag of a.tags.slice(0, 3); track tag) {
                    <span class="badge badge-primary">{{ tag }}</span>
                  }
                </div>
                <h2 class="font-bold text-base mb-2 line-clamp-2 group-hover:text-sky-500 transition-colors" style="color: var(--text-primary)">{{ getTitle(a) }}</h2>
                <p class="text-sm line-clamp-3" style="color: var(--text-secondary)">{{ getContent(a) }}</p>
              </div>
            </a>
          }
        </div>
      } @else {
        <div class="card p-16 text-center">
          <p style="color: var(--text-secondary)">{{ 'BLOG.NO_ARTICLES' | translate }}</p>
        </div>
      }
    </div>
  `,
})
export class BlogListComponent {
  private blogSvc = inject(BlogService);
  private langSvc = inject(LanguageService);

  protected articles = toSignal(this.blogSvc.getPublished(), { initialValue: [] });
  protected search = signal('');

  protected filtered = computed(() => {
    const q = this.search().toLowerCase();
    if (!q) return this.articles();
    return this.articles().filter(a => {
      const t = this.getTitle(a).toLowerCase();
      return t.includes(q);
    });
  });

  getTitle(a: any): string {
    const l = this.langSvc.lang();
    return a[`title_${l}`] ?? a.title_fr ?? a.title_en ?? '';
  }

  getContent(a: any): string {
    const l = this.langSvc.lang();
    const c = a[`content_${l}`] ?? a.content_fr ?? a.content_en ?? '';
    return c.replace(/<[^>]+>/g, '').slice(0, 150);
  }
}
