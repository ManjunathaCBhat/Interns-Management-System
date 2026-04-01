import apiClient from '@/lib/api';

export const feedbackService = {
  async sendFeedback(data: { name: string; email: string; message: string; role: string }) {
    // This endpoint should be implemented in the backend
    return apiClient.post('/feedback', data);
  },
};
