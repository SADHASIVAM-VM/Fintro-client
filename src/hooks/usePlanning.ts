import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface PlanningMetrics {
  totalAvailableBalance: number;
  safeToSpend: number;
  upcomingObligations: number;
  savingsCommitmentMonthly: number;
  emergencyFund: {
    currentSaved: number;
    essentialMonthlyExpenses: number;
    runwayMonths: number;
    targetRunwayMonths: number;
  };
  cashFlowForecast: {
    day7: number;
    day30: number;
    day90: number;
  };
  financialHealthScore: {
    score: number;
    rating: string;
  };
}

export const usePlanning = () => {
  const query = useQuery({
    queryKey: ['planning'],
    queryFn: async () => {
      const response = await axiosInstance.get('/planning');
      return response.data;
    },
  });

  return {
    ...query,
    metrics: (query.data?.data as PlanningMetrics) || {
      totalAvailableBalance: 0,
      safeToSpend: 0,
      upcomingObligations: 0,
      savingsCommitmentMonthly: 0,
      emergencyFund: { currentSaved: 0, essentialMonthlyExpenses: 15000, runwayMonths: 0, targetRunwayMonths: 6 },
      cashFlowForecast: { day7: 0, day30: 0, day90: 0 },
      financialHealthScore: { score: 70, rating: 'Good' },
    },
  };
};

export default usePlanning;
