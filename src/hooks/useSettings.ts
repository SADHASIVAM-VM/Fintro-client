import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface SettingsData {
  currency: string;
  timezone: string;
  language: string;
  budgetLimits?: number;
  notificationFlags?: {
    emiReminders: boolean;
    billReminders: boolean;
    budgetAlerts: boolean;
  };
}

export const useSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await axiosInstance.get('/settings');
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsData) => {
      const response = await axiosInstance.patch('/settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (backupJson: any) => {
      const response = await axiosInstance.post('/settings/restore', { backupJson });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(); // Invalidate all queries to force complete UI refetch
    },
  });

  const triggerBackupDownload = async () => {
    try {
      const response = await axiosInstance.get('/settings/backup', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pfms-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download backup JSON:', err);
    }
  };

  return {
    ...query,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    restoreBackup: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    triggerBackupDownload,
  };
};
export default useSettings;
