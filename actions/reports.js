"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getSprintVelocityData, getIssueResolutionTimeData, getTeamPerformanceData, getTimeTrackingSummaryData } from "./analytics";

/**
 * Get report data based on the report type
 */
export async function getReportData(projectId, dateRange, reportType) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify project belongs to the organization
    const project = await db.project.findUnique({
      where: { 
        id: projectId,
        organizationId: orgId
      }
    });

    if (!project) {
      throw new Error("Project not found or you don't have permission to access it");
    }

    let reportData;
    let reportTitle;

    switch (reportType) {
      case "velocity":
        reportData = await getSprintVelocityData(projectId, dateRange);
        reportTitle = "Sprint Velocity Report";
        break;
      case "resolution":
        reportData = await getIssueResolutionTimeData(projectId, dateRange);
        reportTitle = "Issue Resolution Time Report";
        break;
      case "team":
        reportData = await getTeamPerformanceData(projectId, dateRange);
        reportTitle = "Team Performance Report";
        break;
      case "time":
        reportData = await getTimeTrackingSummaryData(projectId, dateRange);
        reportTitle = "Time Tracking Summary Report";
        break;
      default:
        throw new Error("Invalid report type");
    }

    return {
      projectName: project.name,
      projectKey: project.key,
      reportTitle,
      reportType,
      dateRange,
      data: reportData
    };
  } catch (error) {
    console.error(`Error getting ${reportType} report data:`, error);
    throw new Error(`Failed to get report data: ${error.message}`);
  }
}
