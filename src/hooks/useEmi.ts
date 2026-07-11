import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface EmiData {
  loanName: string;
  principal: number;
  interestRate: number;
  monthlyEmi: number;
  monthsTotal: number;
  dueDate: string;
  startDate: string;
}

export const useEmi = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['emis'],
    queryFn: async () => {
      const response = await axiosInstance.get('/emi');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EmiData) => {
      const response = await axiosInstance.post('/emi', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emis'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const payMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.post(`/emi/${id}/pay`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emis'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/emi/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emis'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    createEmi: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    payEmi: payMutation.mutateAsync,
    isPaying: payMutation.isPending,
    deleteEmi: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
export default useEmi;
