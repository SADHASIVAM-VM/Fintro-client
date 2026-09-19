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
  Receipt,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Tag,
  CreditCard,
  ExternalLink,
  FileText,
  Clock,
  Zap,
  Utensils,
  ShoppingBag,
  Car,
  Tv,
  Activity,
  Cloud,
  Smartphone,
  Wifi,
  Home as HomeIcon,
  Coffee,
} from 'lucide-react';

const getTwoToneCategoryIcon = (categoryVal: any, titleStr: string) => {
  const catName = typeof categoryVal === 'object' && categoryVal !== null
    ? categoryVal.name
    : (typeof categoryVal === 'string' ? categoryVal : 'General');

  const combined = (catName + ' ' + (titleStr || '')).toLowerCase();

  if (combined.includes('food') || combined.includes('swiggy') || combined.includes('zomato') || combined.includes('restaurant') || combined.includes('dining') || combined.includes('coffee')) {
    return {
      icon: Utensils,
      style: 'bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-300/40 dark:border-amber-700/40',
    };
  }
  if (combined.includes('fuel') || combined.includes('uber') || combined.includes('cab') || combined.includes('transport') || combined.includes('car')) {
    return {
      icon: Car,
      style: 'bg-gradient-to-br from-blue-400/20 via-sky-500/10 to-blue-500/25 text-sky-600 dark:text-sky-400 border border-sky-300/40 dark:border-sky-700/40',
    };
  }
  if (combined.includes('shopping') || combined.includes('amazon') || combined.includes('store') || combined.includes('grocery')) {
    return {
      icon: ShoppingBag,
      style: 'bg-gradient-to-br from-emerald-400/20 via-teal-500/10 to-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-700/40',
    };
  }
  if (combined.includes('ott') || combined.includes('movie') || combined.includes('entertainment') || combined.includes('music') || combined.includes('spotify') || combined.includes('netflix') || combined.includes('tv')) {
    return {
      icon: Tv,
      style: 'bg-gradient-to-br from-purple-400/20 via-indigo-500/10 to-purple-500/25 text-purple-600 dark:text-purple-400 border border-purple-300/40 dark:border-purple-700/40',
    };
  }
  if (combined.includes('utility') || combined.includes('elec') || combined.includes('bill') || combined.includes('power')) {
    return {
      icon: Zap,
      style: 'bg-gradient-to-br from-yellow-400/20 via-amber-500/10 to-yellow-500/25 text-yellow-600 dark:text-yellow-400 border border-yellow-300/40 dark:border-yellow-700/40',
    };
  }
  if (combined.includes('mobile') || combined.includes('recharge') || combined.includes('phone') || combined.includes('wifi') || combined.includes('internet')) {
    return {
      icon: Smartphone,
      style: 'bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-cyan-500/25 text-cyan-600 dark:text-cyan-400 border border-cyan-300/40 dark:border-cyan-700/40',
    };
  }

  return {
    icon: Cloud,
    style: 'bg-gradient-to-br from-indigo-400/20 via-violet-500/10 to-indigo-500/25 text-indigo-600 dark:text-indigo-400 border border-indigo-300/40 dark:border-indigo-700/40',
  };
};
import { useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { useSettings } from '@/hooks/useSettings';
import { useIncome } from '@/hooks/useIncome';
import { useInbox } from '@/hooks/useInbox';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';
import { BillViewer } from '@/components/ui/BillViewer';
import { getFileUrl } from '@/lib/utils';
import { compressAndConvertToAvif } from '@/lib/imageCompressor';

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

  const [dateFilter, setDateFilter] = useState<'all' | '7days' | 'month' | '3months'>('month');
  const [viewingExpense, setViewingExpense] = useState<any | null>(null);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    paymentMode: '',
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
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

  const { uploadReceipt } = useInbox();
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);

  const currency = settings?.data?.currency === 'USD' || settings?.currency === 'USD' ? '$' : '₹';

  // React Hook Form for Expenses
  const {
    register: regExpense,
    handleSubmit: handleExpenseSubmit,
    reset: resetExpense,
    setValue: setExpenseValue,
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

  // Dropzone setup with Automatic OCR Extraction
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setIsScanningOcr(true);
      setOcrSuccessMsg(null);
      enqueueSnackbar('Receipt attached. Processing Smart OCR extraction...', { variant: 'info' });

      try {
        const res = await uploadReceipt(file);
        const extracted = res?.data?.extractedData || res?.extractedData;

        if (extracted) {
          const merchant = extracted.merchant || '';
          const amount = extracted.amount ? String(extracted.amount) : '';
          const date = extracted.date || dayjs().format('YYYY-MM-DD');
          const rawText = extracted.rawText || extracted.ocrText || res?.data?.ocrText || res?.ocrText || '';

          if (merchant) setExpenseValue('title', merchant);
          if (amount) setExpenseValue('amount', amount);
          if (date) setExpenseValue('date', date);
          if (rawText) {
            setExpenseValue('notes', rawText);
          }

          const summary = `Merchant: "${merchant || 'N/A'}", Amount: ₹${amount || '0'}, Date: ${date}`;
          setOcrSuccessMsg(summary);
          enqueueSnackbar(`✨ OCR Success! Auto-filled: ${summary}`, { variant: 'success' });
        }
      } catch (err: any) {
        console.error('OCR Extraction error:', err);
        enqueueSnackbar('Receipt attached for manual entry', { variant: 'warning' });
      } finally {
        setIsScanningOcr(false);
      }
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
        let fileToUpload = selectedFile;
        if (selectedFile.type && selectedFile.type.startsWith('image/')) {
          enqueueSnackbar('Compressing image to 70% AVIF format...', { variant: 'info' });
          fileToUpload = await compressAndConvertToAvif(selectedFile, 0.7);
        }
        fd.append('receipt', fileToUpload);
      }

      await createExpense(fd);
      enqueueSnackbar('Expense logged successfully', { variant: 'success' });
      setIsAddOpen(false);
      resetExpense();
      setSelectedFile(null);
      setOcrSuccessMsg(null);
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
      enqueueSnackbar('Failed to log income amount', { variant: 'error' });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteExpense(id);
      enqueueSnackbar('Transaction deleted', { variant: 'info' });
      if (viewingExpense?._id === id) setViewingExpense(null);
    } catch {
      enqueueSnackbar('Failed to delete transaction', { variant: 'error' });
    }
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

  const openReceiptViewer = (url: string, title: string) => {
    setViewerUrl(url);
    setViewerTitle(title);
    setIsViewerOpen(true);
  };

  return (
    <div className="space-y-6 text-left font-sans pb-16 max-w-xl mx-auto animate-fade-in">
      <Helmet>
        <title>Transactions — Fintro</title>
      </Helmet>

      {/* Header Banner */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">Transactions</h1>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            Log daily payouts, income inflows, and review records
          </p>
        </div>

        {/* Compact Button: Only Icon on Mobile (`< sm`), Icon + Text on Desktop (`sm:`) */}
        {activeTab === 'expenses' ? (
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 p-2.5 sm:px-4 sm:py-2 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-extrabold transition-all shadow-md cursor-pointer"
            title="Log Expense"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Log Expense</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsIncomeOpen(true)}
            className="inline-flex items-center gap-1.5 p-2.5 sm:px-4 sm:py-2 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-xs font-extrabold transition-all shadow-md cursor-pointer"
            title="Log Income"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Log Income</span>
          </button>
        )}
      </div>

      {/* Segmented Control Sub-Tabs (Expenses Outflow / Incomes Inflow) */}
      <SegmentedControl
        options={[
          { id: 'expenses', label: 'Expenses (Outflow)' },
          { id: 'incomes', label: 'Incomes (Inflow)' },
        ]}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* EXPENSES TAB CONTENT */}
      {activeTab === 'expenses' && (
        <>
          {/* Summary Metric Header Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Period Outflow</span>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {currency}{(expensesData?.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          {/* Search & Date Filter Bar */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={queryParams.search}
                  onChange={(e) => setQueryParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full h-10 pl-10 pr-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                />
              </div>

              <select
                value={dateFilter}
                onChange={(e) => handleDateFilterChange(e.target.value as any)}
                className="h-10 px-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none text-xs font-bold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="month">This Month</option>
                <option value="7days">Last 7 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="all">All Time</option>
              </select>

              {/* Compact Reset Icon Button */}
              <button
                type="button"
                onClick={() => {
                  setDateFilter('month');
                  setQueryParams({
                    page: 1,
                    limit: 10,
                    search: '',
                    category: '',
                    paymentMode: '',
                    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
                    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
                    sortBy: 'date',
                    sortOrder: 'desc',
                  });
                }}
                title="Reset Filters"
                className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transactions List Container */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span>Transaction Records</span>
              <span className="text-xs font-semibold text-zinc-400">{expensesData?.total || 0} Total</span>
            </h3>

            {isLoadingExpenses ? (
              <div className="py-12 flex justify-center"><LoadingSpinner /></div>
            ) : !expensesData || expensesData.data.length === 0 ? (
              <EmptyState
                title="No transactions logged"
                description="Log your daily expenses to track payouts and savings."
                actionLabel="Log Expense"
                onAction={() => setIsAddOpen(true)}
                className="py-12"
              />
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {expensesData.data.map((item: any) => {
                  const catName = typeof item.category === 'object' && item.category !== null
                    ? item.category.name
                    : (typeof item.category === 'string' ? item.category : 'General');

                  const rawItemReceipt = item.receiptImage || item.receiptPath || item.receiptUrl;
                  const hasReceipt = !!(rawItemReceipt && rawItemReceipt !== 'null' && rawItemReceipt !== 'undefined');
                  const duotone = getTwoToneCategoryIcon(item.category, item.title);
                  const IconComp = duotone.icon;

                  return (
                    <div
                      key={item._id}
                      onClick={() => setViewingExpense(item)}
                      className="py-3 flex items-center justify-between group gap-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 p-2 rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 relative shadow-sm ${duotone.style}`}>
                          <IconComp className="w-5 h-5" />
                          {hasReceipt && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white dark:border-zinc-900 shadow-sm" title="Receipt Attached" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-[120px] xs:max-w-[170px] sm:max-w-none">{item.title}</h4>
                            {/* {hasReceipt && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 shrink-0">
                                🧾 Receipt
                              </span>
                            )} */}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 truncate block">
                            {catName} · {item.date} {item.paymentMode ? `· ${item.paymentMode.toUpperCase()}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 pl-1">
                        <span className="text-xs sm:text-base font-semibold text-red-600 dark:text-red-400 tracking-tight">
                          - {currency}{item.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>

                        {/* Compact Action Buttons */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingExpense(item);
                          }}
                          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
                          title="View Details & Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteExpense(item._id);
                          }}
                          className="p-1.5 rounded-full text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {expensesData && expensesData.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs font-semibold">
                <span className="text-zinc-400">
                  Page {expensesData.page} of {expensesData.totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={expensesData.page <= 1}
                    onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }))}
                    className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={expensesData.page >= expensesData.totalPages}
                    onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }))}
                    className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* INCOMES TAB CONTENT */}
      {activeTab === 'incomes' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span>Income Inflow Records</span>
            <span className="text-xs font-semibold text-zinc-400">{incomes.length} Records</span>
          </h3>

          {isLoadingIncomes ? (
            <div className="py-12 flex justify-center"><LoadingSpinner /></div>
          ) : incomes.length === 0 ? (
            <EmptyState
              title="No income logged"
              description="Add salary, freelance earnings, or bonus amounts."
              actionLabel="Log Income"
              onAction={() => setIsIncomeOpen(true)}
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {incomes.map((item: any) => (
                <div key={item._id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white capitalize">{item.source}</h4>
                      <p className="text-xs text-zinc-400 font-medium mt-0.5">{item.date} {item.notes ? `· ${item.notes}` : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      + {currency}{item.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteIncome(item._id)}
                      className="p-1.5 rounded-full text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LOG EXPENSE DIALOG */}
      <Dialog isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setOcrSuccessMsg(null); }} title="Log New Expense">
        <form onSubmit={handleExpenseSubmit(onSubmitExpense)} className="space-y-4 text-left font-sans pt-1">
          {/* Smart OCR Dropzone Box */}
          <div className="flex flex-col gap-2 text-left bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" /> Auto-Extract Data from Receipt Image
              </label>
              {isScanningOcr && (
                <span className="text-xs text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1 animate-pulse">
                  <LoadingSpinner size="sm" /> Scanning OCR...
                </span>
              )}
            </div>

            <div
              {...getRootProps()}
              className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${isDragActive ? 'border-zinc-900 bg-zinc-100' : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100/50 dark:hover:bg-zinc-800'
                }`}
            >
              <input {...getInputProps()} />
              {selectedFile ? (
                <div className="flex items-center justify-between text-xs px-2">
                  <span className="font-semibold text-zinc-900 dark:text-white truncate max-w-[200px] flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5" /> {selectedFile.name}
                  </span>
                  <span className="text-zinc-500 font-medium text-[11px] underline">Change image</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <ImageIcon className="h-5 w-5 text-zinc-400" />
                  <span className="text-xs text-zinc-400 font-sans">
                    Drop receipt image here or click to browse (OCR auto-fills merchant, amount & date)
                  </span>
                </div>
              )}
            </div>

            {ocrSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-1.5">
                <span>⚡<strong>OCR Extracted :</strong> Check and Confirm the details ✅ </span>
              </div>
            )}
          </div>

          <Input
            label="Expense Title / Merchant"
            placeholder="E.g. Uber, Swiggy, Amazon, Zepto"
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
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Category</label>
              <select
                className="flex h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none"
                {...regExpense('category')}
              >
                <option value="">Select Category</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {expenseErrors.category && <p className="text-xs text-rose-500 font-medium">{expenseErrors.category.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Payment Mode</label>
              <select
                className="flex h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none"
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
            label="Notes / Tags (Optional)"
            placeholder="Additional descriptions..."
            {...regExpense('notes')}
          />

          <div className="flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingExpense} className="rounded-full font-bold bg-[#18181B] text-white">
              {isSubmittingExpense ? 'Saving...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* LOG INCOME DIALOG */}
      <Dialog isOpen={isIncomeOpen} onClose={() => setIsIncomeOpen(false)} title="Log Monthly Salary / Inflow">
        <form onSubmit={handleIncomeSubmit(onSubmitIncome)} className="space-y-4 text-left font-sans pt-1">
          <div className="flex flex-col gap-1.5 text-left w-full">
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Inflow Source</label>
            <select
              className="flex h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none"
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
            placeholder="E.g. monthly paycheck"
            {...regIncome('notes')}
          />

          <div className="flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsIncomeOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingIncome} className="rounded-full font-bold bg-[#18181B] text-white">
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

      {/* VIEW EXPENSE DETAILS & RECEIPT POPUP CARD */}
      <Dialog
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        title="Transaction Details & Receipt"
      >
        {viewingExpense && (() => {
          const catName = typeof viewingExpense.category === 'object' && viewingExpense.category !== null
            ? viewingExpense.category.name
            : (typeof viewingExpense.category === 'string' ? viewingExpense.category : 'General');

          const rawReceipt = viewingExpense.receiptImage || viewingExpense.receiptPath || viewingExpense.receiptUrl;
          const receiptUrl = (rawReceipt && rawReceipt !== 'null' && rawReceipt !== 'undefined')
            ? getFileUrl(rawReceipt)
            : null;

          return (
            <div className="space-y-4 font-sans text-left pt-1">
              {/* Receipt / Merchant Top Card */}
              <div className="p-4 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white rounded-3xl shadow-md space-y-2 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Outflow Record</span>
                  <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {viewingExpense.date} {viewingExpense.time || ''}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="text-lg font-black text-white leading-tight">{viewingExpense.title}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5 capitalize">
                      Category: {catName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-rose-400">
                      - {currency}{viewingExpense.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Metadata Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider mb-1">Payment Method</span>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                    {viewingExpense.paymentMode || 'UPI'}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider mb-1">Transaction ID</span>
                  <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 truncate block">
                    #{viewingExpense._id?.slice(-8) || 'TXN-LIVE'}
                  </span>
                </div>
              </div>

              {/* Notes or Descriptions if present */}
              {viewingExpense.notes && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider mb-0.5">Notes</span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">{viewingExpense.notes}</p>
                </div>
              )}

              {/* RECEIPT ATTACHMENT CARD / PREVIEW */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Attached Bill / Receipt
                  </span>
                  {receiptUrl && (
                    <button
                      type="button"
                      onClick={() => openReceiptViewer(receiptUrl, viewingExpense.title)}
                      className="text-xs font-extrabold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Open Full Screen <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {receiptUrl ? (
                  <div
                    onClick={() => openReceiptViewer(receiptUrl, viewingExpense.title)}
                    className="relative w-full h-44 rounded-xl overflow-hidden bg-black border border-zinc-300 dark:border-zinc-700 group cursor-pointer shadow-sm flex items-center justify-center"
                  >
                    <img
                      src={receiptUrl}
                      alt="Receipt Attachment"
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback icon for PDF or broken image link
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <Eye className="w-4 h-4" /> Click to Expand Receipt
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <FileText className="w-6 h-6 text-zinc-400 mx-auto mb-1 opacity-60" />
                    <p className="text-xs font-semibold text-zinc-400">No physical receipt image attached to this record</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleDeleteExpense(viewingExpense._id)}
                  className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Transaction
                </button>

                <Button
                  onClick={() => setViewingExpense(null)}
                  className="rounded-full font-bold text-xs bg-[#18181B] text-white px-5 py-2"
                >
                  Close
                </Button>
              </div>
            </div>
          );
        })()}
      </Dialog>
    </div>
  );
};

export default Expenses;
