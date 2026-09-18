import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface AccountData {
  _id?: string;
  name: string;
  type: 'bank_account' | 'cash' | 'credit_card' | 'debit_card' | 'upi_wallet' | 'e_wallet' | 'other';
  institution?: string;
  accountIdentifier?: string;
  openingBalance?: number;
  currentBalance?: number;
  currency?: string;
  isActive?: boolean;
}

export const useAccounts = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await axiosInstance.get('/accounts');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AccountData) => {
      const response = await axiosInstance.post('/accounts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AccountData> }) => {
      const response = await axiosInstance.put(`/accounts/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/accounts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    accounts: query.data?.data || [],
    totalBalance: query.data?.meta?.totalBalance || 0,
    createAccount: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateAccount: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteAccount: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export default useAccounts;
