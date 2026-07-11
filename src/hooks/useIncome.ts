import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface IncomeInput {
  source: 'salary' | 'freelance' | 'bonus' | 'refund' | 'interest' | 'gift';
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export const useIncome = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['incomes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/income');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: IncomeInput) => {
      const response = await axiosInstance.post('/income', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/income/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    createIncome: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteIncome: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
export default useIncome;
