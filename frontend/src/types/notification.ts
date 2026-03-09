/**
 * Notification types for the Interns360 system
 */

export type NotificationType =
  | 'task_assigned'
  | 'task_updated'
  | 'task_completed'
  | 'dsu_reminder'
  | 'dsu_reviewed'
  | 'pto_approved'
  | 'pto_rejected'
  | 'performance_review'
  | 'feedback_request'
  | 'project_update'
  | 'system_announcement'
  | 'mentor_assigned'
  | 'batch_update';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // ID of related entity (task, project, etc.)
  relatedType?: string; // Type of related entity
  actionUrl?: string; // URL to navigate when clicked
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  taskAssignments: boolean;
  dsuReminders: boolean;
  ptoUpdates: boolean;
  performanceReviews: boolean;
  systemAnnouncements: boolean;
}
