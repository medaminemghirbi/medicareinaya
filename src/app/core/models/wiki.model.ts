export interface WikiPage {
  id?: string;
  title_ar: string;
  title_fr: string;
  title_en: string;
  content_ar: string;
  content_fr: string;
  content_en: string;
  category?: string;
  slug?: string;
  tags: string[];
  published: boolean;
  created_at?: Date;
  updated_at?: Date;
}
