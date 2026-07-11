import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface CreateAccountData {
  name: string;
  phone?: string;
}

export const useBorrow = (accountId?: string) => {
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ['borrowAccounts'],
    queryFn: async () => {
      const response = await axiosInstance.get('/borrow/accounts');
      return response.data;
    },
  });

  const historyQuery = useQuery({
    queryKey: ['borrowHistory', accountId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/borrow/accounts/${accountId}/history`);
      return response.data;
    },
    enabled: !!accountId,
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: CreateAccountData) => {
      const response = await axiosInstance.post('/borrow/accounts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowAccounts'] });
    },
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const response = await axiosInstance.post('/borrow/transactions', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['borrowAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      const accId = variables.get('accountId');
      if (accId) {
        queryClient.invalidateQueries({ queryKey: ['borrowHistory', accId] });
      }
    },
  });

  return {
    accounts: accountsQuery.data || [],
    isLoadingAccounts: accountsQuery.isLoading,
    refetchAccounts: accountsQuery.refetch,
    history: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    createAccount: createAccountMutation.mutateAsync,
    isCreatingAccount: createAccountMutation.isPending,
    addTransaction: addTransactionMutation.mutateAsync,
    isAddingTransaction: addTransactionMutation.isPending,
  };
};
export default useBorrow;
