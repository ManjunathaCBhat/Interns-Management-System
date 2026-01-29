// src/services/dsuService.ts
import apiClient from '@/lib/api';
import { DSUEntry } from '@/types/intern';

export interface DSUListParams {
  intern_id?: string;
  batch?: string;
  date_from?: string;
  date_to?: string;
}

export const dsuService = {
  async getAll(params?: DSUListParams): Promise<DSUEntry[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.intern_id) searchParams.append('intern_id', params.intern_id);
    if (params?.batch) searchParams.append('batch', params.batch);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    
    const response = await apiClient.get(`/dsu-entries/?${searchParams}`);
    return response.data;
  },

  async getByDate(internId: string, date: string): Promise<DSUEntry | null> {
    try {
      const response = await apiClient.get<DSUEntry[]>('/dsu-entries/', {
        params: {
          intern_id: internId,
          date_from: date,
          date_to: date
        }
      });
      
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error fetching DSU by date:', error);
      return null;
    }
  },

  async create(data: Partial<DSUEntry>): Promise<DSUEntry> {
    const response = await apiClient.post('/dsu-entries/', data);
    return response.data;
  },

  async update(id: string, data: Partial<DSUEntry>): Promise<DSUEntry> {
    const response = await apiClient.patch(`/dsu-entries/${id}`, data);
    return response.data;
  },

  async addFeedback(id: string, feedback: string): Promise<DSUEntry> {
    const response = await apiClient.patch(`/dsu-entries/${id}`, { feedback });
    return response.data;
  }
};
