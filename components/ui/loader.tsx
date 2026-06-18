'use client';

import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function Loader({ size = 'md', className, text }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-6', className)}>
      {/* Simple elegant spinner */}
      <div className={cn(
        sizeClasses[size],
        'rounded-full border-4 border-gray-200',
        'border-t-[#27509B] border-r-[#FCE500]',
        'animate-spin'
      )} />

      {/* Loading text */}
      {text && (
        <p className="text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

// Full page loader variant
export function PageLoader({ text = 'Chargement' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-yellow-50/20">
      <Loader size="lg" text={text} />
    </div>
  );
}
