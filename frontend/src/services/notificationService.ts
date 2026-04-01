import apiClient from '@/lib/api';
import { Notification } from '@/types/notification';

interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

/**
 * Fetch notifications for the current user
 */
export const fetchNotifications = async (
  page: number = 1,
  limit: number = 20
): Promise<NotificationResponse> => {
  try {
    const response = await apiClient.get('/notifications', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    // Return empty data instead of throwing to prevent UI errors
    return {
      notifications: [],
      unreadCount: 0,
      total: 0
    };
  }
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await apiClient.post('/notifications/mark-all-read');
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
};

/**
 * Clear all read notifications
 */
export const clearReadNotifications = async (): Promise<void> => {
  try {
    await apiClient.delete('/notifications/clear-read');
  } catch (error) {
    console.error('Failed to clear read notifications:', error);
    throw error;
  }
};

/**
 * Delete a specific notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.delete(`/notifications/${notificationId}`);
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw error;
  }
};
