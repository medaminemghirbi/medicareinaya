export type UserRole = 'admin' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
  location?: string;
  created_at: Date;
  updated_at: Date;
}
