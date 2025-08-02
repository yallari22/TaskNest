"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createNotification } from "@/lib/notifications";

export async function getIssuesForSprint(sprintId) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const issues = await db.issue.findMany({
    where: { sprintId: sprintId },
    orderBy: [{ status: "asc" }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      order: true,
      assigneeId: true,
      reporterId: true,
      projectId: true,
      sprintId: true,
      createdAt: true,
      updatedAt: true,
      assignee: true,
      reporter: true,
    },
  });

  return issues;
}

export async function createIssue(projectId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  let user = await db.user.findUnique({ where: { clerkUserId: userId } });

  const lastIssue = await db.issue.findFirst({
    where: { projectId, status: data.status },
    orderBy: { order: "desc" },
  });

  const newOrder = lastIssue ? lastIssue.order + 1 : 0;

  const issue = await db.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: projectId,
      sprintId: data.sprintId,
      reporterId: user.id,
      assigneeId: data.assigneeId || null, // Add this line
      order: newOrder,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      order: true,
      assigneeId: true,
      reporterId: true,
      projectId: true,
      sprintId: true,
      createdAt: true,
      updatedAt: true,
      assignee: true,
      reporter: true,
      project: true,
    },
  });

  // Create notification for assignee if one is assigned
  if (data.assigneeId && data.assigneeId !== user.id) {
    await createNotification({
      userId: data.assigneeId,
      title: 'New Issue Assigned',
      content: `You have been assigned to issue: ${issue.title}`,
      type: 'ISSUE_ASSIGNED',
      issueId: issue.id,
    });
  }

  return issue;
}

export async function updateIssueOrder(updatedIssues) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Start a transaction
  await db.$transaction(async (prisma) => {
    // Update each issue
    for (const issue of updatedIssues) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          status: issue.status,
          order: issue.order,
        },
        select: {
          id: true,
          status: true,
          order: true,
        },
      });
    }
  });

  return { success: true };
}

export async function deleteIssue(issueId) {
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

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { project: true },
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (
    issue.reporterId !== user.id &&
    !issue.project.adminIds.includes(user.id)
  ) {
    throw new Error("You don't have permission to delete this issue");
  }

  await db.issue.delete({ where: { id: issueId } });

  return { success: true };
}

export async function updateIssue(issueId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the user from the database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get the original issue to check for changes
    const originalIssue = await db.issue.findUnique({
      where: { id: issueId },
      include: {
        project: true,
        assignee: true,
        reporter: true,
      },
    });

    if (!originalIssue) {
      throw new Error("Issue not found");
    }

    if (originalIssue.project.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: {
        status: data.status,
        priority: data.priority,
      },
      include: {
        assignee: true,
        reporter: true,
        project: true,
        timeLogs: {
          orderBy: { loggedAt: 'desc' },
          include: {
            user: true,
          },
        },
      },
    });

    // If status changed, notify relevant users
    if (data.status && data.status !== originalIssue.status) {
      // Notify reporter if they're not the one making the change
      if (originalIssue.reporterId !== user.id) {
        await createNotification({
          userId: originalIssue.reporterId,
          title: 'Issue Status Changed',
          content: `Issue "${updatedIssue.title}" status changed from ${originalIssue.status} to ${data.status}`,
          type: 'STATUS_CHANGED',
          issueId: issueId,
        });
      }

      // Notify assignee if they exist and are not the one making the change
      if (originalIssue.assigneeId && originalIssue.assigneeId !== user.id) {
        await createNotification({
          userId: originalIssue.assigneeId,
          title: 'Issue Status Changed',
          content: `Issue "${updatedIssue.title}" status changed from ${originalIssue.status} to ${data.status}`,
          type: 'STATUS_CHANGED',
          issueId: issueId,
        });
      }
    }

    // If priority changed, notify relevant users
    if (data.priority && data.priority !== originalIssue.priority) {
      // Notify reporter if they're not the one making the change
      if (originalIssue.reporterId !== user.id) {
        await createNotification({
          userId: originalIssue.reporterId,
          title: 'Issue Priority Changed',
          content: `Issue "${updatedIssue.title}" priority changed from ${originalIssue.priority} to ${data.priority}`,
          type: 'ISSUE_UPDATED',
          issueId: issueId,
        });
      }

      // Notify assignee if they exist and are not the one making the change
      if (originalIssue.assigneeId && originalIssue.assigneeId !== user.id) {
        await createNotification({
          userId: originalIssue.assigneeId,
          title: 'Issue Priority Changed',
          content: `Issue "${updatedIssue.title}" priority changed from ${originalIssue.priority} to ${data.priority}`,
          type: 'ISSUE_UPDATED',
          issueId: issueId,
        });
      }
    }

    return updatedIssue;
  } catch (error) {
    throw new Error("Error updating issue: " + error.message);
  }
}

// Log time for an issue
export async function logTime(issueId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    // Find the user by clerk ID
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Find the issue
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

    // Create a time log entry
    await db.timeLog.create({
      data: {
        description: data.description || "Time logged",
        timeSpent: data.timeSpent,
        loggedAt: data.loggedAt || new Date(),
        issueId: issueId,
        userId: user.id,
      },
    });

    // Update the issue with the total time spent
    const updatedIssue = await db.issue.update({
      where: { id: issueId },
      data: {
        totalTimeSpent: {
          increment: data.timeSpent
        },
      },
      include: {
        assignee: true,
        reporter: true,
        project: true,
        timeLogs: {
          orderBy: { loggedAt: 'desc' },
          include: {
            user: true,
          },
        },
      },
    });

    // Create a notification for the issue reporter if different from the logger
    if (issue.reporterId !== user.id) {
      await createNotification({
        userId: issue.reporterId,
        title: 'Time Logged on Issue',
        content: `${user.name || 'Someone'} logged ${data.timeSpent} minutes on issue: ${issue.title}`,
        type: 'ISSUE_UPDATED',
        issueId: issueId,
      });
    }

    // Create a notification for the assignee if different from the logger and reporter
    if (issue.assigneeId && issue.assigneeId !== user.id && issue.assigneeId !== issue.reporterId) {
      await createNotification({
        userId: issue.assigneeId,
        title: 'Time Logged on Issue',
        content: `${user.name || 'Someone'} logged ${data.timeSpent} minutes on issue: ${issue.title}`,
        type: 'ISSUE_UPDATED',
        issueId: issueId,
      });
    }

    return updatedIssue;
  } catch (error) {
    console.error("Error logging time:", error);
    throw new Error("Error logging time: " + error.message);
  }
}

export async function getTimeLogs(issueId) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    // Find the issue
    const issue = await db.issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        projectId: true,
        project: true,
      },
    });

    if (!issue) {
      throw new Error("Issue not found");
    }

    if (issue.project.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    // Get time logs for the issue
    const timeLogs = await db.timeLog.findMany({
      where: { issueId: issueId },
      orderBy: { loggedAt: 'desc' },
      include: {
        user: true,
      },
    });

    return timeLogs;
  } catch (error) {
    console.error("Error getting time logs:", error);
    throw new Error("Error getting time logs: " + error.message);
  }
}

export async function getIssueWithTimeLogs(issueId) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    // Find the issue with time logs
    const issue = await db.issue.findUnique({
      where: { id: issueId },
      include: {
        assignee: true,
        reporter: true,
        project: true,
        timeLogs: {
          orderBy: { loggedAt: 'desc' },
          include: {
            user: true,
          },
        },
      },
    });

    if (!issue) {
      throw new Error("Issue not found");
    }

    if (issue.project.organizationId !== orgId) {
      throw new Error("Unauthorized");
    }

    return issue;
  } catch (error) {
    console.error("Error getting issue with time logs:", error);
    throw new Error("Error getting issue: " + error.message);
  }
}
