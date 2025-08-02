"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, StopCircle } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { logTime } from "@/actions/issues";

export default function Timer({ issueId, onTimeLogged }) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [description, setDescription] = useState("");
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const {
    loading,
    error,
    fn: logTimeFn,
    data: updatedIssue,
  } = useFetch(logTime);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);

      // Record the start time
      if (!startTimeRef.current) {
        startTimeRef.current = new Date();
      }
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    startTimeRef.current = new Date();
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = async () => {
    setIsRunning(false);

    // Only log time if the timer has been running for at least 1 minute
    if (seconds >= 60) {
      const minutesSpent = Math.floor(seconds / 60);

      try {
        await logTimeFn(issueId, {
          timeSpent: minutesSpent,
          description: description || "Time tracked with timer",
          loggedAt: startTimeRef.current,
        });

        // Reset timer and description after logging
        setSeconds(0);
        setDescription("");
        startTimeRef.current = null;

        if (onTimeLogged && updatedIssue) {
          onTimeLogged(updatedIssue);
        }
      } catch (error) {
        console.error("Error logging time:", error);
        // Don't reset the timer if there's an error, so the user can try again
      }
    } else {
      // Reset timer without logging if less than 1 minute
      setSeconds(0);
      startTimeRef.current = null;
    }
  };

  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Timer</h3>
      <div className="flex flex-col space-y-3">
        <div className="text-3xl font-mono text-center">{formatTime(seconds)}</div>

        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              size="sm"
              variant="outline"
              className="flex items-center"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              size="sm"
              variant="outline"
              className="flex items-center"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}

          <Button
            onClick={handleStop}
            size="sm"
            variant="destructive"
            disabled={seconds === 0}
            className="flex items-center"
          >
            <StopCircle className="h-4 w-4 mr-1" />
            Stop & Log
          </Button>
        </div>

        {seconds > 0 && (
          <input
            type="text"
            placeholder="What are you working on? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 p-2 border rounded w-full"
          />
        )}

        {error && <p className="text-red-500 text-sm">{error.message}</p>}
      </div>
    </div>
  );
}
