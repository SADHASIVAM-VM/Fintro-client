import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get('/dashboard');
      return response.data;
    },
  });
};
export default useDashboard;
