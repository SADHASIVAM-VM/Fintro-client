import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import {
  Inbox,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Sparkles,
  ArrowRight,
  Eye,
  Receipt,
  ShieldCheck,
  CreditCard,
  Tag
} from 'lucide-react';
import dayjs from 'dayjs';
import { useInbox, type InboxItem } from '@/hooks/useInbox';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Helmet } from 'react-helmet-async';
import { BillViewer } from '@/components/ui/BillViewer';
import { getFileUrl } from '@/lib/utils';

export const FinancialInbox: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { inboxItems, totalDrafts, isLoading, uploadReceipt, isUploading, confirmItem, deleteItem } = useInbox();
  const { accounts } = useAccounts();
  const { data: categories = [] } = useCategories();

  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState<string>('Receipt View');
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const openReceiptViewer = (url: string, title?: string) => {
    setViewerUrl(url);
    if (title) setViewerTitle(title);
    setIsViewerOpen(true);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    try {
      await uploadReceipt(file);
      enqueueSnackbar('Receipt uploaded & processed by Smart OCR! Landed in Financial Inbox.', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar('Failed to upload receipt for OCR processing', { variant: 'error' });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif'], 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleConfirm = async (item: InboxItem) => {
    if (!selectedAccount) {
      enqueueSnackbar('Please select an account to post this transaction', { variant: 'warning' });
      return;
    }

    try {
      await confirmItem({
        id: item._id,
        data: {
          accountId: selectedAccount,
          categoryId: selectedCategory || item.extractedData?.suggestedCategory || undefined,
          amount: item.extractedData?.amount,
          merchant: item.extractedData?.merchant,
          date: item.extractedData?.date,
        },
      });

      enqueueSnackbar('Transaction confirmed & posted to your accounting ledger!', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to confirm transaction', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      enqueueSnackbar('Draft removed from inbox', { variant: 'info' });
    } catch (err: any) {
      enqueueSnackbar('Failed to remove draft', { variant: 'error' });
    }
  };

  return (
    <div className="space-y-6 text-left font-sans pb-16 max-w-4xl mx-auto animate-fade-in">
      <Helmet>
        <title>Financial Inbox — Smart Receipt Review</title>
      </Helmet>

      {/* Bill Viewer Modal */}
      <BillViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        fileUrl={viewerUrl}
        title={viewerTitle}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Financial Inbox</span>
            {totalDrafts > 0 && (
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 font-extrabold rounded-full px-2.5 py-0.5 text-xs shadow-sm">
                {totalDrafts} Draft Pending
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
            Review OCR receipt extractions and bank statement imports before posting to your accounting ledger.
          </p>
        </div>
      </div>

      {/* Luxury Drag & Drop OCR Upload Card */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
            : 'border-purple-300/80 dark:border-purple-800/80 bg-gradient-to-br from-purple-500/5 via-amber-500/5 to-emerald-500/5 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/10'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex justify-center mb-3">
          {isUploading ? (
            <LoadingSpinner size="md" label="Processing Receipt via OCR..." />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 via-indigo-500/15 to-purple-500/25 text-purple-600 dark:text-purple-400 border border-purple-300/40 dark:border-purple-700/40 flex items-center justify-center shadow-md">
              <UploadCloud className="w-7 h-7" />
            </div>
          )}
        </div>
        <h4 className="font-extrabold text-zinc-900 dark:text-white text-base font-sans">
          {isUploading ? 'Extracting Smart OCR Text...' : 'Upload Receipt or Financial Statement'}
        </h4>
        <p className="text-xs text-zinc-400 font-medium mt-1 max-w-md mx-auto">
          Drag & drop receipt images (PNG, JPG, WEBP, AVIF, PDF). Text, merchant, amounts, and dates will be extracted automatically into your draft inbox.
        </p>
      </div>

      {/* Inbox Items List */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" label="Loading Financial Inbox items..." />
        </div>
      ) : inboxItems.length === 0 ? (
        <EmptyState
          title="Your Financial Inbox is clean!"
          description="All uploaded OCR receipts and bank statements have been confirmed and posted to your transactions ledger."
          className="py-12"
        />
      ) : (
        <div className="space-y-5">
          {inboxItems.map((item: any) => {
            const rawReceipt = item.fileUrl || item.receiptImage || item.receiptPath;
            const receiptUrl = (rawReceipt && rawReceipt !== 'null' && rawReceipt !== 'undefined')
              ? getFileUrl(rawReceipt)
              : null;

            return (
              <div
                key={item._id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all space-y-4"
              >
                {/* Top Row: Merchant Title, OCR Confidence Badge & Extracted Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400/20 via-indigo-500/10 to-purple-500/25 text-purple-600 dark:text-purple-400 border border-purple-300/40 dark:border-purple-700/40 flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-zinc-900 dark:text-white text-base truncate">
                          {item.extractedData?.merchant || 'Extracted Merchant'}
                        </h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> OCR 95% Confidence
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium mt-0.5">
                        Extracted Date: {item.extractedData?.date || dayjs().format('YYYY-MM-DD')} • File: {item.originalFilename || 'Receipt Image'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0">
                    <span className="text-xl sm:text-2xl font-black text-rose-500 dark:text-rose-400 tracking-tight">
                      - ₹ {(item.extractedData?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    {receiptUrl && (
                      <button
                        type="button"
                        onClick={() => openReceiptViewer(receiptUrl, item.extractedData?.merchant || 'Receipt')}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800"
                        title="View Original Receipt"
                      >
                        <Eye className="w-3.5 h-3.5" /> Receipt
                      </button>
                    )}
                  </div>
                </div>

                {/* Duplicate Detection Alert Warning */}
                {item.isDuplicate && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Possible Duplicate Detected! A transaction of ₹{item.extractedData?.amount} on {item.extractedData?.date} already exists in your ledger.</span>
                  </div>
                )}

                {/* Extracted Raw OCR Text Snippet (if available) */}
                {item.ocrText && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-left">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider mb-0.5">Extracted Receipt Text</span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-mono line-clamp-2">{item.ocrText}</p>
                  </div>
                )}

                {/* Account Selection & Confirmation Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1 block flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-purple-500" /> Posting Account *
                    </label>
                    <select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus-visible:outline-none cursor-pointer"
                    >
                      <option value="">Select Account...</option>
                      {accounts.map((acc: any) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.name} (₹{acc.currentBalance?.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1 block flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-500" /> Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus-visible:outline-none cursor-pointer"
                    >
                      <option value="">Select Category...</option>
                      {categories.map((cat: any) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-2 pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleConfirm(item)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Confirm & Post
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove Draft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FinancialInbox;
