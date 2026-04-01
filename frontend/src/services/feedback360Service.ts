import apiClient from '@/lib/api';

export interface FeedbackEntry {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  feedbackType: 'peer' | 'mentor' | 'self';
  rating: number;
  comments?: string;
  created_at?: string;
}

export interface Feedback360 {
  _id?: string;
  internId: string;
  internName: string;
  project?: string;
  period?: string;
  feedbacks: FeedbackEntry[];
  created_at?: string;
  updated_at?: string;
}

export const feedback360Service = {
  async submitFeedback360(payload: Feedback360): Promise<Feedback360> {
    const response = await apiClient.post('/admin/performance/feedback360', payload);
    return response.data;
  },

  async getFeedback360(internId: string): Promise<Feedback360[]> {
    const response = await apiClient.get(`/admin/performance/feedback360?internId=${internId}`);
    return response.data;
  },
};
