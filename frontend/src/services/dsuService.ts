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

  // ✅ ADD THIS METHOD
  async getByDate(internId: string, date: string): Promise<DSUEntry | null> {
    try {
      const response = await apiClient.get<DSUEntry[]>('/dsu-entries/', {
        params: {
          intern_id: internId,
          date_from: date,
          date_to: date
        }
      });
      
      // Return first entry if exists, otherwise null
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error fetching DSU by date:', error);
      return null;
    }
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
