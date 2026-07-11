import type { User } from '@/features/auth/authSlice';

export type Role = 'admin' | 'user';

export interface UserProfile extends User {
  bio?: string;
  phoneNumber?: string;
  location?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}
