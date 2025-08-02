"use server";

import { db } from '@/lib/prisma';
import { sendEmail, generateIssueNotificationHtml } from '@/lib/email';
import { auth } from "@clerk/nextjs/server";

// Create a notification
export async function createNotification({ userId, title, content, type, issueId = null }) {
  try {
    // Create in-app notification
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        content,
        type,
        issueId,
      },
      include: {
        issue: true,
      },
    });

    // Get user for email
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    // Send email notification
    if (user && user.email) {
      await sendEmail({
        to: user.email,
        subject: title,
        html: generateIssueNotificationHtml({
          title,
          content,
          issue: notification.issue,
          type,
        }),
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw the error, just log it and return null
    return null;
  }
}

// Get user notifications
export async function getUserNotifications() {
  const { userId: clerkUserId } = auth();

  if (!clerkUserId) {
    return null; // Return null instead of throwing an error
  }

  try {
    // Get the user from the database
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return []; // Return empty array if user not found
    }

    // Get the user's notifications
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        read: true,
        createdAt: true,
        updatedAt: true,
        issueId: true,
        issue: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            projectId: true,
          }
        },
      },
    });

    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    return []; // Return empty array on error
  }
}

// Get unread notification count
export async function getUnreadNotificationCount() {
  const { userId: clerkUserId } = auth();

  if (!clerkUserId) {
    return 0;
  }

  try {
    // Get the user from the database
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return 0;
    }

    // Count unread notifications
    const count = await db.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return 0;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId) {
  const { userId: clerkUserId } = auth();

  if (!clerkUserId) {
    return null; // Return null instead of throwing an error
  }

  try {
    // Get the user from the database
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return null; // Return null if user not found
    }

    // Get the notification
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return null; // Return null if notification not found
    }

    // Check if the notification belongs to the user
    if (notification.userId !== user.id) {
      return null; // Return null if unauthorized
    }

    // Mark the notification as read
    const updatedNotification = await db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return updatedNotification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null; // Return null on error
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  const { userId: clerkUserId } = auth();

  if (!clerkUserId) {
    return { success: false }; // Return failure instead of throwing an error
  }

  try {
    // Get the user from the database
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return { success: false }; // Return failure if user not found
    }

    // Mark all notifications as read
    await db.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false }; // Return failure on error
  }
}
