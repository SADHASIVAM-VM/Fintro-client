import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileUrl(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const envApiUrl = import.meta.env.VITE_API_URL;
  let baseUrl = '';

  if (envApiUrl) {
    baseUrl = envApiUrl.replace('/api', '').replace(/\/$/, '');
  } else {
    // Default fallback to server dev port
    baseUrl = 'http://localhost:5000';
  }

  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return `${baseUrl}${cleanPath}`;
}
