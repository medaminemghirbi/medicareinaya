export type ContactStatus = 'new' | 'read' | 'replied';

export interface ContactRequest {
  id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  message: string;
  product_requested?: string;
  status: ContactStatus;
  created_at?: Date;
}
