import { useQuery } from '@tanstack/react-query';
import api from './axios';

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard');
      return data;
    }
  });
};

export const useCashFlow = () => {
  return useQuery({
    queryKey: ['cashFlow'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/cash-flow');
      return data;
    }
  });
};

export const useMaterials = () => {
  return useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data } = await api.get('/materials');
      return data;
    }
  });
};

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    }
  });
};

export const useProjectDetails = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useProjectProfitability = (id: string) => {
  return useQuery({
    queryKey: ['profitability', id],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/profitability/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await api.get('/invoices');
      return data;
    }
  });
};

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/clients');
      return data;
    }
  });
};
