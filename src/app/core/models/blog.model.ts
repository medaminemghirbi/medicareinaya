export interface BlogArticle {
  id?: string;
  title_ar: string;
  title_fr: string;
  title_en: string;
  content_ar: string;
  content_fr: string;
  content_en: string;
  image?: string;
  tags: string[];
  slug?: string;
  category?: string;
  published: boolean;
  created_at?: Date;
  updated_at?: Date;
}
