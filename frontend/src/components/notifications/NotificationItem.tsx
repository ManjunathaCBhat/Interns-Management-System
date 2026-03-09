import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Calendar,
  CheckCircle,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification, NotificationType } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const iconMap: Record<NotificationType, React.ElementType> = {
  task_assignment: ClipboardList,
  dsu_reminder: Calendar,
  pto_status: CheckCircle,
  mentor_feedback: MessageSquare,
  system_announcement: Bell,
};

const colorMap: Record<NotificationType, string> = {
  task_assignment: 'text-blue-500 bg-blue-500/10',
  dsu_reminder: 'text-orange-500 bg-orange-500/10',
  pto_status: 'text-green-500 bg-green-500/10',
  mentor_feedback: 'text-purple-500 bg-purple-500/10',
  system_announcement: 'text-sidebar-primary bg-sidebar-primary/10',
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
}) => {
  const navigate = useNavigate();
  const Icon = iconMap[notification.type] ?? Bell;
  const colorClass = colorMap[notification.type] ?? 'text-muted-foreground bg-muted';

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-sidebar-accent/50',
        !notification.isRead && 'bg-sidebar-primary/5'
      )}
    >
      {/* Icon */}
      <span
        className={cn(
          'flex-shrink-0 mt-0.5 rounded-full p-1.5',
          colorClass
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm truncate',
            !notification.isRead
              ? 'font-semibold text-sidebar-foreground'
              : 'font-medium text-sidebar-foreground/80'
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-sidebar-foreground/60 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-sidebar-foreground/40 mt-1">{timeAgo}</p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span className="flex-shrink-0 mt-2 h-2 w-2 rounded-full bg-sidebar-primary" />
      )}
    </button>
  );
};

export default NotificationItem;