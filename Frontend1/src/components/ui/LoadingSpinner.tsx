import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string; // Allow passing additional classes
  fullScreen?: boolean; // Option for full-screen loading
}

export function LoadingSpinner({
  size = 'md',
  message,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-10'; // Default padding if not full screen

  return (
    <div className={cn(containerClasses, className)}>
      <LoaderCircle className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && <p className="mt-4 text-muted-foreground">{message}</p>}
    </div>
  );
}
