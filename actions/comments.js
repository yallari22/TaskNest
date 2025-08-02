"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createNotification } from "@/lib/notifications";

export async function createComment(issueId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get the issue to check if it exists and belongs to the organization
  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (issue.project.organizationId !== orgId) {
    throw new Error("Unauthorized");
  }

  // Create the comment
  const comment = await db.comment.create({
    data: {
      content: data.content,
      issueId: issueId,
      authorId: user.id,
      parentId: data.parentId || null,
    },
    include: {
      author: true,
    },
  });

  // Extract mentions from the comment content
  const mentionRegex = /@(\w+)/g;
  const mentions = data.content.match(mentionRegex) || [];

  // Process mentions
  for (const mention of mentions) {
    const username = mention.substring(1); // Remove the @ symbol
    
    // Find the mentioned user
    const mentionedUser = await db.user.findFirst({
      where: {
        name: {
          contains: username,
          mode: 'insensitive',
        },
      },
    });

    if (mentionedUser) {
      // Create a mention record
      await db.commentMention.create({
        data: {
          commentId: comment.id,
          userId: mentionedUser.id,
        },
      });

      // Create a notification for the mentioned user
      await createNotification({
        userId: mentionedUser.id,
        title: `You were mentioned in a comment`,
        content: `${user.name} mentioned you in a comment: "${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}"`,
        type: "COMMENT_ADDED",
        issueId: issueId,
      });
    }
  }

  // Notify the issue reporter and assignee (if different from the commenter)
  if (issue.reporterId !== user.id) {
    await createNotification({
      userId: issue.reporterId,
      title: `New comment on issue ${issue.title}`,
      content: `${user.name} commented: "${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}"`,
      type: "COMMENT_ADDED",
      issueId: issueId,
    });
  }

  if (issue.assigneeId && issue.assigneeId !== user.id && issue.assigneeId !== issue.reporterId) {
    await createNotification({
      userId: issue.assigneeId,
      title: `New comment on issue ${issue.title}`,
      content: `${user.name} commented: "${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}"`,
      type: "COMMENT_ADDED",
      issueId: issueId,
    });
  }

  return comment;
}

export async function getComments(issueId) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Get the issue to check if it exists and belongs to the organization
  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (issue.project.organizationId !== orgId) {
    throw new Error("Unauthorized");
  }

  // Get top-level comments with their replies
  const comments = await db.comment.findMany({
    where: {
      issueId: issueId,
      parentId: null, // Only get top-level comments
    },
    include: {
      author: true,
      replies: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return comments;
}

export async function updateComment(commentId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get the comment to check if it exists and belongs to the user
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: { issue: { include: { project: true } } },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.authorId !== user.id) {
    throw new Error("Unauthorized");
  }

  if (comment.issue.project.organizationId !== orgId) {
    throw new Error("Unauthorized");
  }

  // Update the comment
  const updatedComment = await db.comment.update({
    where: { id: commentId },
    data: {
      content: data.content,
    },
    include: {
      author: true,
    },
  });

  return updatedComment;
}

export async function deleteComment(commentId) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get the comment to check if it exists and belongs to the user
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: { issue: { include: { project: true } } },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.authorId !== user.id) {
    throw new Error("Unauthorized");
  }

  if (comment.issue.project.organizationId !== orgId) {
    throw new Error("Unauthorized");
  }

  // Delete the comment
  await db.comment.delete({
    where: { id: commentId },
  });

  return { success: true };
}
