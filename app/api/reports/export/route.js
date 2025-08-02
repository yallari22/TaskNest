import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getReportData } from "@/actions/reports";

export async function POST(request) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Request body:", body);

    const { projectId, dateRange, reportType, format } = body;

    // Validate required parameters
    if (!projectId || !dateRange) {
      console.log("Missing parameters:", { projectId, dateRange });
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Set default values if not provided
    const validReportType = reportType || "velocity";
    const validFormat = format || "pdf";

    // Get the report data
    const reportData = await getReportData(projectId, dateRange, validReportType);

    // Return the data for client-side processing
    return NextResponse.json({
      success: true,
      data: reportData,
      format: validFormat
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
