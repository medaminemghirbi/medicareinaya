import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BlogService } from '../../../../core/services/blog.service';
import { LanguageService } from '../../../../core/services/language.service';
import { BlogArticle } from '../../../../core/models/blog.model';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Back -->
      <a routerLink="/blog" class="inline-flex items-center gap-2 text-sm mb-6 hover:text-sky-500 transition-colors" style="color: var(--text-secondary)">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        {{ 'BLOG.BACK' | translate }}
      </a>

      @if (loading()) {
        <div class="space-y-4">
          <div class="skeleton h-10 w-3/4 rounded"></div>
          <div class="skeleton h-64 rounded-2xl"></div>
          <div class="space-y-2">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton h-4 rounded"></div>
            }
          </div>
        </div>
      } @else if (article()) {
        @if (article()!.image) {
          <img [src]="article()!.image" [alt]="getTitle()" class="w-full h-72 object-cover rounded-2xl mb-6" />
        }

        <div class="flex flex-wrap gap-2 mb-4">
          @for (tag of article()!.tags; track tag) {
            <span class="badge badge-primary">{{ tag }}</span>
          }
        </div>

        <h1 class="text-4xl font-extrabold mb-4" style="color: var(--text-primary)">{{ getTitle() }}</h1>

        <div
          class="prose max-w-none text-base leading-relaxed"
          style="color: var(--text-secondary)"
          [innerHTML]="getContent()"
        ></div>
      } @else {
        <div class="card p-16 text-center">
          <p style="color: var(--text-secondary)">{{ 'BLOG.NOT_FOUND' | translate }}</p>
          <a routerLink="/blog" class="btn-primary mt-4">{{ 'BLOG.BACK' | translate }}</a>
        </div>
      }
    </div>
  `,
})
export class BlogDetailComponent implements OnInit {
  private blogSvc = inject(BlogService);
  private langSvc = inject(LanguageService);
  private route = inject(ActivatedRoute);

  protected article = signal<BlogArticle | null>(null);
  protected loading = signal(true);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const article = await this.blogSvc.getById(id);
      if (article) this.article.set(article);
    }
    this.loading.set(false);
  }

  getTitle(): string {
    const a = this.article();
    if (!a) return '';
    const l = this.langSvc.lang();
    return (a as any)[`title_${l}`] ?? a.title_fr ?? a.title_en;
  }

  getContent(): string {
    const a = this.article();
    if (!a) return '';
    const l = this.langSvc.lang();
    return (a as any)[`content_${l}`] ?? a.content_fr ?? a.content_en ?? '';
  }
}
