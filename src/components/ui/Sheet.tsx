import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  className,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      closeButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sideClasses = {
    left: 'left-0 top-0 bottom-0 h-full w-3/4 max-w-xs border-r slide-in-from-left animate-in duration-200',
    right: 'right-0 top-0 bottom-0 h-full w-3/4 max-w-xs border-l slide-in-from-right animate-in duration-200',
    top: 'top-0 left-0 right-0 w-full h-1/3 border-b slide-in-from-top animate-in duration-200',
    bottom: 'bottom-0 left-0 right-0 w-full h-1/2 border-t rounded-t-2xl slide-in-from-bottom animate-in duration-200',
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
      />
      {/* Sheet Content */}
      <div
        className={cn(
          'fixed bg-card text-card-foreground p-6 shadow-2xl flex flex-col z-50',
          sideClasses[side],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close sheet"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto text-sm text-muted-foreground font-sans">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
export default Sheet;
