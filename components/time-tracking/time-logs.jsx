"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { BarLoader } from "react-spinners";
import useFetch from "@/hooks/use-fetch";
import { getTimeLogs } from "@/actions/issues";
import { formatTimeSpent } from "@/lib/format-time";
import UserAvatar from "@/components/user-avatar";

export default function TimeLogs({ issueId, initialLogs = [], loading = false }) {
  const [timeLogs, setTimeLogs] = useState(initialLogs);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Update logs when initialLogs changes
    setTimeLogs(initialLogs);
  }, [initialLogs]);

  const displayLogs = showAll ? timeLogs : timeLogs.slice(0, 3);

  if (timeLogs.length === 0) {
    return <p className="text-sm text-gray-500">No time logged yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Time Logs</h3>

      {loading && <BarLoader width={"100%"} color="#36d7b7" />}

      <div className="space-y-2">
        {displayLogs.map((log) => (
          <div key={log.id} className="bg-slate-800 p-3 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{formatTimeSpent(log.timeSpent)}</div>
                {log.description && (
                  <p className="text-sm text-gray-400">{log.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">
                  {format(new Date(log.loggedAt), "MMM dd, yyyy")}
                </div>
                <div className="flex items-center justify-end mt-1">
                  {log.user && <UserAvatar user={log.user} size="sm" />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {timeLogs.length > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-sm text-blue-500 hover:underline"
        >
          Show all {timeLogs.length} time logs
        </button>
      )}

      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="text-sm text-blue-500 hover:underline"
        >
          Show less
        </button>
      )}
    </div>
  );
}
