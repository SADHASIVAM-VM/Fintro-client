import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSnackbar } from 'notistack';
import {
  Plus,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  HandCoins,
  Receipt,
  Home,
  PiggyBank,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const quickAddSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER', 'BORROW', 'LEND', 'REPAYMENT', 'REFUND', 'EMI_PAYMENT']),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be greater than 0',
  }),
  accountId: z.string().min(1, 'Please select a source account'),
  destinationAccountId: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  merchant: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type QuickAddFormSchema = z.infer<typeof quickAddSchema>;

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'BORROW' | 'LEND' | 'REPAYMENT' | 'REFUND' | 'EMI_PAYMENT';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, initialType = 'EXPENSE' }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { accounts } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { createTransaction, isCreating } = useTransactions();

  const [selectedType, setSelectedType] = useState<any>(initialType);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuickAddFormSchema>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: {
      type: initialType,
      amount: '',
      accountId: '',
      destinationAccountId: '',
      categoryId: '',
      description: '',
      merchant: '',
      date: dayjs().format('YYYY-MM-DD'),
      notes: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      const typeToSet = initialType || 'EXPENSE';
      setSelectedType(typeToSet);
      setValue('type', typeToSet);
    }
  }, [isOpen, initialType, setValue]);

  const watchAccountId = watch('accountId');

  const handleTypeSelect = (type: any) => {
    setSelectedType(type);
    setValue('type', type);
  };

  const onSubmit = async (data: QuickAddFormSchema) => {
    if (data.type === 'TRANSFER' && !data.destinationAccountId) {
      enqueueSnackbar('Destination account is required for transfers', { variant: 'error' });
      return;
    }

    try {
      await createTransaction({
        type: data.type,
        amount: Number(data.amount),
        accountId: data.accountId,
        destinationAccountId: data.destinationAccountId || undefined,
        categoryId: data.categoryId || undefined,
        description: data.description,
        merchant: data.merchant || undefined,
        date: data.date,
        notes: data.notes || undefined,
      });

      enqueueSnackbar('Transaction recorded cleanly!', { variant: 'success' });
      reset();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to record transaction', { variant: 'error' });
    }
  };

  const transactionTypeButtons = [
    { type: 'EXPENSE', label: 'Expense', icon: <TrendingDown className="h-4 w-4 text-red-500" /> },
    { type: 'INCOME', label: 'Income', icon: <TrendingUp className="h-4 w-4 text-emerald-500" /> },
    { type: 'TRANSFER', label: 'Transfer', icon: <ArrowRightLeft className="h-4 w-4 text-blue-500" /> },
    { type: 'BORROW', label: 'Borrow', icon: <HandCoins className="h-4 w-4 text-amber-500" /> },
    { type: 'LEND', label: 'Lend', icon: <HandCoins className="h-4 w-4 text-purple-500" /> },
    { type: 'EMI_PAYMENT', label: 'EMI Payment', icon: <PiggyBank className="h-4 w-4 text-pink-500" /> },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Universal Quick Add Transaction">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans pt-1">
        {/* Type Selector Cards (Horizontal Scrollable Bar) */}
        <div>
          <label className="text-xs sm:text-sm font-bold text-foreground mb-2 block">Select Type</label>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 flex-nowrap">
            {transactionTypeButtons.map((b) => (
              <button
                key={b.type}
                type="button"
                onClick={() => handleTypeSelect(b.type)}
                className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 min-w-[80px] sm:min-w-[95px] ${selectedType === b.type
                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border'
                  }`}
              >
                {b.icon}
                <span className="mt-1.5 whitespace-nowrap text-xs sm:text-sm font-bold">{b.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount & Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs sm:text-sm font-semibold text-foreground mb-1 block">Amount (₹)</label>
            <Input {...register('amount')} type="number" step="0.01" placeholder="250.00" autoFocus className="text-xs sm:text-sm" />
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="text-xs sm:text-sm font-semibold text-foreground mb-1 block">Source Account</label>
            <select
              {...register('accountId')}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm focus-visible:outline-none cursor-pointer"
            >
              <option value="">Select Account...</option>
              {accounts.map((acc: any) => (
                <option key={acc._id} value={acc._id}>
                  {acc.name} (₹{acc.currentBalance?.toLocaleString() || 0})
                </option>
              ))}
            </select>
            {errors.accountId && <p className="text-xs text-destructive mt-1">{errors.accountId.message}</p>}
          </div>
        </div>

        {/* Transfer Destination Account */}
        {selectedType === 'TRANSFER' && (
          <div>
            <label className="text-xs sm:text-sm font-semibold text-foreground mb-1 block">Destination Account</label>
            <select
              {...register('destinationAccountId')}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm focus-visible:outline-none cursor-pointer"
            >
              <option value="">Select Destination Account...</option>
              {accounts
                .filter((acc: any) => acc._id !== watchAccountId)
                .map((acc: any) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name} (₹{acc.currentBalance?.toLocaleString() || 0})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Category & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedType !== 'TRANSFER' && (
            <div>
              <label className="text-xs sm:text-sm font-semibold text-foreground mb-1 block">Category</label>
              <select
                {...register('categoryId')}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm focus-visible:outline-none cursor-pointer"
              >
                <option value="">Select Category...</option>
                {categories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs sm:text-sm font-semibold text-foreground mb-1 block">Description / Merchant</label>
            <Input {...register('description')} placeholder="e.g. Swiggy Lunch, Fuel, Rent" className="text-xs sm:text-sm" />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>
        </div>

        {/* Date & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs sm:text-sm font-semibold text-foreground mb-1 block">Date</label>
            <Input {...register('date')} type="date" className="text-xs sm:text-sm" />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-semibold text-foreground mb-1 block">Notes (Optional)</label>
            <Input {...register('notes')} placeholder="Optional details..." className="text-xs sm:text-sm" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs sm:text-sm">
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating} className="cursor-pointer text-xs sm:text-sm">
            {isCreating ? 'Recording...' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
