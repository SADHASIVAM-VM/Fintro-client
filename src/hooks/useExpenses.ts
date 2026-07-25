import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface ExpenseParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  paymentMode?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const useExpenses = (params: ExpenseParams) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/expenses', { params });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const response = await axiosInstance.post('/expenses', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, fd }: { id: string; fd: FormData }) => {
      const response = await axiosInstance.patch(`/expenses/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/expenses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    createExpense: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateExpense: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteExpense: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
export default useExpenses;
