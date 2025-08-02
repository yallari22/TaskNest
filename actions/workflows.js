"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createWorkflow(projectId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Check if the user has access to the project
  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error("Project not found");
  }

  // Create the workflow with default statuses
  const workflow = await db.workflow.create({
    data: {
      name: data.name,
      projectId,
      statuses: {
        create: [
          { name: "TODO", color: "#3b82f6", order: 0 },
          { name: "IN_PROGRESS", color: "#f59e0b", order: 1 },
          { name: "IN_REVIEW", color: "#8b5cf6", order: 2 },
          { name: "DONE", color: "#10b981", order: 3 },
        ],
      },
    },
    include: {
      statuses: {
        orderBy: { order: "asc" },
      },
    },
  });

  return workflow;
}

export async function getWorkflows(projectId) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Check if the user has access to the project
  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== orgId) {
    throw new Error("Project not found");
  }

  const workflows = await db.workflow.findMany({
    where: { projectId },
    include: {
      statuses: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return workflows;
}

export async function createWorkflowStatus(workflowId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Check if the user has access to the workflow
  const workflow = await db.workflow.findUnique({
    where: { id: workflowId },
    include: { project: true },
  });

  if (!workflow || workflow.project.organizationId !== orgId) {
    throw new Error("Workflow not found");
  }

  // Get the highest order
  const lastStatus = await db.workflowStatus.findFirst({
    where: { workflowId },
    orderBy: { order: "desc" },
  });

  const newOrder = lastStatus ? lastStatus.order + 1 : 0;

  // Create the status
  const status = await db.workflowStatus.create({
    data: {
      name: data.name,
      color: data.color || "#3b82f6",
      order: newOrder,
      workflowId,
    },
  });

  return status;
}

export async function updateWorkflowStatus(statusId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Check if the user has access to the status
  const status = await db.workflowStatus.findUnique({
    where: { id: statusId },
    include: { workflow: { include: { project: true } } },
  });

  if (!status || status.workflow.project.organizationId !== orgId) {
    throw new Error("Status not found");
  }

  // Update the status
  const updatedStatus = await db.workflowStatus.update({
    where: { id: statusId },
    data: {
      name: data.name,
      color: data.color,
    },
  });

  return updatedStatus;
}

export async function deleteWorkflowStatus(statusId) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Check if the user has access to the status
  const status = await db.workflowStatus.findUnique({
    where: { id: statusId },
    include: { workflow: { include: { project: true } } },
  });

  if (!status || status.workflow.project.organizationId !== orgId) {
    throw new Error("Status not found");
  }

  // Check if there are any issues using this status
  const issuesCount = await db.issue.count({
    where: { statusId },
  });

  if (issuesCount > 0) {
    throw new Error("Cannot delete status that is being used by issues");
  }

  // Delete the status
  await db.workflowStatus.delete({
    where: { id: statusId },
  });

  return { success: true };
}

export async function reorderWorkflowStatuses(workflowId, statusIds) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // Check if the user has access to the workflow
  const workflow = await db.workflow.findUnique({
    where: { id: workflowId },
    include: { project: true },
  });

  if (!workflow || workflow.project.organizationId !== orgId) {
    throw new Error("Workflow not found");
  }

  // Update the order of each status
  await db.$transaction(
    statusIds.map((statusId, index) =>
      db.workflowStatus.update({
        where: { id: statusId },
        data: { order: index },
      })
    )
  );

  return { success: true };
}
