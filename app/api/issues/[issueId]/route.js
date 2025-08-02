"use server";

import { NextResponse } from "next/server";
import { getIssueWithTimeLogs } from "@/actions/issues";

export async function GET(request, { params }) {
  const { issueId } = params;

  try {
    const issue = await getIssueWithTimeLogs(issueId);
    return NextResponse.json(issue);
  } catch (error) {
    console.error("Error fetching issue:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch issue" },
      { status: 500 }
    );
  }
}
