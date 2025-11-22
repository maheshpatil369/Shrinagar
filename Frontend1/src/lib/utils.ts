import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | undefined | null) {
  if (!path) return 'https://placehold.co/600x400?text=No+Image';
  if (path.startsWith('http')) return path;

  // Remove leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // ✅ ONLY CHANGE: use backend URL from env
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return `${backendUrl}/${cleanPath}`;
}

// REMOVED: formatPrice function as price is no longer used
