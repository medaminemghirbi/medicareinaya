import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { WikiService } from '../../../../core/services/wiki.service';
import { WikiPage } from '../../../../core/models/wiki.model';

@Component({
  selector: 'app-wiki-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="max-w-4xl">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/admin/wiki" class="w-9 h-9 flex items-center justify-center rounded-xl" style="border: 1px solid var(--border)">
          <svg class="w-4 h-4" style="color: var(--text-secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </a>
        <h1 class="text-2xl font-extrabold" style="color: var(--text-primary)">
          {{ isEdit() ? ('ADMIN.WIKI.EDIT' | translate) : ('ADMIN.WIKI.ADD' | translate) }}
        </h1>
      </div>

      <form (ngSubmit)="save()" class="space-y-5">
        <div class="card p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label class="form-label">{{ 'WIKI.TITLE_FR' | translate }} *</label>
              <input type="text" [(ngModel)]="form.title_fr" name="title_fr" required class="form-input" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'WIKI.TITLE_AR' | translate }}</label>
              <input type="text" [(ngModel)]="form.title_ar" name="title_ar" class="form-input" dir="rtl" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'WIKI.TITLE_EN' | translate }}</label>
              <input type="text" [(ngModel)]="form.title_en" name="title_en" class="form-input" />
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">{{ 'WIKI.CONTENT_FR' | translate }} *</label>
            <textarea [(ngModel)]="form.content_fr" name="content_fr" rows="8" required class="form-input resize-none font-mono text-sm"></textarea>
            <p class="text-xs mt-1" style="color: var(--text-secondary)">HTML supporté</p>
          </div>
          <div class="form-field">
            <label class="form-label">{{ 'WIKI.CONTENT_AR' | translate }}</label>
            <textarea [(ngModel)]="form.content_ar" name="content_ar" rows="4" class="form-input resize-none" dir="rtl"></textarea>
          </div>
          <div class="form-field">
            <label class="form-label">{{ 'WIKI.CONTENT_EN' | translate }}</label>
            <textarea [(ngModel)]="form.content_en" name="content_en" rows="4" class="form-input resize-none font-mono text-sm"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-field">
              <label class="form-label">{{ 'WIKI.CATEGORY' | translate }}</label>
              <select [(ngModel)]="form.category" name="category" class="form-input">
                <option value="">-- Catégorie --</option>
                <option value="usage">Usage</option>
                <option value="products">Produits</option>
                <option value="warranty">Garantie</option>
                <option value="faq">FAQ</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'WIKI.TAGS' | translate }}</label>
              <input type="text" [ngModel]="tagsStr" (ngModelChange)="tagsStr = $event; updateTags()" name="tags" class="form-input" placeholder="tag1, tag2" />
            </div>
          </div>

          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="form.published" name="published" class="w-4 h-4 accent-sky-500" />
              <span class="font-medium" style="color: var(--text-primary)">{{ 'WIKI.PUBLISH' | translate }}</span>
            </label>
          </div>
        </div>

        @if (error()) {
          <div class="rounded-xl p-4 text-sm" style="background: #fee2e2; color: #dc2626">{{ error() }}</div>
        }

        <div class="flex gap-3">
          <button type="submit" [disabled]="saving()" class="btn-primary py-3 px-8">{{ 'ADMIN.SAVE' | translate }}</button>
          <a routerLink="/admin/wiki" class="btn-secondary py-3 px-8">{{ 'ADMIN.CANCEL' | translate }}</a>
        </div>
      </form>
    </div>
  `,
})
export class WikiFormComponent implements OnInit {
  private wikiSvc = inject(WikiService);
  private firestore = inject(Firestore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected isEdit = signal(false);
  protected saving = signal(false);
  protected error = signal('');
  protected tagsStr = '';

  protected form: Partial<WikiPage> = {
    title_fr: '', title_ar: '', title_en: '',
    content_fr: '', content_ar: '', content_en: '',
    category: '', tags: [], published: false,
  };

  private editId: string | null = null;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.editId = id;
      const snap = await getDoc(doc(this.firestore, 'wiki_pages', id));
      if (snap.exists()) {
        this.form = { id, ...snap.data() } as WikiPage;
        this.tagsStr = (this.form.tags ?? []).join(', ');
      }
    }
  }

  updateTags(): void {
    this.form.tags = this.tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set('');
    try {
      if (this.isEdit() && this.editId) {
        await this.wikiSvc.update(this.editId, this.form as WikiPage);
      } else {
        await this.wikiSvc.add(this.form as WikiPage);
      }
      this.router.navigate(['/admin/wiki']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Erreur');
    } finally {
      this.saving.set(false);
    }
  }
}
