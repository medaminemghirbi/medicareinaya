import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { WikiService } from '../../../../core/services/wiki.service';
import { LanguageService } from '../../../../core/services/language.service';
import { WikiPage } from '../../../../core/models/wiki.model';

@Component({
  selector: 'app-wiki-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <a routerLink="/wiki" class="inline-flex items-center gap-2 text-sm mb-6 hover:text-sky-500 transition-colors" style="color: var(--text-secondary)">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        {{ 'WIKI.BACK' | translate }}
      </a>

      @if (loading()) {
        <div class="space-y-4">
          <div class="skeleton h-10 w-3/4 rounded"></div>
          <div class="space-y-2">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="skeleton h-4 rounded"></div>
            }
          </div>
        </div>
      } @else if (page()) {
        <div class="flex flex-wrap gap-2 mb-4">
          @for (tag of page()!.tags; track tag) {
            <span class="badge badge-primary">{{ tag }}</span>
          }
          @if (page()!.category) {
            <span class="badge" style="background: var(--primary-light); color: var(--primary)">{{ page()!.category }}</span>
          }
        </div>

        <h1 class="text-4xl font-extrabold mb-6" style="color: var(--text-primary)">{{ getTitle() }}</h1>

        <div class="card p-8">
          <div
            class="prose max-w-none text-base leading-relaxed"
            style="color: var(--text-secondary)"
            [innerHTML]="getContent()"
          ></div>
        </div>
      } @else {
        <div class="card p-16 text-center">
          <p style="color: var(--text-secondary)">{{ 'WIKI.NOT_FOUND' | translate }}</p>
        </div>
      }
    </div>
  `,
})
export class WikiDetailComponent implements OnInit {
  private wikiSvc = inject(WikiService);
  private langSvc = inject(LanguageService);
  private route = inject(ActivatedRoute);

  protected page = signal<WikiPage | null>(null);
  protected loading = signal(true);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const page = await this.wikiSvc.getById(id);
      if (page) this.page.set(page);
    }
    this.loading.set(false);
  }

  getTitle(): string {
    const p = this.page();
    if (!p) return '';
    const l = this.langSvc.lang();
    return (p as any)[`title_${l}`] ?? p.title_fr ?? p.title_en;
  }

  getContent(): string {
    const p = this.page();
    if (!p) return '';
    const l = this.langSvc.lang();
    return (p as any)[`content_${l}`] ?? p.content_fr ?? p.content_en ?? '';
  }
}
