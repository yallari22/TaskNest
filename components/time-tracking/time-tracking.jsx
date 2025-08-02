"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTimeSpent } from "@/lib/format-time";
import Timer from "./timer";
import TimeLogForm from "./time-log-form";
import TimeLogs from "./time-logs";
import { getTimeLogs } from "@/actions/issues";
import useFetch from "@/hooks/use-fetch";

export default function TimeTracking({ issue, onTimeLogged }) {
  const [activeTab, setActiveTab] = useState("logs");
  const [timeLogs, setTimeLogs] = useState([]);

  const {
    loading: logsLoading,
    error: logsError,
    fn: fetchTimeLogs,
    data: fetchedLogs,
  } = useFetch(getTimeLogs);

  // Fetch time logs when component mounts
  useEffect(() => {
    if (issue?.id) {
      fetchTimeLogs(issue.id);
    }
  }, [issue?.id]);

  // Update time logs when new logs are fetched
  useEffect(() => {
    if (fetchedLogs) {
      setTimeLogs(fetchedLogs);
    }
  }, [fetchedLogs]);

  const handleTimeLogged = (updatedIssue) => {
    setActiveTab("logs");
    // Refresh time logs after logging time
    fetchTimeLogs(issue.id);
    if (onTimeLogged) {
      onTimeLogged(updatedIssue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Time Tracking</h2>
        <div className="text-sm">
          <span className="font-medium">Total: </span>
          <span>{formatTimeSpent(issue.totalTimeSpent || 0)}</span>
        </div>
      </div>

      <Tabs defaultValue="logs" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="pt-4">
          <TimeLogs issueId={issue.id} initialLogs={timeLogs} loading={logsLoading} />
        </TabsContent>

        <TabsContent value="timer" className="pt-4">
          <Timer issueId={issue.id} onTimeLogged={handleTimeLogged} />
        </TabsContent>

        <TabsContent value="manual" className="pt-4">
          <TimeLogForm issueId={issue.id} onTimeLogged={handleTimeLogged} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
