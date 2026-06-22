import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WikiService } from '../../../../core/services/wiki.service';
import { LanguageService } from '../../../../core/services/language.service';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-wiki-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, SearchBarComponent],
  template: `
    <!-- Header -->
    <div class="py-16 text-center" style="background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg) 100%)">
      <h1 class="text-4xl font-extrabold mb-4" style="color: var(--text-primary)">{{ 'WIKI.TITLE' | translate }}</h1>
      <p class="text-lg mb-8" style="color: var(--text-secondary)">{{ 'WIKI.SUBTITLE' | translate }}</p>
      <div class="max-w-lg mx-auto px-4">
        <app-search-bar (changed)="search.set($event)" [placeholder]="'WIKI.SEARCH' | translate" />
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Categories -->
      @if (!search()) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          @for (cat of wikiCategories; track cat.key) {
            <button
              (click)="selectedCat.set(selectedCat() === cat.key ? '' : cat.key)"
              class="card p-4 text-center transition-all"
              [style.border-color]="selectedCat() === cat.key ? 'var(--primary)' : ''"
              [style.background]="selectedCat() === cat.key ? 'var(--primary-light)' : ''"
            >
              <span class="text-2xl block mb-2">{{ cat.icon }}</span>
              <span class="text-sm font-medium" [style.color]="selectedCat() === cat.key ? 'var(--primary)' : 'var(--text-primary)'">{{ cat.label | translate }}</span>
            </button>
          }
        </div>
      }

      <!-- Pages -->
      @if (filtered().length) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (page of filtered(); track page.id) {
            <a [routerLink]="['/wiki', page.id]" class="card p-5 group block">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background: var(--primary-light)">
                  <svg class="w-5 h-5" style="color: var(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold mb-1 group-hover:text-sky-500 transition-colors" style="color: var(--text-primary)">{{ getTitle(page) }}</h3>
                  <p class="text-sm line-clamp-2" style="color: var(--text-secondary)">{{ getContent(page) }}</p>
                  @if (page.category) {
                    <span class="badge badge-primary mt-2">{{ page.category }}</span>
                  }
                </div>
              </div>
            </a>
          }
        </div>
      } @else {
        <div class="card p-16 text-center">
          <p style="color: var(--text-secondary)">{{ 'WIKI.NO_PAGES' | translate }}</p>
        </div>
      }
    </div>
  `,
})
export class WikiHomeComponent {
  private wikiSvc = inject(WikiService);
  private langSvc = inject(LanguageService);

  protected pages = toSignal(this.wikiSvc.getPublished(), { initialValue: [] });
  protected search = signal('');
  protected selectedCat = signal('');

  protected wikiCategories = [
    { key: 'usage', icon: '📖', label: 'WIKI.CAT.USAGE' },
    { key: 'products', icon: '📦', label: 'WIKI.CAT.PRODUCTS' },
    { key: 'warranty', icon: '🛡️', label: 'WIKI.CAT.WARRANTY' },
    { key: 'faq', icon: '❓', label: 'WIKI.CAT.FAQ' },
  ];

  protected filtered = computed(() => {
    let list = this.pages();
    const q = this.search().toLowerCase();
    const cat = this.selectedCat();

    if (q) list = list.filter(p => this.getTitle(p).toLowerCase().includes(q));
    if (cat) list = list.filter(p => p.category === cat);

    return list;
  });

  getTitle(p: any): string {
    const l = this.langSvc.lang();
    return p[`title_${l}`] ?? p.title_fr ?? p.title_en ?? '';
  }

  getContent(p: any): string {
    const l = this.langSvc.lang();
    const c = p[`content_${l}`] ?? p.content_fr ?? p.content_en ?? '';
    return c.replace(/<[^>]+>/g, '').slice(0, 120);
  }
}
