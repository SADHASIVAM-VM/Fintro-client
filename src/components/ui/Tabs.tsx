import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  className?: string;
  tabsClassName?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTabId,
  className,
  tabsClassName,
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultTabId || items[0]?.id);

  return (
    <div className={cn('w-full flex flex-col gap-4', className)}>
      <div
        className={cn(
          'inline-flex h-11 items-center justify-start rounded-full bg-[#E9E9E9] p-1 text-muted-foreground self-start border border-[#ECECEC]',
          tabsClassName
        )}
      >
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
                isActive
                  ? 'bg-primary text-[#141414] shadow-sm font-semibold'
                  : 'hover:bg-background/50 hover:text-[#141414]'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="mt-1 focus-visible:outline-none w-full">
        {items.find((item) => item.id === activeTab)?.content}
      </div>
    </div>
  );
};
