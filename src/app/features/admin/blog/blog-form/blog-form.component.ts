import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { BlogService } from '../../../../core/services/blog.service';
import { BlogArticle } from '../../../../core/models/blog.model';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="max-w-4xl">
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/admin/blog" class="w-9 h-9 flex items-center justify-center rounded-xl" style="border: 1px solid var(--border)">
          <svg class="w-4 h-4" style="color: var(--text-secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </a>
        <h1 class="text-2xl font-extrabold" style="color: var(--text-primary)">
          {{ isEdit() ? ('ADMIN.BLOG.EDIT' | translate) : ('ADMIN.BLOG.ADD' | translate) }}
        </h1>
      </div>

      <form (ngSubmit)="save()" class="space-y-5">
        <div class="card p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-field">
              <label class="form-label">{{ 'BLOG.TITLE_FR' | translate }} *</label>
              <input type="text" [(ngModel)]="form.title_fr" name="title_fr" required class="form-input" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'BLOG.TITLE_AR' | translate }}</label>
              <input type="text" [(ngModel)]="form.title_ar" name="title_ar" class="form-input" dir="rtl" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ 'BLOG.TITLE_EN' | translate }}</label>
              <input type="text" [(ngModel)]="form.title_en" name="title_en" class="form-input" />
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">{{ 'BLOG.CONTENT_FR' | translate }} *</label>
            <textarea [(ngModel)]="form.content_fr" name="content_fr" rows="6" required class="form-input resize-none font-mono text-sm"></textarea>
            <p class="text-xs mt-1" style="color: var(--text-secondary)">HTML supporté</p>
          </div>
          <div class="form-field">
            <label class="form-label">{{ 'BLOG.CONTENT_AR' | translate }}</label>
            <textarea [(ngModel)]="form.content_ar" name="content_ar" rows="4" class="form-input resize-none" dir="rtl"></textarea>
          </div>
          <div class="form-field">
            <label class="form-label">{{ 'BLOG.CONTENT_EN' | translate }}</label>
            <textarea [(ngModel)]="form.content_en" name="content_en" rows="4" class="form-input resize-none font-mono text-sm"></textarea>
          </div>

          <div class="form-field">
            <label class="form-label">{{ 'BLOG.IMAGE_URL' | translate }}</label>
            <input type="url" [(ngModel)]="form.image" name="image" class="form-input" placeholder="https://drive.google.com/..." />
          </div>

          <div class="form-field">
            <label class="form-label">{{ 'BLOG.TAGS' | translate }}</label>
            <input type="text" [ngModel]="tagsStr" (ngModelChange)="tagsStr = $event; updateTags()" name="tags" class="form-input" placeholder="tag1, tag2, tag3" />
          </div>

          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="form.published" name="published" class="w-4 h-4 accent-sky-500" />
              <span class="font-medium" style="color: var(--text-primary)">{{ 'BLOG.PUBLISH' | translate }}</span>
            </label>
          </div>
        </div>

        @if (error()) {
          <div class="rounded-xl p-4 text-sm" style="background: #fee2e2; color: #dc2626">{{ error() }}</div>
        }

        <div class="flex gap-3">
          <button type="submit" [disabled]="saving()" class="btn-primary py-3 px-8">{{ 'ADMIN.SAVE' | translate }}</button>
          <a routerLink="/admin/blog" class="btn-secondary py-3 px-8">{{ 'ADMIN.CANCEL' | translate }}</a>
        </div>
      </form>
    </div>
  `,
})
export class BlogFormComponent implements OnInit {
  private blogSvc = inject(BlogService);
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected isEdit = signal(false);
  protected saving = signal(false);
  protected error = signal('');
  protected tagsStr = '';

  protected form: Partial<BlogArticle> = {
    title_fr: '', title_ar: '', title_en: '',
    content_fr: '', content_ar: '', content_en: '',
    image: '', tags: [], published: false,
  };

  private editId: string | null = null;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.editId = id;
      const article = await this.blogSvc.getById(id);
      if (article) {
        this.form = article;
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
        await this.blogSvc.update(this.editId, this.form as BlogArticle);
      } else {
        await this.blogSvc.add(this.form as BlogArticle);
      }
      this.router.navigate(['/admin/blog']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Erreur');
    } finally {
      this.saving.set(false);
    }
  }
}
