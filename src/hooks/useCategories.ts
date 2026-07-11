import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface CategoryData {
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export const useCategories = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosInstance.get('/categories');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryData) => {
      const response = await axiosInstance.post('/categories', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    ...query,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
export default useCategories;
