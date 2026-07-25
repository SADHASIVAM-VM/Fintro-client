import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSnackbar } from 'notistack';
import { useDropzone } from 'react-dropzone';
import {
  Plus,
  Search,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Calendar,
  Eye,
} from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { useSettings } from '@/hooks/useSettings';
import { useIncome } from '@/hooks/useIncome';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';
import { BillViewer } from '@/components/ui/BillViewer';
import { getFileUrl } from '@/lib/utils';

// Expense schema validation
const expenseFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  category: z.string().min(1, 'Please select a category'),
  paymentMode: z.enum(['cash', 'upi', 'credit_card', 'debit_card', 'net_banking']),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type ExpenseFormSchema = z.infer<typeof expenseFormSchema>;

// Income schema validation
const incomeFormSchema = z.object({
  source: z.enum(['salary', 'freelance', 'bonus', 'refund', 'interest', 'gift']),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type IncomeFormSchema = z.infer<typeof incomeFormSchema>;

export const Expenses: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // Tabs switcher state
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>('expenses');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Viewer Modal State
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | undefined>(undefined);
  const [viewerTitle, setViewerTitle] = useState<string | undefined>(undefined);
  
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | 'month' | '3months'>('all');
  const [viewingExpense, setViewingExpense] = useState<any | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    paymentMode: '',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const handleDateFilterChange = (filter: 'all' | '7days' | 'month' | '3months') => {
    setDateFilter(filter);
    
    let startDate = '';
    let endDate = '';
    
    if (filter === '7days') {
      startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      endDate = dayjs().format('YYYY-MM-DD');
    } else if (filter === 'month') {
      startDate = dayjs().startOf('month').format('YYYY-MM-DD');
      endDate = dayjs().endOf('month').format('YYYY-MM-DD');
    } else if (filter === '3months') {
      startDate = dayjs().subtract(3, 'month').format('YYYY-MM-DD');
      endDate = dayjs().format('YYYY-MM-DD');
    }
    
    setQueryParams((prev) => ({
      ...prev,
      startDate,
      endDate,
      page: 1,
    }));
  };

  // Queries
  const { data: expensesData, isLoading: isLoadingExpenses, createExpense, deleteExpense } = useExpenses(queryParams);
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const { data: incomes = [], isLoading: isLoadingIncomes, createIncome, deleteIncome } = useIncome();

  const currency = settings?.currency || 'INR';

  // React Hook Form for Expenses
  const {
    register: regExpense,
    handleSubmit: handleExpenseSubmit,
    reset: resetExpense,
    formState: { errors: expenseErrors, isSubmitting: isSubmittingExpense },
  } = useForm<ExpenseFormSchema>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date: dayjs().format('YYYY-MM-DD'),
      paymentMode: 'upi',
    },
  });

  // React Hook Form for Incomes
  const {
    register: regIncome,
    handleSubmit: handleIncomeSubmit,
    reset: resetIncome,
    formState: { errors: incomeErrors, isSubmitting: isSubmittingIncome },
  } = useForm<IncomeFormSchema>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      source: 'salary',
      date: dayjs().format('YYYY-MM-DD'),
    },
  });

  // Dropzone setup
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      enqueueSnackbar('Receipt image selected', { variant: 'success' });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const onSubmitExpense = async (formData: ExpenseFormSchema) => {
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('amount', formData.amount);
      fd.append('category', formData.category);
      fd.append('paymentMode', formData.paymentMode);
      fd.append('date', formData.date);
      if (formData.time) fd.append('time', formData.time);
      if (formData.notes) fd.append('notes', formData.notes);
      
      if (formData.tags) {
        const tagList = formData.tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
        fd.append('tags', JSON.stringify(tagList));
      }

      if (selectedFile) {
        fd.append('receipt', selectedFile);
      }

      await createExpense(fd);
      enqueueSnackbar('Expense logged successfully', { variant: 'success' });
      setIsAddOpen(false);
      resetExpense();
      setSelectedFile(null);
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to save expense', { variant: 'error' });
    }
  };

  const onSubmitIncome = async (formData: IncomeFormSchema) => {
    try {
      await createIncome({
        source: formData.source,
        amount: Number(formData.amount),
        date: formData.date,
        notes: formData.notes,
      });
      enqueueSnackbar('Income logged successfully', { variant: 'success' });
      setIsIncomeOpen(false);
      resetIncome();
    } catch {
      enqueueSnackbar('Failed to log monthly salary amount', { variant: 'error' });
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteExpense = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income record?')) return;
    try {
      await deleteIncome(id);
      enqueueSnackbar('Income record deleted', { variant: 'info' });
    } catch {
      enqueueSnackbar('Failed to delete income', { variant: 'error' });
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Helmet>
        <title>Expenses & Incomes | Fintro</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Cashflow Ledger</h1>
          <p className="text-muted-foreground text-sm font-sans mt-0.5">
            Log daily payouts, track monthly salary inflows, and review category budgets.
          </p>
        </div>
        {activeTab === 'expenses' ? (
          <Button variant="primary" onClick={() => setIsAddOpen(true)} className="gap-1.5 font-sans">
            <Plus className="h-4.5 w-4.5" /> Log Expense
          </Button>
        ) : (
          <Button variant="primary" onClick={() => setIsIncomeOpen(true)} className="gap-1.5 font-sans">
            <Plus className="h-4.5 w-4.5" /> Log Income
          </Button>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <div className="inline-flex h-11 items-center justify-start rounded-full bg-muted p-1 text-muted-foreground self-start border border-border gap-1">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-primary text-[#141414] shadow-sm font-semibold'
              : 'hover:bg-card/50 hover:text-foreground'
          }`}
        >
          Expenses (Outflow)
        </button>
        <button
          onClick={() => setActiveTab('incomes')}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
            activeTab === 'incomes'
              ? 'bg-primary text-[#141414] shadow-sm font-semibold'
              : 'hover:bg-card/50 hover:text-foreground'
          }`}
        >
          Incomes (Inflow)
        </button>
      </div>

      {/* EXPENSES TAB CONTENT */}
      {activeTab === 'expenses' && (
        <>
          {/* Grid Filters */}
          <div className="grid gap-3 md:grid-cols-4 bg-card p-4 rounded-xl border">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                placeholder="Search details..."
                value={queryParams.search}
                onChange={(e) => setQueryParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-9 h-10 w-full"
              />
            </div>

            {/* Category Filter */}
            <select
              value={queryParams.category}
              onChange={(e) => setQueryParams((prev) => ({ ...prev, category: e.target.value, page: 1 }))}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Payment Filter */}
            <select
              value={queryParams.paymentMode}
              onChange={(e) => setQueryParams((prev) => ({ ...prev, paymentMode: e.target.value, page: 1 }))}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
            >
              <option value="">All Payments</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="net_banking">Net Banking</option>
            </select>
            
            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setDateFilter('all');
                setQueryParams({
                  page: 1,
                  limit: 10,
                  search: '',
                  category: '',
                  paymentMode: '',
                  startDate: '',
                  endDate: '',
                  sortBy: 'date',
                  sortOrder: 'desc',
                });
              }}
              className="h-10 text-xs font-sans"
            >
              Reset Filters
            </Button>
          </div>

          {/* Date Filters & Total Summary Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card p-4 rounded-xl border my-4">
            {/* Predefined Date Filters Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm font-semibold text-muted-foreground shrink-0">Date Filter:</span>
              <select
                value={dateFilter}
                onChange={(e) => handleDateFilterChange(e.target.value as any)}
                className="flex h-10 w-full md:w-48 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none cursor-pointer"
              >
                <option value="all">All Expenses</option>
                <option value="7days">Last 7 Days</option>
                <option value="month">This Month</option>
                <option value="3months">Last 3 Months</option>
              </select>
            </div>

            {/* Total Expense Summary */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-primary/10 border border-primary/20 rounded-xl px-4 py-2">
              <div className="flex flex-col text-left md:text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-sans">Total Expense</span>
                <span className="text-lg font-extrabold text-foreground font-sans whitespace-nowrap">
                  {currency === 'INR' ? '₹' : currency} {(expensesData?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="rounded-xl border bg-card overflow-hidden">
            {isLoadingExpenses ? (
              <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
            ) : !expensesData || expensesData.data.length === 0 ? (
              <EmptyState
                title="No expenses logged"
                description="Log your daily expenses, select payment modes, and add receipt photos to track your savings."
                actionLabel="Log First Expense"
                onAction={() => setIsAddOpen(true)}
                className="border-none py-16"
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-4 font-semibold text-muted-foreground w-[50%] md:w-auto">Expense Name</th>
                      <th className="p-4 font-semibold text-muted-foreground hidden md:table-cell">Category</th>
                      <th className="p-4 font-semibold text-muted-foreground">Amount</th>
                      <th className="p-4 font-semibold text-muted-foreground hidden md:table-cell">Payment</th>
                      <th className="p-4 font-semibold text-muted-foreground">Receipt</th>
                      <th className="p-4 font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesData.data.map((item: any) => (
                      <tr key={item._id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-left">
                          <span className="font-semibold text-foreground text-sm block">{item.title}</span>
                          <span className="text-xs text-muted-foreground font-sans block mt-0.5">
                            {item.date} {item.time ? `@ ${item.time}` : ''}
                          </span>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {item.tags.map((t: string) => (
                                <Badge key={t} variant="outline" className="text-[10px] py-0 px-1 font-mono">{t}</Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-left hidden md:table-cell">
                          {item.category && (
                            <Badge
                              style={{
                                backgroundColor: `${item.category.color}15`,
                                color: item.category.color,
                                borderColor: `${item.category.color}35`,
                              }}
                              className="font-sans font-semibold border"
                            >
                              {item.category.name}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 font-bold font-sans">
                          {currency} {item.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-left uppercase text-xs font-semibold text-muted-foreground hidden md:table-cell">
                          {item.paymentMode.replace('_', ' ')}
                        </td>
                        <td className="p-4 text-left font-sans">
                          <button
                            onClick={() => {
                              setViewerUrl(item.receiptImage && item.receiptImage !== 'null' ? getFileUrl(item.receiptImage) : undefined);
                              setViewerTitle(`Receipt: ${item.title}`);
                              setIsViewerOpen(true);
                            }}
                            className="inline-flex items-center gap-1 text-black hover:text-primary hover:underline font-medium text-xs bg-transparent border-0 cursor-pointer p-0"
                          >
                            <span role="img" aria-label="receipt" className="text-sm">📄</span>
                            <span className="text-black font-semibold truncate max-w-[120px] block">
                              {item.receiptImage && item.receiptImage !== 'null'
                                ? item.receiptImage.split('/').pop()?.split('-').slice(1).join('-') || 'Receipt'
                                : 'No Receipt'
                              }
                            </span>
                          </button>
                        </td>
                        <td className="p-4 text-left">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingExpense(item)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteExpense(item._id)}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              title="Delete Expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {expensesData && expensesData.totalPages > 1 && (
                <div className="flex items-center justify-between border-t p-4 bg-muted/20 font-sans">
                  <span className="text-xs text-muted-foreground">
                    Showing page {expensesData.page} of {expensesData.totalPages} ({expensesData.total} total expenses)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={expensesData.page <= 1}
                      onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className="h-8 text-xs cursor-pointer"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: expensesData.totalPages }, (_, i) => i + 1).map((p) => {
                      const isCurrent = p === queryParams.page;
                      return (
                        <button
                          key={p}
                          onClick={() => setQueryParams((prev) => ({ ...prev, page: p }))}
                          className={`h-8 w-8 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                            isCurrent
                              ? 'bg-primary text-[#141414] border-primary font-bold shadow-sm'
                              : 'bg-background hover:bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={expensesData.page >= expensesData.totalPages}
                      onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="h-8 text-xs cursor-pointer"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        </>
      )}

      {/* INCOMES TAB CONTENT */}
      {activeTab === 'incomes' && (
        <div className="rounded-xl border bg-card overflow-hidden">
          {isLoadingIncomes ? (
            <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
          ) : incomes.length === 0 ? (
            <EmptyState
              title="No incomes logged"
              description="Add your monthly salary, freelance earnings, or bonus amounts to calculate savings dynamically."
              actionLabel="Log Monthly Salary / Inflow"
              onAction={() => setIsIncomeOpen(true)}
              className="border-none py-16"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-4 font-semibold text-muted-foreground">Inflow Source</th>
                    <th className="p-4 font-semibold text-muted-foreground">Amount</th>
                    <th className="p-4 font-semibold text-muted-foreground">Date</th>
                    <th className="p-4 font-semibold text-muted-foreground">Notes</th>
                    <th className="p-4 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((item: any) => (
                    <tr key={item._id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 flex items-center gap-2 uppercase font-semibold text-xs text-foreground">
                        <Briefcase className="h-4 w-4 text-emerald-500" />
                        {item.source}
                      </td>
                      <td className="p-4 font-bold font-sans text-emerald-600">
                        +{currency} {item.amount.toLocaleString()}
                      </td>
                      <td className="p-4 font-sans">{item.date}</td>
                      <td className="p-4 font-sans text-muted-foreground">{item.notes || '-'}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteIncome(item._id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* LOG EXPENSE DIALOG */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Log New Expense">
        <form onSubmit={handleExpenseSubmit(onSubmitExpense)} className="space-y-4 text-left">
          <Input
            label="Expense Title"
            placeholder="Zepto grocery, swiggy, Zomato dinner"
            error={expenseErrors.title?.message}
            {...regExpense('title')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Amount (${currency})`}
              type="text"
              placeholder="0.00"
              error={expenseErrors.amount?.message}
              {...regExpense('amount')}
            />
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-sm font-medium text-foreground leading-none">Category</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                {...regExpense('category')}
              >
                <option value="">Select Category</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {expenseErrors.category && <p className="text-xs text-destructive font-medium">{expenseErrors.category.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-sm font-medium text-foreground leading-none">Payment Mode</label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                {...regExpense('paymentMode')}
              >
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="net_banking">Net Banking</option>
              </select>
            </div>
            <Input
              label="Date"
              type="date"
              error={expenseErrors.date?.message}
              {...regExpense('date')}
            />
          </div>

          <Input
            label="Tags (comma separated)"
            placeholder="food, zepto, office, weekend"
            error={expenseErrors.tags?.message}
            {...regExpense('tags')}
          />

          <Input
            label="Notes"
            placeholder="Additional descriptions..."
            {...regExpense('notes')}
          />

          {/* React Dropzone */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-foreground">Attach Receipt Image</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent/30'
              }`}
            >
              <input {...getInputProps()} />
              <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              {selectedFile ? (
                <span className="text-xs text-foreground font-semibold">{selectedFile.name}</span>
              ) : (
                <span className="text-xs text-muted-foreground font-sans">
                  Drag & drop receipt image here, or click to browse
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4 mt-6">
            <Button type="submit" disabled={isSubmittingExpense}>
              {isSubmittingExpense ? 'Saving...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* LOG INCOME DIALOG */}
      <Dialog isOpen={isIncomeOpen} onClose={() => setIsIncomeOpen(false)} title="Log Monthly Salary / Inflow">
        <form onSubmit={handleIncomeSubmit(onSubmitIncome)} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5 text-left w-full">
            <label className="text-sm font-medium text-foreground leading-none">Inflow Source</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
              {...regIncome('source')}
            >
              <option value="salary">Corporate Salary</option>
              <option value="freelance">Freelance Client Pay</option>
              <option value="bonus">Bonus Credit</option>
              <option value="refund">Refund Claim</option>
              <option value="interest">Bank Interest payout</option>
              <option value="gift">Cash Gift</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Amount (${currency})`}
              placeholder="0.00"
              error={incomeErrors.amount?.message}
              {...regIncome('amount')}
            />
            <Input
              label="Date Received"
              type="date"
              error={incomeErrors.date?.message}
              {...regIncome('date')}
            />
          </div>

          <Input
            label="Inflow Description"
            placeholder="E.g. monthly paycheck, Google project checkout"
            {...regIncome('notes')}
          />

          <div className="flex justify-end gap-3 border-t pt-4 mt-6">
            <Button type="submit" disabled={isSubmittingIncome}>
              {isSubmittingIncome ? 'Saving...' : 'Save Inflow'}
            </Button>
          </div>
        </form>
      </Dialog>

      <BillViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        fileUrl={viewerUrl}
        title={viewerTitle}
      />

      {/* VIEW EXPENSE DETAILS DIALOG */}
      <Dialog
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        title="Expense Details"
      >
        {viewingExpense && (
          <div className="space-y-4 text-left font-sans">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">{viewingExpense.title}</h3>
                <span className="text-xs text-muted-foreground block mt-0.5 font-mono">ID: {viewingExpense._id}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-foreground block">
                  {currency === 'INR' ? '₹' : currency} {viewingExpense.amount.toLocaleString()}
                </span>
                {viewingExpense.category && (
                  <Badge
                    style={{
                      backgroundColor: `${viewingExpense.category.color}15`,
                      color: viewingExpense.category.color,
                      borderColor: `${viewingExpense.category.color}35`,
                    }}
                    className="font-semibold border mt-1"
                  >
                    {viewingExpense.category.name}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Expense Date</span>
                <span className="font-medium text-foreground">
                  {viewingExpense.date} {viewingExpense.time ? `@ ${viewingExpense.time}` : ''}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Payment Method</span>
                <span className="font-medium text-foreground uppercase">
                  {viewingExpense.paymentMode.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Vendor</span>
                <span className="font-medium text-foreground">
                  {viewingExpense.vendor || 'Not Specified'}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Created By</span>
                <span className="font-medium text-foreground">
                  {viewingExpense.createdBy?.name || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Created Date</span>
                <span className="font-medium text-foreground">
                  {dayjs(viewingExpense.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Last Updated</span>
                <span className="font-medium text-foreground">
                  {dayjs(viewingExpense.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                </span>
              </div>
            </div>

            {viewingExpense.notes && (
              <div className="border-t pt-3">
                <span className="text-xs text-muted-foreground block">Description / Notes</span>
                <p className="text-sm text-foreground mt-1 whitespace-pre-wrap bg-muted/30 p-2.5 rounded-lg border border-border/50">
                  {viewingExpense.notes}
                </p>
              </div>
            )}

            {viewingExpense.tags && viewingExpense.tags.length > 0 && (
              <div className="border-t pt-3">
                <span className="text-xs text-muted-foreground block mb-1.5">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingExpense.tags.map((t: string) => (
                    <Badge key={t} variant="outline" className="text-xs py-0.5 px-2 font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {viewingExpense.receiptImage && viewingExpense.receiptImage !== 'null' ? (
              <div className="border-t pt-3 space-y-2">
                <span className="text-xs text-muted-foreground block">Receipt Preview</span>
                <div className="relative rounded-lg overflow-hidden border border-border bg-muted/20 flex flex-col items-center justify-center p-2">
                  <img
                    src={getFileUrl(viewingExpense.receiptImage)}
                    alt={`Receipt for ${viewingExpense.title}`}
                    className="max-h-60 object-contain rounded"
                  />
                  <div className="mt-2 w-full flex justify-end">
                    <a
                      href={getFileUrl(viewingExpense.receiptImage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold py-1 px-2.5 rounded bg-card border cursor-pointer"
                    >
                      Open in New Tab
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-t pt-3">
                <span className="text-xs text-muted-foreground block">Receipt</span>
                <span className="text-sm italic text-muted-foreground">No receipt attached</span>
              </div>
            )}

            <div className="flex justify-end border-t pt-3 mt-4">
              <Button onClick={() => setViewingExpense(null)}>Close</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Expense"
      >
        <div className="space-y-4 text-left font-sans">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={async () => {
                if (deleteConfirmId) {
                  try {
                    await deleteExpense(deleteConfirmId);
                    enqueueSnackbar('Expense deleted successfully', { variant: 'success' });
                  } catch {
                    enqueueSnackbar('Failed to delete expense', { variant: 'error' });
                  }
                  setDeleteConfirmId(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
export default Expenses;
