import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <footer class="border-t mt-auto" style="background: var(--bg-card); border-color: var(--border)">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="md:col-span-2">
            <div class="flex items-center gap-2.5 mb-4">
          <a routerLink="/" class="flex items-center gap-2">
            <img src="assets/images/logo.png" alt="MedicareInaya" class="h-36 w-auto" />
          </a>
            </div>
            <p class="text-sm leading-relaxed max-w-xs" style="color: var(--text-secondary)">
              {{ 'FOOTER.DESCRIPTION' | translate }}
            </p>
          </div>

          <!-- Links -->
          <div>
            <h4 class="font-semibold mb-4 text-sm uppercase tracking-wider" style="color: var(--text-primary)">
              {{ 'FOOTER.NAVIGATION' | translate }}
            </h4>
            <ul class="space-y-2">
              @for (link of footerLinks; track link.path) {
                <li>
                  <a [routerLink]="link.path" class="text-sm transition-colors hover:text-sky-500" style="color: var(--text-secondary)">
                    {{ link.label | translate }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="font-semibold mb-4 text-sm uppercase tracking-wider" style="color: var(--text-primary)">
              {{ 'FOOTER.CONTACT' | translate }}
            </h4>
            <ul class="space-y-2 text-sm" style="color: var(--text-secondary)">
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                contact&#64;medicareinaya.dz
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                +213 555 000 000
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Tunisie
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4" style="border-color: var(--border)">
          <p class="text-sm" style="color: var(--text-secondary)">
            © {{ year }} MedicareInaya. {{ 'FOOTER.RIGHTS' | translate }}
          </p>
          <div class="flex items-center gap-4 text-sm" style="color: var(--text-secondary)">
            <a routerLink="/wiki" class="hover:text-sky-500 transition-colors">{{ 'FOOTER.HELP' | translate }}</a>
            <span>·</span>
            <a routerLink="/contact" class="hover:text-sky-500 transition-colors">{{ 'FOOTER.CONTACT' | translate }}</a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected year = new Date().getFullYear();
  protected footerLinks = [
    { path: '/', label: 'NAV.HOME' },
    { path: '/products', label: 'NAV.PRODUCTS' },
    { path: '/blog', label: 'NAV.BLOG' },
    { path: '/wiki', label: 'NAV.WIKI' },
    { path: '/contact', label: 'NAV.CONTACT' },
  ];
}
