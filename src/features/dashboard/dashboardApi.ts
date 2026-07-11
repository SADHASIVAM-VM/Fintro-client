import { baseApi } from '@/api/baseApi';

export interface DashboardData {
  stats: {
    revenue: { value: string; change: string; isPositive: boolean };
    users: { value: string; change: string; isPositive: boolean };
    orders: { value: string; change: string; isPositive: boolean };
    conversionRate: { value: string; change: string; isPositive: boolean };
  };
  charts: {
    revenueArea: { name: string; value: number; orders: number }[];
    weeklyActivity: { name: string; active: number; visits: number }[];
    pieDevices: { name: string; value: number; color: string }[];
  };
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardData, void>({
      query: () => ({
        url: '/dashboard',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
export default dashboardApi;
