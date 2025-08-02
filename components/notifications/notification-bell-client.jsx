"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AdvancedLoader } from "@/components/loaders";
import NotificationItem from "./notification-item";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/notifications";

export default function NotificationBellClient() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // Always start with 0 for consistent hydration
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!isOpen) return;

    setLoading(true);
    try {
      const data = await getUserNotifications();
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Don't show the error to the user, just set empty notifications
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Set mounted state after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      fetchNotifications();
    }
  }, [isOpen, mounted]);

  // Initial fetch after component mounts to avoid hydration mismatch
  useEffect(() => {
    const initialFetch = async () => {
      if (!isInitialFetchDone && mounted) {
        try {
          const data = await getUserNotifications();
          if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
          }
        } catch (err) {
          console.error("Error fetching initial notifications:", err);
          setError(err.message || "Failed to fetch notifications");
        } finally {
          setIsInitialFetchDone(true);
        }
      }
    };

    if (mounted) {
      initialFetch();
    }
  }, [isInitialFetchDone, mounted]);

  // Poll for new notifications every minute when the dropdown is closed
  useEffect(() => {
    if (!mounted) return;

    const checkUnreadCount = async () => {
      if (!isOpen && isInitialFetchDone) {
        try {
          const data = await getUserNotifications();
          if (data) {
            setUnreadCount(data.filter(n => !n.read).length);
          }
        } catch (err) {
          console.error("Error checking unread count:", err);
          // Silently fail, don't update the count
        }
      }
    };

    const interval = setInterval(checkUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [isOpen, isInitialFetchDone, mounted]);

  // If not mounted yet, render a placeholder to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  // If there was an error fetching notifications
  if (error) {
    return (
      <Button variant="ghost" size="icon" className="relative" title="Error loading notifications">
        <Bell className="h-5 w-5 text-red-500" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-96 overflow-y-auto">
        <div className="p-3 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        {loading ? (
          <div className="p-4 flex justify-center">
            <AdvancedLoader
              variant="spinner"
              type="beat"
              color="#36d7b7"
              size={10}
              text="Loading notifications..."
              textPosition="bottom"
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No notifications</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
