import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { BlogService } from '../../../core/services/blog.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LanguageService } from '../../../core/services/language.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, ProductCardComponent],
  template: `
    <!-- ──────── HERO ──────── -->
    <section class="relative overflow-hidden" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2744 100%); min-height: 92vh; display: flex; align-items: center;">
      <!-- Background blobs -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style="background: radial-gradient(circle, var(--primary) 0%, transparent 70%)"></div>
        <div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-15" style="background: radial-gradient(circle, var(--accent) 0%, transparent 70%)"></div>
        <!-- Grid pattern -->
        <div class="absolute inset-0 opacity-5" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Text -->
          <div class="animate-fade-in-up">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6" style="background: rgba(14,165,233,0.15); color: #7dd3fc; border: 1px solid rgba(14,165,233,0.3)">
              <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              {{ 'HOME.HERO.BADGE' | translate }}
            </div>

            <h1 class="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              {{ 'HOME.HERO.TITLE_1' | translate }}
              <span class="block gradient-text mt-1">{{ 'HOME.HERO.TITLE_2' | translate }}</span>
            </h1>

            <p class="text-lg leading-relaxed mb-8" style="color: #94a3b8">
              {{ 'HOME.HERO.SUBTITLE' | translate }}
            </p>

            <!-- Search -->
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-2 flex gap-2 mb-8 border border-white/20">
              <input
                type="text"
                [(ngModel)]="heroSearch"
                (keydown.enter)="searchProducts()"
                [placeholder]="'HOME.HERO.SEARCH_PLACEHOLDER' | translate"
                class="flex-1 bg-transparent px-4 py-3 text-white placeholder-slate-400 outline-none text-base"
              />
              <button (click)="searchProducts()" class="btn-primary shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                {{ 'SEARCH.BUTTON' | translate }}
              </button>
            </div>

            <div class="flex flex-wrap gap-3">
              <a routerLink="/products" class="btn-primary">
                {{ 'HOME.HERO.CTA_PRIMARY' | translate }}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
              <a routerLink="/contact" class="btn-secondary border-white/20 text-white hover:bg-white/10">
                {{ 'HOME.HERO.CTA_SECONDARY' | translate }}
              </a>
            </div>
          </div>

          <!-- Illustration / Stats -->
          <div class="hidden lg:flex flex-col gap-4 items-end animate-fade-in-up" style="animation-delay: 0.2s">
            <!-- Medical illustration placeholder -->
            <div class="relative w-full max-w-md">
              <div class="rounded-3xl overflow-hidden aspect-square flex items-center justify-center" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1)">
                <svg class="w-48 h-48" style="color: rgba(14,165,233,0.4)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="0.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>

              <!-- Floating cards -->
              <div class="absolute -top-4 -left-4 glass rounded-2xl p-4 shadow-xl">
                <div class="text-2xl font-bold text-white">500+</div>
                <div class="text-xs text-slate-400">{{ 'HOME.STATS.PRODUCTS' | translate }}</div>
              </div>
              <div class="absolute -bottom-4 -right-4 glass rounded-2xl p-4 shadow-xl">
                <div class="text-2xl font-bold text-white">50+</div>
                <div class="text-xs text-slate-400">{{ 'HOME.STATS.CATEGORIES' | translate }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Trust bar -->
        <div class="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
          @for (stat of stats; track stat.label) {
            <div class="text-center">
              <div class="text-3xl font-extrabold text-white">{{ stat.value }}</div>
              <div class="text-sm mt-1" style="color: #94a3b8">{{ stat.label | translate }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ──────── CATEGORIES ──────── -->
    <section class="section" style="background: var(--bg)">
      <div class="max-w-7xl mx-auto">
        <h2 class="section-title">{{ 'HOME.CATEGORIES.TITLE' | translate }}</h2>
        <p class="section-subtitle">{{ 'HOME.CATEGORIES.SUBTITLE' | translate }}</p>

        @if (categories()?.length) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (cat of categories()?.slice(0, 8); track cat.id) {
              <a [routerLink]="['/products']" [queryParams]="{ category: cat.id }" class="card p-6 text-center cursor-pointer group">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-110" style="background: var(--primary-light)">
                  <span class="text-2xl">{{ cat.icon || '🏥' }}</span>
                </div>
                <h3 class="font-semibold text-sm" style="color: var(--text-primary)">{{ getCatName(cat) }}</h3>
              </a>
            }
          </div>
        } @else {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (cat of defaultCategories; track cat.name) {
              <div class="card p-6 text-center">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style="background: var(--primary-light)">
                  <span class="text-2xl">{{ cat.icon }}</span>
                </div>
                <h3 class="font-semibold text-sm" style="color: var(--text-primary)">{{ cat.name | translate }}</h3>
              </div>
            }
          </div>
        }

        <div class="text-center mt-8">
          <a routerLink="/products" class="btn-secondary">{{ 'HOME.CATEGORIES.VIEW_ALL' | translate }}</a>
        </div>
      </div>
    </section>

    <!-- ──────── FEATURED PRODUCTS ──────── -->
    <section class="section" style="background: var(--bg-card)">
      <div class="max-w-7xl mx-auto">
        <h2 class="section-title">{{ 'HOME.FEATURED.TITLE' | translate }}</h2>
        <p class="section-subtitle">{{ 'HOME.FEATURED.SUBTITLE' | translate }}</p>

        @if (products()?.length) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (p of products()?.slice(0, 8); track p.id) {
              <app-product-card [product]="p" />
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (i of [1,2,3,4]; track i) {
              <div class="card overflow-hidden">
                <div class="skeleton h-52 rounded-none"></div>
                <div class="p-4 space-y-2">
                  <div class="skeleton h-4 w-3/4 rounded"></div>
                  <div class="skeleton h-3 w-full rounded"></div>
                  <div class="skeleton h-3 w-1/2 rounded"></div>
                </div>
              </div>
            }
          </div>
        }

        <div class="text-center mt-10">
          <a routerLink="/products" class="btn-primary">{{ 'HOME.FEATURED.VIEW_ALL' | translate }}</a>
        </div>
      </div>
    </section>

    <!-- ──────── WHY US ──────── -->
    <section class="section" style="background: var(--bg)">
      <div class="max-w-7xl mx-auto">
        <h2 class="section-title">{{ 'HOME.WHY.TITLE' | translate }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          @for (feat of features; track feat.icon) {
            <div class="card p-6">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background: var(--primary-light)">
                <span class="text-2xl">{{ feat.icon }}</span>
              </div>
              <h3 class="font-bold text-lg mb-2" style="color: var(--text-primary)">{{ feat.title | translate }}</h3>
              <p class="text-sm leading-relaxed" style="color: var(--text-secondary)">{{ feat.desc | translate }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ──────── BLOG ──────── -->
    <section class="section" style="background: var(--bg-card)">
      <div class="max-w-7xl mx-auto">
        <h2 class="section-title">{{ 'HOME.BLOG.TITLE' | translate }}</h2>
        <p class="section-subtitle">{{ 'HOME.BLOG.SUBTITLE' | translate }}</p>

        @if (articles()?.length) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (a of articles()?.slice(0, 3); track a.id) {
              <a [routerLink]="['/blog', a.id]" class="card overflow-hidden group block">
                <div class="h-48 overflow-hidden">
                  @if (a.image) {
                    <img [src]="a.image" [alt]="getArticleTitle(a)" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  } @else {
                    <div class="img-placeholder w-full h-full">
                      <svg class="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <h3 class="font-bold text-base mb-2 line-clamp-2 group-hover:text-sky-500 transition-colors" style="color: var(--text-primary)">
                    {{ getArticleTitle(a) }}
                  </h3>
                  <p class="text-sm line-clamp-2" style="color: var(--text-secondary)">{{ getArticleContent(a) }}</p>
                </div>
              </a>
            }
          </div>
        }

        <div class="text-center mt-8">
          <a routerLink="/blog" class="btn-secondary">{{ 'HOME.BLOG.VIEW_ALL' | translate }}</a>
        </div>
      </div>
    </section>

    <!-- ──────── CTA ──────── -->
    <section class="section" style="background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-4xl font-extrabold text-white mb-4">{{ 'HOME.CTA.TITLE' | translate }}</h2>
        <p class="text-lg text-white/80 mb-8">{{ 'HOME.CTA.SUBTITLE' | translate }}</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/contact" class="px-8 py-3 bg-white rounded-xl font-bold transition-all hover:-translate-y-1 hover:shadow-lg" style="color: var(--primary)">
            {{ 'HOME.CTA.BUTTON' | translate }}
          </a>
          <a routerLink="/wiki" class="px-8 py-3 rounded-xl font-bold border-2 border-white/40 text-white transition-all hover:bg-white/10">
            {{ 'HOME.CTA.WIKI' | translate }}
          </a>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private productSvc = inject(ProductService);
  private categorySvc = inject(CategoryService);
  private blogSvc = inject(BlogService);
  private langSvc = inject(LanguageService);
  private router = inject(Router);

  protected products = toSignal(this.productSvc.getFeatured());
  protected categories = toSignal(this.categorySvc.getAll());
  protected articles = toSignal(this.blogSvc.getPublished());
  protected heroSearch = '';

  protected stats = [
    { value: '500+', label: 'HOME.STATS.PRODUCTS' },
    { value: '50+', label: 'HOME.STATS.CATEGORIES' },
    { value: '1000+', label: 'HOME.STATS.CLIENTS' },
    { value: '24/7', label: 'HOME.STATS.SUPPORT' },
  ];

  protected defaultCategories = [
    { icon: '🖥️', name: 'HOME.CAT.SCREENS' },
    { icon: '🏥', name: 'HOME.CAT.EQUIPMENT' },
    { icon: '🔬', name: 'HOME.CAT.DIAGNOSTIC' },
    { icon: '💊', name: 'HOME.CAT.CONSUMABLES' },
    { icon: '🩺', name: 'HOME.CAT.STETHOSCOPES' },
    { icon: '🩻', name: 'HOME.CAT.IMAGING' },
    { icon: '💉', name: 'HOME.CAT.INJECTION' },
    { icon: '🩹', name: 'HOME.CAT.CARE' },
  ];

  protected features = [
    { icon: '🚀', title: 'HOME.WHY.FAST_TITLE', desc: 'HOME.WHY.FAST_DESC' },
    { icon: '🔒', title: 'HOME.WHY.SECURE_TITLE', desc: 'HOME.WHY.SECURE_DESC' },
    { icon: '🌍', title: 'HOME.WHY.MULTILANG_TITLE', desc: 'HOME.WHY.MULTILANG_DESC' },
  ];

  ngOnInit(): void {}

  searchProducts(): void {
    if (this.heroSearch.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.heroSearch } });
    }
  }

  getCatName(cat: any): string {
    const l = this.langSvc.lang();
    return cat[`name_${l}`] ?? cat.name_fr ?? cat.name_en;
  }

  getArticleTitle(a: any): string {
    const l = this.langSvc.lang();
    return a[`title_${l}`] ?? a.title_fr ?? a.title_en;
  }

  getArticleContent(a: any): string {
    const l = this.langSvc.lang();
    const content = a[`content_${l}`] ?? a.content_fr ?? a.content_en ?? '';
    return content.replace(/<[^>]+>/g, '').slice(0, 120);
  }
}


