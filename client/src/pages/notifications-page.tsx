import { useState } from "react";
import BottomNav from "@/components/bottom-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
  updatedAt?: string;
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"]
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/notifications/all");
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "All notifications cleared",
        description: "Your notifications have been marked as read."
      });
    }
  });

  // Helper function to format the notification date
  const formatNotificationTime = (date: string | Date) => {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "achievement":
        return <i className="ri-award-fill text-secondary text-lg"></i>;
      case "reward":
        return <i className="ri-coin-fill text-amber-500 text-lg"></i>;
      case "lesson":
        return <i className="ri-book-open-fill text-primary text-lg"></i>;
      case "system":
        return <i className="ri-information-fill text-dark text-lg"></i>;
      default:
        return <i className="ri-notification-2-fill text-dark text-lg"></i>;
    }
  };

  const getBackgroundForType = (type: string, read: boolean) => {
    const baseStyle = read ? "bg-white" : "bg-blue-50";
    
    return `${baseStyle} p-4 rounded-lg shadow-sm mb-3`;
  };

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleClearAll = () => {
    clearAllMutation.mutate();
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <>
      <main className="flex-1 p-4 overflow-auto bg-light">
        {/* Notifications Header */}
        <div className="bg-white p-4 shadow-sm mb-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Notifications</h2>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAll}
                disabled={clearAllMutation.isPending}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
        
        {/* Notifications List */}
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-center py-10">
              <i className="ri-loader-4-line animate-spin text-2xl text-primary"></i>
              <p className="mt-2 text-dark/60">Loading notifications...</p>
            </div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`${getBackgroundForType(notification.type, notification.read)} transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start relative overflow-hidden">
                  {/* Type-based accent border */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      notification.type === "achievement" ? "bg-secondary" : 
                      notification.type === "reward" ? "bg-amber-500" :
                      notification.type === "lesson" ? "bg-primary" : "bg-dark"
                    }`}
                  />
                
                  <div className={`mt-1 mr-3 ml-3 p-2 rounded-full ${
                      notification.type === "achievement" ? "bg-secondary/10" : 
                      notification.type === "reward" ? "bg-amber-500/10" :
                      notification.type === "lesson" ? "bg-primary/10" : "bg-dark/10"
                    }`}>
                    {getIconForType(notification.type)}
                  </div>
                  
                  <div className="flex-1 pr-3">
                    <h4 className="font-medium text-dark">{notification.title}</h4>
                    <p className="text-sm text-dark/70 my-1">{notification.message}</p>
                    <div className="flex items-center">
                      <p className="text-xs text-dark/50">{formatNotificationTime(notification.createdAt || new Date())}</p>
                      {!notification.read && (
                        <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">New</span>
                      )}
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 animate-pulse"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <i className="ri-notification-off-line text-4xl text-dark/30"></i>
              <p className="mt-2 text-dark/60">No notifications yet</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav active="home" />
    </>
  );
}