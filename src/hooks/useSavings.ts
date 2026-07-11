import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface SavingsGoalData {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  interval: 'monthly' | 'quarterly' | 'yearly';
}

export const useSavings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['savingsGoals'],
    queryFn: async () => {
      const response = await axiosInstance.get('/savings');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SavingsGoalData) => {
      const response = await axiosInstance.post('/savings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const response = await axiosInstance.patch(`/savings/${id}/progress`, { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/savings/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    createSavingsGoal: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSavingsProgress: updateProgressMutation.mutateAsync,
    isUpdatingProgress: updateProgressMutation.isPending,
    deleteSavingsGoal: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
export default useSavings;
