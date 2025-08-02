import { getUnreadNotificationCount } from "@/lib/notifications";
import NotificationDropdown from "./notification-dropdown";
import { auth } from "@clerk/nextjs/server";

export default async function NotificationBell() {
  const { userId } = auth();

  // Only fetch notifications if user is authenticated
  const unreadCount = userId ? await getUnreadNotificationCount() : 0;

  return <NotificationDropdown initialCount={unreadCount} />;
}
