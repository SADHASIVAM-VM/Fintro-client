import React, { useState } from 'react';
import {
  ChevronDown,
  ArrowUpDown,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './Table';
import { Button } from './Button';
import { Input } from './Input';
import { Dropdown } from './Dropdown';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface BulkActionDef<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedRows: T[]) => void;
  variant?: 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  
  // Pagination
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;

  // Search & Filter
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue?: string;
  filterOptions?: FilterOption[];
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;

  // Sorting
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (key: string, order: 'asc' | 'desc') => void;

  // Selection & Bulk Actions
  selectedRows?: T[];
  onSelectedRowsChange?: (rows: T[]) => void;
  bulkActions?: BulkActionDef<T>[];
  getRowId: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  currentPage,
  limit,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
  searchValue,
  onSearchChange,
  filterValue = '',
  filterOptions = [],
  onFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  selectedRows = [],
  onSelectedRowsChange,
  bulkActions = [],
  getRowId,
}: DataTableProps<T>) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((c) => c.key)
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectedRowsChange) return;
    if (e.target.checked) {
      onSelectedRowsChange(data);
    } else {
      onSelectedRowsChange([]);
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (!onSelectedRowsChange) return;
    const rowId = getRowId(row);
    if (checked) {
      onSelectedRowsChange([...selectedRows, row]);
    } else {
      onSelectedRowsChange(selectedRows.filter((r) => getRowId(r) !== rowId));
    }
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSort = (key: string) => {
    if (sortBy === key) {
      onSortChange(key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(key, 'asc');
    }
  };

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const columnsDropdownItems = columns.map((col) => ({
    id: `col-${col.key}`,
    label: (
      <label className="flex items-center gap-2 cursor-pointer w-full font-sans text-xs">
        <input
          type="checkbox"
          checked={visibleColumns.includes(col.key)}
          onChange={() => toggleColumnVisibility(col.key)}
          className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
        />
        {typeof col.header === 'string' ? col.header : col.key}
      </label>
    ),
  }));

  const activeColumns = columns.filter((col) => visibleColumns.includes(col.key));

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Filter, Column Visibility, Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border">
        <div className="flex-1 flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search database..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>

          {/* Custom Filter Select Option */}
          {onFilterChange && filterOptions.length > 0 && (
            <div className="w-40">
              <select
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Roles</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Visibility column trigger */}
          <Dropdown
            trigger={
              <Button variant="outline" size="sm" className="h-10 gap-1.5 font-sans">
                <Eye className="h-4 w-4" /> Columns <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
            items={columnsDropdownItems}
          />
        </div>

        {/* Selected Rows Bulk actions display */}
        {selectedRows.length > 0 && bulkActions.length > 0 && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-semibold text-primary font-sans">
              {selectedRows.length} selected
            </span>
            <div className="flex items-center gap-1.5">
              {bulkActions.map((act, idx) => (
                <Button
                  key={idx}
                  variant={act.variant || 'outline'}
                  size="sm"
                  onClick={() => act.onClick(selectedRows)}
                  className="h-8 py-1 px-2.5 text-xs font-sans gap-1"
                >
                  {act.icon}
                  {act.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Table Content */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            title="No records found"
            description="Your search criteria did not match any database items. Try clearing your filters or search query."
            actionLabel="Reset Search"
            onAction={() => {
              onSearchChange('');
              onFilterChange?.('');
            }}
            className="border-none py-16"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {/* Select All checkbox */}
                {onSelectedRowsChange && (
                  <TableHead className="w-[48px] text-center pl-4">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = isSomeSelected;
                        }
                      }}
                      onChange={handleSelectAll}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                  </TableHead>
                )}

                {/* Column Headers */}
                {activeColumns.map((col) => (
                  <TableHead key={col.key}>
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 transition-all"
                      >
                        {col.header}
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows.some((r) => getRowId(r) === rowId);

                return (
                  <TableRow key={rowId} data-state={isSelected ? 'selected' : undefined}>
                    {/* Row checkbox selection */}
                    {onSelectedRowsChange && (
                      <TableCell className="text-center pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(row, e.target.checked)}
                          className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        />
                      </TableCell>
                    )}

                    {/* Column cells */}
                    {activeColumns.map((col) => (
                      <TableCell key={col.key}>{col.cell(row)}</TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border">
          <span className="text-xs font-medium text-muted-foreground font-sans">
            Showing Page {currentPage} of {totalPages} ({totalItems} total records)
          </span>

          <div className="flex items-center gap-1.5">
            {/* Limit adjustments */}
            {onLimitChange && (
              <div className="flex items-center gap-1.5 mr-4 text-xs font-sans text-muted-foreground">
                <span>Rows:</span>
                <select
                  value={limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="rounded border border-input bg-background h-8 px-1 text-foreground"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="h-8 font-sans gap-0.5"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            
            {/* Page number nodes */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const isActive = p === currentPage;
              return (
                <Button
                  key={p}
                  variant={isActive ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  disabled={isLoading}
                  className="h-8 w-8 p-0 text-xs font-sans"
                >
                  {p}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="h-8 font-sans gap-0.5"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
