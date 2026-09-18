import * as React from 'react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, X } from 'lucide-react';
import dayjs from 'dayjs';

export interface BillCalendarEvent {
  day: number;
  icon?: React.ElementType;
  color?: string;
  isPaid?: boolean;
  name: string;
}

export interface DateCalendarBarProps {
  selectedDate?: number | null;
  onSelectDate?: (dateNumber: number | null) => void;
  billEvents?: BillCalendarEvent[];
  className?: string;
}

const WEEK_DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DateCalendarBar: React.FC<DateCalendarBarProps> = ({
  selectedDate,
  onSelectDate,
  billEvents = [],
  className,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const currentMonthName = dayjs().format('MMMM YYYY');
  const daysInMonthCount = dayjs().daysInMonth();
  const currentDayNumber = dayjs().date();
  const firstDayOfWeekOffset = dayjs().startOf('month').day(); // 0 = Sun, 1 = Mon...

  // Quick lookup map for bill events on days
  const eventsByDay = useMemo(() => {
    const map: Record<number, BillCalendarEvent[]> = {};
    billEvents.forEach((ev) => {
      if (!map[ev.day]) map[ev.day] = [];
      map[ev.day].push(ev);
    });
    return map;
  }, [billEvents]);

  // Generate days array based on viewMode ('month' vs 'week')
  const displayedDays = useMemo(() => {
    if (viewMode === 'week') {
      const startOfWeek = dayjs().startOf('week');
      return Array.from({ length: 7 }).map((_, i) => {
        const d = startOfWeek.add(i, 'day');
        return {
          dateNumber: d.date(),
          isCurrentMonth: d.month() === dayjs().month(),
          isOffset: false,
        };
      });
    }

    // Full Month with weekday alignment padding
    const padding = Array.from({ length: firstDayOfWeekOffset }).map(() => ({
      dateNumber: 0,
      isCurrentMonth: false,
      isOffset: true,
    }));

    const days = Array.from({ length: daysInMonthCount }).map((_, i) => ({
      dateNumber: i + 1,
      isCurrentMonth: true,
      isOffset: false,
    }));

    return [...padding, ...days];
  }, [viewMode, daysInMonthCount, firstDayOfWeekOffset]);

  const handleDateClick = (dateNum: number) => {
    if (dateNum === 0) return;
    if (selectedDate === dateNum) {
      onSelectDate?.(null); // Deselect to clear filter / Show All
    } else {
      onSelectDate?.(dateNum);
    }
  };

  return (
    <div
      className={cn(
        'w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-4 shadow-sm transition-all',
        className
      )}
    >
      {/* Top Header Row with Calendar Title & View Mode Selector */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
            {currentMonthName}
          </span>
          {selectedDate !== null && selectedDate !== undefined && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
              Filtering Day {selectedDate}
              <button
                type="button"
                onClick={() => onSelectDate?.(null)}
                className="hover:text-purple-900 dark:hover:text-white ml-0.5 cursor-pointer"
                title="Show All"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Top Right Calendar Filter ("This Month" vs "This Week") */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={cn(
              'px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer',
              viewMode === 'month'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={cn(
              'px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer',
              viewMode === 'week'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Week Day Column Headers (Fixed 7-Column Grid) */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEK_DAY_NAMES.map((dayName, idx) => (
          <span key={idx} className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase">
            {dayName}
          </span>
        ))}
      </div>

      {/* Non-Scrolling Fixed Grid Box */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
        {displayedDays.map((d, i) => {
          if (d.isOffset) {
            return <div key={i} className="h-11 sm:h-12 w-full" />;
          }

          const isSelected = selectedDate === d.dateNumber;
          const isToday = currentDayNumber === d.dateNumber;
          const dayEvents = eventsByDay[d.dateNumber] || [];
          const primaryEvent = dayEvents[0];
          const EventIcon = primaryEvent?.icon;

          const hasPending = dayEvents.some((ev) => !ev.isPaid);
          const isAllPaid = dayEvents.length > 0 && dayEvents.every((ev) => ev.isPaid);

          const badgeBg = isAllPaid
            ? 'bg-emerald-500 text-white'
            : 'bg-amber-500 text-white';

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleDateClick(d.dateNumber)}
              className="flex flex-col items-center justify-start gap-0.5 focus:outline-none cursor-pointer group transition-all p-0.5 rounded-2xl w-full"
            >
              <div
                className={cn(
                  'h-8 w-8 sm:h-9 sm:w-9 rounded-2xl flex items-center justify-center transition-all duration-200 text-xs font-black relative',
                  isSelected
                    ? 'bg-[#18181B] text-white shadow-md dark:bg-white dark:text-[#18181B] scale-105 ring-2 ring-purple-500'
                    : isToday
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                )}
              >
                {d.dateNumber}

                {/* Status Indicator Dot (Amber for pending due, Green for paid) */}
                {dayEvents.length > 0 && !isSelected && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white dark:border-zinc-900',
                      badgeBg,
                      hasPending && 'animate-pulse'
                    )}
                  />
                )}
              </div>

              {/* Assigned Service Icon Badge below date */}
              <div className="h-3.5 flex items-center justify-center">
                {primaryEvent && EventIcon ? (
                  <div
                    className={cn(
                      'p-0.5 rounded-md shadow-2xs flex items-center justify-center transition-colors',
                      badgeBg
                    )}
                    title={`${primaryEvent.name} (${hasPending ? 'Pending Due' : 'Paid'}) on day ${d.dateNumber}`}
                  >
                    <EventIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                  </div>
                ) : (
                  <span className="h-1 w-1 rounded-full bg-transparent" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateCalendarBar;
