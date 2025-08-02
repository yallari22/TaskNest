"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, Loader2 } from "lucide-react";
import { AdvancedLoader, ExportLoader } from "@/components/loaders";
import { toast } from "sonner";
import { generatePdfReport, generateCsvReport } from "@/lib/report-utils";
import SprintVelocityChart from "../_components/reports/sprint-velocity-chart";
import IssueResolutionTimeChart from "../_components/reports/issue-resolution-time-chart";
import TeamPerformanceChart from "../_components/reports/team-performance-chart";
import TimeTrackingSummaryChart from "../_components/reports/time-tracking-summary-chart";

export default function ReportsPage({ params }) {
  const { projectId } = params;
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [exporting, setExporting] = useState(false);
  const [exportingType, setExportingType] = useState(null);

  const handleExport = async (format, reportType = "velocity") => {
    try {
      setExporting(true);
      setExportingType(`${reportType}-${format}`);

      // Get the current tab if not specified
      let activeReportType = reportType;

      if (reportType === "current" || !reportType) {
        const currentTab = document.querySelector('[data-state="active"][role="tab"]');
        if (currentTab) {
          activeReportType = currentTab.getAttribute("data-value");
        } else {
          // Default to velocity if we can't determine the current tab
          activeReportType = "velocity";
        }
      }

      // Call the API to get the report data
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          dateRange,
          reportType: activeReportType,
          format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate report");
      }

      const data = await response.json();

      // Generate the report file based on the format
      let fileName;
      if (format === "pdf") {
        fileName = generatePdfReport(data.data);
      } else if (format === "csv") {
        fileName = generateCsvReport(data.data);
      }

      toast.success(`Report exported as ${fileName}`);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error(error.message || "Failed to export report");
    } finally {
      setExporting(false);
      setExportingType(null);
    }
  };

  // Helper function to check if a specific export is in progress
  const isExportingSpecific = (reportType, format) => {
    return exporting && exportingType === `${reportType}-${format}`;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf", "current")}
              disabled={exporting}
            >
              {exporting && exportingType?.endsWith("-pdf") ? (
                <ExportLoader size={16} color="#36d7b7" inline={true} />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv", "current")}
              disabled={exporting}
            >
              {exporting && exportingType?.endsWith("-csv") ? (
                <ExportLoader size={16} color="#36d7b7" inline={true} />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              CSV
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="velocity">
        <TabsList className="mb-6">
          <TabsTrigger value="velocity">Sprint Velocity</TabsTrigger>
          <TabsTrigger value="resolution">Issue Resolution Time</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="velocity">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sprint Velocity</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleExport("pdf", "velocity")}
                  disabled={exporting}
                  title="Export as PDF"
                >
                  {isExportingSpecific("velocity", "pdf") ? (
                    <ExportLoader size={16} color="#36d7b7" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleExport("csv", "velocity")}
                  disabled={exporting}
                  title="Export as CSV"
                >
                  {isExportingSpecific("velocity", "csv") ? (
                    <ExportLoader size={16} color="#36d7b7" />
                  ) : (
                    <span className="text-xs font-bold">CSV</span>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SprintVelocityChart projectId={projectId} dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolution">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Issue Resolution Time</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleExport("pdf", "resolution")}
                  disabled={exporting}
                  title="Export as PDF"
                >
                  {isExportingSpecific("resolution", "pdf") ? (
                    <ExportLoader size={16} color="#36d7b7" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleExport("csv", "resolution")}
                  disabled={exporting}
                  title="Export as CSV"
                >
                  {isExportingSpecific("resolution", "csv") ? (
                    <ExportLoader size={16} color="#36d7b7" />
                  ) : (
                    <span className="text-xs font-bold">CSV</span>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <IssueResolutionTimeChart projectId={projectId} dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Performance</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleExport("pdf", "team")}
                  disabled={exporting}
                  title="Export as PDF"
                >
                  {isExportingSpecific("team", "pdf") ? (
                    <ExportLoader size={16} color="#36d7b7" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleExport("csv", "team")}
                  disabled={exporting}
                  title="Export as CSV"
                >
                  {isExportingSpecific("team", "csv") ? (
                    <ExportLoader size={16} color="#36d7b7" />
                  ) : (
                    <span className="text-xs font-bold">CSV</span>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TeamPerformanceChart projectId={projectId} dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Time Tracking Summary</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleExport("pdf", "time")}
                  disabled={exporting}
                  title="Export as PDF"
                >
                  {isExportingSpecific("time", "pdf") ? (
                    <ExportLoader size={16} color="#36d7b7" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleExport("csv", "time")}
                  disabled={exporting}
                  title="Export as CSV"
                >
                  {isExportingSpecific("time", "csv") ? (
                    <ExportLoader size={16} color="#36d7b7" />
                  ) : (
                    <span className="text-xs font-bold">CSV</span>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <TimeTrackingSummaryChart projectId={projectId} dateRange={dateRange} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
