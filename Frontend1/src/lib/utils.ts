import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | undefined | null) {
  if (!path) return 'https://placehold.co/600x400?text=No+Image';
  if (path.startsWith('http')) return path;
  // Remove any leading slash to avoid double slashes if backend provides relative path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `http://localhost:8000/${cleanPath}`;
}

// REMOVED: formatPrice function as price is no longer used in the application.