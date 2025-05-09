
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CheckCircle,
  Info, 
  AlertCircle, 
  HelpCircle,
  Check,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/context/NotificationContext';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    created_at: string;
    updated_at: string;
    data?: any;
  }
}

const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { markAsRead, deleteNotification } = useNotifications();
  
  // Handle mark as read
  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };
  
  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  // Format the date
  const formattedDate = (() => {
    try {
      const date = new Date(notification.created_at);
      return format(date, 'PPp', { locale: fr });
    } catch (error) {
      return 'Date inconnue';
    }
  })();

  // Determine the icon based on the type
  const Icon = (() => {
    switch(notification.type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'info': return Info;
      default: return HelpCircle;
    }
  })();

  // Determine the color based on the type
  const iconColor = (() => {
    switch(notification.type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-destructive';
      case 'info': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  })();

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors",
        !notification.read && "bg-muted/30"
      )}
    >
      <div className={cn("mt-1", iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formattedDate}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mt-1">
          {notification.message}
        </p>
        
        <div className="flex justify-end gap-2 mt-2">
          {!notification.read && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2"
              onClick={handleMarkAsRead}
            >
              <Check className="h-4 w-4 mr-1" />
              <span className="text-xs">Lu</span>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Supprimer</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
