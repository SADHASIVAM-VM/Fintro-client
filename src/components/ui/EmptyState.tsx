import React from 'react';
import { Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl bg-card/30', className)}>
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
        {icon || <Database className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 font-sans">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
