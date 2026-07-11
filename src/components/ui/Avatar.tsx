import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = '', fallback = '', ...props }, ref) => {
    const [hasError, setHasError] = React.useState(!src);

    React.useEffect(() => {
      setHasError(!src);
    }, [src]);

    const getInitials = (name: string) => {
      if (!name) return '?';
      return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border bg-muted',
          className
        )}
        {...props}
      >
        {!hasError && src ? (
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold select-none">
            {fallback ? getInitials(fallback) : getInitials(alt)}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
