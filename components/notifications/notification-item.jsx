"use client";

import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export default function NotificationItem({ notification, onRead }) {
  const router = useRouter();

  const handleClick = async () => {
    // Mark as read if not already read
    if (!notification.read) {
      await onRead(notification.id);
    }

    // Navigate to the issue if there is one
    if (notification.issue) {
      router.push(`/project/${notification.issue.projectId}?issue=${notification.issue.id}`);
    }
  };

  return (
    <div 
      className={`p-3 border-b border-slate-700 hover:bg-slate-800 cursor-pointer relative ${notification.read ? 'opacity-60' : ''}`}
      onClick={handleClick}
    >
      <div className="flex justify-between">
        <h4 className="font-medium">{notification.title}</h4>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm text-gray-300 mt-1">{notification.content}</p>
      {!notification.read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-3 right-3"></div>
      )}
    </div>
  );
}
