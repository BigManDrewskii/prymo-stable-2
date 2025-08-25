import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'muted';
  className?: string;
  text?: string;
  icon?: 'loader' | 'sparkles';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const variantClasses = {
  default: 'text-foreground',
  primary: 'text-primary',
  muted: 'text-muted-foreground',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text,
  icon = 'loader',
}) => {
  const IconComponent = icon === 'sparkles' ? Sparkles : Loader2;
  
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <IconComponent 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )} 
      />
      {text && (
        <span className={cn('text-sm font-medium', variantClasses[variant])}>
          {text}
        </span>
      )}
    </div>
  );
};

// Full page loading component
interface PageLoadingProps {
  message?: string;
  showLogo?: boolean;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
  showLogo = true,
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        {showLogo && (
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <LoadingSpinner size="lg" variant="primary" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Inline loading component for buttons
interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  isLoading,
  children,
  loadingText,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        {loadingText || 'Loading...'}
      </div>
    );
  }
  
  return <>{children}</>;
};

// Skeleton loading component
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-muted rounded';
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              index === lines - 1 ? 'w-3/4' : 'w-full',
              className
            )}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
    />
  );
};

// Loading overlay component
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Processing...',
  className,
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50',
      className
    )}>
      <div className="bg-card border rounded-lg p-6 shadow-lg">
        <LoadingSpinner size="lg" variant="primary" text={message} />
      </div>
    </div>
  );
};

// Lazy loading wrapper
interface LazyLoadingProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyLoading: React.FC<LazyLoadingProps> = ({
  children,
  fallback,
  className,
}) => {
  return (
    <React.Suspense 
      fallback={
        fallback || (
          <div className={cn('flex items-center justify-center p-8', className)}>
            <LoadingSpinner size="lg" variant="primary" text="Loading component..." />
          </div>
        )
      }
    >
      {children}
    </React.Suspense>
  );
};

export default LoadingSpinner;