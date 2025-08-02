"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Parser } from "json2csv";
import { format } from "date-fns";

/**
 * Generate a PDF report from the provided data
 */
export function generatePdfReport(reportData) {
  const { projectName, projectKey, reportTitle, dateRange, data, reportType } = reportData;

  // Create a new PDF document
  const doc = new jsPDF();

  // Add report title
  doc.setFontSize(20);
  doc.text(reportTitle, 14, 22);

  // Add project info and date range
  doc.setFontSize(12);
  doc.text(`Project: ${projectName} (${projectKey})`, 14, 32);
  doc.text(
    `Date Range: ${format(new Date(dateRange.from), "MMM d, yyyy")} - ${format(new Date(dateRange.to), "MMM d, yyyy")}`,
    14,
    40
  );

  // Add report content based on report type
  switch (reportType) {
    case "velocity":
      addVelocityReportContent(doc, data);
      break;
    case "resolution":
      addResolutionReportContent(doc, data);
      break;
    case "team":
      addTeamReportContent(doc, data);
      break;
    case "time":
      addTimeReportContent(doc, data);
      break;
  }

  // Save the PDF
  const fileName = `${reportTitle.replace(/\\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);

  return fileName;
}

/**
 * Generate a CSV report from the provided data
 */
export function generateCsvReport(reportData) {
  const { reportTitle, reportType, data } = reportData;

  let csvData = [];
  let fields = [];

  // Prepare data based on report type
  switch (reportType) {
    case "velocity":
      ({ csvData, fields } = prepareVelocityCsvData(data));
      break;
    case "resolution":
      ({ csvData, fields } = prepareResolutionCsvData(data));
      break;
    case "team":
      ({ csvData, fields } = prepareTeamCsvData(data));
      break;
    case "time":
      ({ csvData, fields } = prepareTimeCsvData(data));
      break;
  }

  // Generate CSV
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(csvData);

  // Create a blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const fileName = `${reportTitle.replace(/\\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.csv`;

  // Create a download link and trigger it
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return fileName;
}

// Helper functions for PDF generation
function addVelocityReportContent(doc, data) {
  // Add summary metrics
  doc.setFontSize(14);
  doc.text("Summary", 14, 55);

  doc.setFontSize(12);
  doc.text(`Average Velocity: ${data.averageVelocity} story points per sprint`, 14, 65);
  doc.text(`Total Sprints: ${data.totalSprints}`, 14, 73);
  doc.text(`Total Completed Issues: ${data.totalCompletedIssues}`, 14, 81);

  // Add sprint data table
  if (data.sprintData && data.sprintData.length > 0) {
    doc.setFontSize(14);
    doc.text("Sprint Details", 14, 95);

    const tableData = data.sprintData.map(sprint => [
      sprint.name,
      sprint.planned,
      sprint.completed,
      `${sprint.completionRate}%`
    ]);

    autoTable(doc, {
      startY: 100,
      head: [["Sprint", "Planned Issues", "Completed Issues", "Completion Rate"]],
      body: tableData,
    });
  }
}

function addResolutionReportContent(doc, data) {
  // Add summary metrics
  doc.setFontSize(14);
  doc.text("Summary", 14, 55);

  doc.setFontSize(12);
  doc.text(`Average Resolution Time: ${data.averageResolutionTime} days`, 14, 65);
  doc.text(`Total Resolved Issues: ${data.totalResolvedIssues}`, 14, 73);

  // Add resolution by priority
  doc.setFontSize(14);
  doc.text("Resolution Time by Priority", 14, 87);

  const priorityData = [
    ["Urgent", `${data.resolutionByPriority.urgent} days`],
    ["High", `${data.resolutionByPriority.high} days`],
    ["Medium", `${data.resolutionByPriority.medium} days`],
    ["Low", `${data.resolutionByPriority.low} days`]
  ];

  autoTable(doc, {
    startY: 92,
    head: [["Priority", "Average Resolution Time"]],
    body: priorityData,
  });

  // Add monthly data if available
  if (data.resolutionTimeData && data.resolutionTimeData.length > 0) {
    doc.setFontSize(14);
    // Get the last table's y position
    const lastTableY = doc.previousAutoTable.finalY;
    doc.text("Monthly Resolution Times", 14, lastTableY + 15);

    const tableData = data.resolutionTimeData.map(month => [
      month.name,
      month.urgent || "N/A",
      month.high || "N/A",
      month.medium || "N/A",
      month.low || "N/A"
    ]);

    autoTable(doc, {
      startY: lastTableY + 20,
      head: [["Month", "Urgent (days)", "High (days)", "Medium (days)", "Low (days)"]],
      body: tableData,
    });
  }
}

function addTeamReportContent(doc, data) {
  // Add summary metrics
  doc.setFontSize(14);
  doc.text("Summary", 14, 55);

  doc.setFontSize(12);
  doc.text(`Team Performance: ${data.teamPerformance}%`, 14, 65);
  doc.text(`Total Issues: ${data.totalIssues}`, 14, 73);
  doc.text(`Completed Issues: ${data.completedIssues}`, 14, 81);

  // Add team members
  if (data.teamMemberNames && data.teamMemberNames.length > 0) {
    doc.setFontSize(14);
    doc.text("Team Members", 14, 95);

    const membersList = data.teamMemberNames.join(", ");
    doc.setFontSize(12);
    doc.text(membersList, 14, 105, { maxWidth: 180 });
  }

  // Add performance metrics if available
  if (data.teamPerformanceData && data.teamPerformanceData.length > 0) {
    doc.setFontSize(14);
    doc.text("Performance Metrics", 14, 120);

    // Create a table with performance metrics
    const tableData = [];
    const memberColumns = ["Metric"];

    // Add member names to columns
    data.teamMemberNames.forEach((name, index) => {
      memberColumns.push(name);
    });

    // Add data rows
    data.teamPerformanceData.forEach(metric => {
      const row = [metric.subject];
      data.teamMemberNames.forEach((_, index) => {
        row.push(`${metric[`member${index + 1}`] || 0}%`);
      });
      tableData.push(row);
    });

    autoTable(doc, {
      startY: 125,
      head: [memberColumns],
      body: tableData,
    });
  }
}

function addTimeReportContent(doc, data) {
  // Add summary metrics
  doc.setFontSize(14);
  doc.text("Summary", 14, 55);

  doc.setFontSize(12);
  doc.text(`Total Time Tracked: ${data.totalHours} hours`, 14, 65);
  doc.text(`Average Time Per Issue: ${data.averageTimePerIssue} hours`, 14, 73);
  doc.text(`Issues Tracked: ${data.uniqueIssuesTracked}`, 14, 81);

  // Add time tracking data
  if (data.timeTrackingData && data.timeTrackingData.length > 0) {
    doc.setFontSize(14);
    doc.text("Time Distribution by Status", 14, 95);

    const tableData = data.timeTrackingData.map(item => [
      item.name,
      `${item.value} hours`,
      `${Math.round((item.value / data.totalHours) * 100)}%`
    ]);

    autoTable(doc, {
      startY: 100,
      head: [["Status", "Hours", "Percentage"]],
      body: tableData,
    });
  }
}

// Helper functions for CSV generation
function prepareVelocityCsvData(data) {
  const fields = ["Sprint", "Planned Issues", "Completed Issues", "Completion Rate (%)"];

  const csvData = data.sprintData.map(sprint => ({
    "Sprint": sprint.name,
    "Planned Issues": sprint.planned,
    "Completed Issues": sprint.completed,
    "Completion Rate (%)": sprint.completionRate
  }));

  // Add summary row
  csvData.push({
    "Sprint": "AVERAGE",
    "Planned Issues": "",
    "Completed Issues": data.averageVelocity,
    "Completion Rate (%)": ""
  });

  return { csvData, fields };
}

function prepareResolutionCsvData(data) {
  // Prepare monthly data
  const fields = ["Month", "Urgent (days)", "High (days)", "Medium (days)", "Low (days)"];

  const csvData = data.resolutionTimeData.map(month => ({
    "Month": month.name,
    "Urgent (days)": month.urgent || "N/A",
    "High (days)": month.high || "N/A",
    "Medium (days)": month.medium || "N/A",
    "Low (days)": month.low || "N/A"
  }));

  // Add summary row
  csvData.push({
    "Month": "AVERAGE",
    "Urgent (days)": data.resolutionByPriority.urgent,
    "High (days)": data.resolutionByPriority.high,
    "Medium (days)": data.resolutionByPriority.medium,
    "Low (days)": data.resolutionByPriority.low
  });

  return { csvData, fields };
}

function prepareTeamCsvData(data) {
  // Create fields with team member names
  const fields = ["Metric"];
  data.teamMemberNames.forEach(name => {
    fields.push(name);
  });

  // Create data rows
  const csvData = data.teamPerformanceData.map(metric => {
    const row = {
      "Metric": metric.subject
    };

    data.teamMemberNames.forEach((name, index) => {
      row[name] = `${metric[`member${index + 1}`] || 0}%`;
    });

    return row;
  });

  return { csvData, fields };
}

function prepareTimeCsvData(data) {
  const fields = ["Status", "Hours", "Percentage"];

  const csvData = data.timeTrackingData.map(item => ({
    "Status": item.name,
    "Hours": item.value,
    "Percentage": `${Math.round((item.value / data.totalHours) * 100)}%`
  }));

  // Add summary row
  csvData.push({
    "Status": "TOTAL",
    "Hours": data.totalHours,
    "Percentage": "100%"
  });

  return { csvData, fields };
}
