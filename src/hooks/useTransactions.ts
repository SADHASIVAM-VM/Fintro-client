import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface TransactionParams {
  page?: number;
  limit?: number;
  type?: string;
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface TransactionData {
  _id?: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'BORROW' | 'LEND' | 'REPAYMENT' | 'REFUND' | 'EMI_PAYMENT';
  amount: number;
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  personId?: string;
  roomId?: string;
  loanId?: string;
  description: string;
  merchant?: string;
  date: string;
  paymentMethod?: string;
  notes?: string;
  tags?: string[];
}

export const useTransactions = (params: TransactionParams = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/transactions', { params });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TransactionData) => {
      const response = await axiosInstance.post('/transactions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/transactions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    transactions: query.data?.data || [],
    meta: query.data?.meta || { page: 1, totalPages: 1, total: 0 },
    createTransaction: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteTransaction: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export default useTransactions;
