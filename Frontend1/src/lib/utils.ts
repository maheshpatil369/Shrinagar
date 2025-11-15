import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper to correctly format image URLs, ensuring they use the full backend path
 * if they are stored as relative paths (e.g., /uploads/image.png).
 * NOTE: Assumes backend is accessible at http://localhost:8000 in development.
 * @param imagePath The path to the image, which may be relative or a full URL.
 * @returns The full, correctly formatted image URL.
 */
export function getImageUrl(imagePath: string): string {
    if (!imagePath) return 'https://placehold.co/600x600/e2e8f0/a0aec0?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    
    // In production, this proxy won't be used, but in dev it maps to the backend.
    // We assume the backend serves relative paths under '/uploads' or similar.
    const baseUrl = import.meta.env.PROD 
        ? window.location.origin // In production, paths are relative to the frontend domain
        : 'http://localhost:8000'; // In development, use the proxied backend port

    // This handles paths like '/uploads/image.png' or 'uploads/image.png' 
    // by ensuring exactly one slash separates the base URL and the path.
    const cleanedPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    return `${baseUrl}/${cleanedPath}`;
}