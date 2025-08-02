"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarLoader } from "react-spinners";
import useFetch from "@/hooks/use-fetch";
import { logTime } from "@/actions/issues";
import { parseTimeString } from "@/lib/format-time";

const timeLogSchema = z.object({
  timeSpent: z.string().min(1, "Time spent is required"),
  description: z.string().optional(),
});

export default function TimeLogForm({ issueId, onTimeLogged }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(timeLogSchema),
    defaultValues: {
      timeSpent: "",
      description: "",
    },
  });

  const {
    loading,
    error,
    fn: logTimeFn,
    data: updatedIssue,
  } = useFetch(logTime);

  const onSubmit = async (data) => {
    // Parse the time string (e.g., "2h 30m") into minutes
    const timeSpentMinutes = parseTimeString(data.timeSpent);

    if (timeSpentMinutes <= 0) {
      alert("Please enter a valid time format (e.g., 2h 30m, 45m)");
      return;
    }

    try {
      await logTimeFn(issueId, {
        timeSpent: timeSpentMinutes,
        description: data.description,
        loggedAt: new Date(),
      });
    } catch (error) {
      console.error("Error logging time:", error);
      // The error will be displayed by the useFetch hook
    }
  };

  if (updatedIssue && !loading) {
    reset();
    if (onTimeLogged) {
      onTimeLogged(updatedIssue);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Log Time</h3>
      {loading && <BarLoader width={"100%"} color="#36d7b7" />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label htmlFor="timeSpent" className="block text-sm font-medium mb-1">
            Time Spent (e.g., 2h 30m, 45m)
          </label>
          <Input
            id="timeSpent"
            placeholder="e.g., 2h 30m"
            {...register("timeSpent")}
          />
          {errors.timeSpent && (
            <p className="text-red-500 text-sm mt-1">
              {errors.timeSpent.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <Textarea
            id="description"
            placeholder="What did you work on?"
            {...register("description")}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Logging..." : "Log Time"}
        </Button>
        {error && <p className="text-red-500 text-sm">{error.message}</p>}
      </form>
    </div>
  );
}
