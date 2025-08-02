"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// This is a placeholder for actual file upload implementation
// In a real implementation, you would use a cloud storage service like AWS S3 or Firebase Storage
export async function uploadFile(issueId, fileData) {
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

  // In a real implementation, you would upload the file to a cloud storage service
  // and get back a URL to the uploaded file
  const uploadedFileUrl = `https://example.com/files/${fileData.filename}`;

  // Create a file attachment record in the database
  const fileAttachment = await db.fileAttachment.create({
    data: {
      filename: fileData.filename,
      originalName: fileData.originalName,
      mimeType: fileData.mimeType,
      size: fileData.size,
      url: uploadedFileUrl,
      issueId,
      uploaderId: user.id,
    },
    include: {
      uploader: true,
    },
  });

  return fileAttachment;
}

export async function getFileAttachments(issueId) {
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

  // Get the file attachments for the issue
  const fileAttachments = await db.fileAttachment.findMany({
    where: { issueId },
    include: {
      uploader: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return fileAttachments;
}

export async function deleteFileAttachment(fileAttachmentId) {
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

  // Get the file attachment to check if it exists and belongs to the user
  const fileAttachment = await db.fileAttachment.findUnique({
    where: { id: fileAttachmentId },
    include: { issue: { include: { project: true } } },
  });

  if (!fileAttachment) {
    throw new Error("File attachment not found");
  }

  if (fileAttachment.issue.project.organizationId !== orgId) {
    throw new Error("Unauthorized");
  }

  // In a real implementation, you would delete the file from the cloud storage service

  // Delete the file attachment record from the database
  await db.fileAttachment.delete({
    where: { id: fileAttachmentId },
  });

  return { success: true };
}
