import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface SubscriptionData {
  _id?: string;
  name: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  accountId?: string;
  categoryId?: string;
  status?: 'active' | 'paused' | 'cancelled';
  priceHistory?: Array<{ amount: number; changedAt: string }>;
}

export const useSubscriptions = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await axiosInstance.get('/subscriptions');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SubscriptionData) => {
      const response = await axiosInstance.post('/subscriptions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubscriptionData> }) => {
      const response = await axiosInstance.put(`/subscriptions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/subscriptions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    subscriptions: query.data?.data || [],
    totalMonthlyCost: query.data?.meta?.totalMonthlyCost || 0,
    totalAnnualCost: query.data?.meta?.totalAnnualCost || 0,
    createSubscription: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSubscription: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteSubscription: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export default useSubscriptions;
