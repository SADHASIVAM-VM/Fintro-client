import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface RentInput {
  month: string;
  rentAmount: number;
  dueDate: string;
}

export interface BillInput {
  month: string;
  type: 'electricity' | 'water' | 'internet';
  amount: number;
  units?: number;
  dueDate: string;
}

export interface InventoryInput {
  item: string;
  customName?: string;
  quantity: number;
  status?: 'working' | 'repair' | 'disposed';
}

export interface RoomQueryParams {
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const useRoom = (purchaseParams?: RoomQueryParams) => {
  const queryClient = useQueryClient();

  const rentsQuery = useQuery({
    queryKey: ['roomRents'],
    queryFn: async () => {
      const response = await axiosInstance.get('/room/rents');
      return response.data;
    },
  });

  const billsQuery = useQuery({
    queryKey: ['roomBills'],
    queryFn: async () => {
      const response = await axiosInstance.get('/room/bills');
      return response.data;
    },
  });

  const purchasesQuery = useQuery({
    queryKey: ['roomPurchases', purchaseParams],
    queryFn: async () => {
      const response = await axiosInstance.get('/room/purchases', { params: purchaseParams });
      return response.data;
    },
  });

  const inventoryQuery = useQuery({
    queryKey: ['roomInventory'],
    queryFn: async () => {
      const response = await axiosInstance.get('/room/inventory');
      return response.data;
    },
  });

  // Rents mutations
  const createRentMutation = useMutation({
    mutationFn: async (data: RentInput) => {
      const response = await axiosInstance.post('/room/rents', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomRents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const payRentMutation = useMutation({
    mutationFn: async ({ id, paidDate }: { id: string; paidDate?: string }) => {
      const response = await axiosInstance.post(`/room/rents/${id}/pay`, { paidDate });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomRents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Bills mutations
  const createBillMutation = useMutation({
    mutationFn: async (data: BillInput) => {
      const response = await axiosInstance.post('/room/bills', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomBills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const payBillMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.post(`/room/bills/${id}/pay`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomBills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Purchases mutations
  const createPurchaseMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const response = await axiosInstance.post('/room/purchases', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomPurchases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Inventory mutations
  const createInventoryMutation = useMutation({
    mutationFn: async (data: InventoryInput) => {
      const response = await axiosInstance.post('/room/inventory', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomInventory'] });
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async ({ id, status, quantity }: { id: string; status?: string; quantity?: number }) => {
      const response = await axiosInstance.patch(`/room/inventory/${id}`, { status, quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomInventory'] });
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/room/inventory/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomInventory'] });
    },
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/room/purchases/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomPurchases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    rents: rentsQuery.data || [],
    bills: billsQuery.data || [],
    purchases: purchasesQuery.data || [],
    inventory: inventoryQuery.data || [],
    isLoadingRents: rentsQuery.isLoading,
    isLoadingBills: billsQuery.isLoading,
    isLoadingPurchases: purchasesQuery.isLoading,
    isLoadingInventory: inventoryQuery.isLoading,
    createRent: createRentMutation.mutateAsync,
    payRent: payRentMutation.mutateAsync,
    createBill: createBillMutation.mutateAsync,
    payBill: payBillMutation.mutateAsync,
    createPurchase: createPurchaseMutation.mutateAsync,
    deletePurchase: deletePurchaseMutation.mutateAsync,
    createInventoryItem: createInventoryMutation.mutateAsync,
    updateInventoryItem: updateInventoryMutation.mutateAsync,
    deleteInventoryItem: deleteInventoryMutation.mutateAsync,
  };
};
export default useRoom;
