import apiClient from '@/lib/api';
import { DSUEntry } from '@/types/intern';

export const dsuService = {
  async getAll(internId?: string, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (internId) params.append('intern_id', internId);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    
    const response = await apiClient.get<DSUEntry[]>(`/dsu-entries/?${params}`);
    return response.data;
  },

  async create(data: Partial<DSUEntry>) {
    const response = await apiClient.post('/dsu-entries/', data);
    return response.data;
  },

  async update(id: string, data: Partial<DSUEntry>) {
    const response = await apiClient.patch(`/dsu-entries/${id}`, data);
    return response.data;
  }
};
