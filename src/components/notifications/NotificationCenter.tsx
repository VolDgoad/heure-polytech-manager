
import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import NotificationItem from './NotificationItem';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    isLoading 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  // Handle opening the notification center
  const handleOpen = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center text-xs text-white animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-80 sm:w-96 p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-[80vh] p-0">
          <div className="flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem notification={notification} />
                  {index < notifications.length - 1 && <Separator />}
                </React.Fragment>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
