import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface InboxItem {
  _id: string;
  fileUrl: string;
  originalFilename?: string;
  ocrStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  ocrText?: string;
  extractedData?: {
    merchant?: string;
    amount?: number;
    date?: string;
    tax?: number;
    invoiceNumber?: string;
    suggestedCategory?: string;
    items?: Array<{ name: string; price: number }>;
  };
  confidence?: number;
  isDuplicate?: boolean;
  existingMatch?: any;
  createdAt: string;
}

export const useInbox = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['inbox'],
    queryFn: async () => {
      const response = await axiosInstance.get('/inbox');
      return response.data;
    },
  });

  const uploadReceiptMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('receipt', file);
      const response = await axiosInstance.post('/inbox/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });

  const confirmItemMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        accountId: string;
        categoryId?: string;
        amount?: number;
        merchant?: string;
        description?: string;
        date?: string;
      };
    }) => {
      const response = await axiosInstance.post(`/inbox/${id}/confirm`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/inbox/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });

  return {
    ...query,
    inboxItems: (query.data?.data as InboxItem[]) || [],
    totalDrafts: query.data?.meta?.totalDrafts || 0,
    uploadReceipt: uploadReceiptMutation.mutateAsync,
    isUploading: uploadReceiptMutation.isPending,
    confirmItem: confirmItemMutation.mutateAsync,
    isConfirming: confirmItemMutation.isPending,
    deleteItem: deleteItemMutation.mutateAsync,
    isDeleting: deleteItemMutation.isPending,
  };
};

export default useInbox;
