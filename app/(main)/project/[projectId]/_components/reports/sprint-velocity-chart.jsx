"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AdvancedLoader } from "@/components/loaders";
import { getSprintVelocityData } from "@/actions/analytics";
import { Card, CardContent } from "@/components/ui/card";

export default function SprintVelocityChart({ projectId, dateRange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    averageVelocity: 0,
    totalSprints: 0,
    totalCompletedIssues: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getSprintVelocityData(projectId, dateRange);
        setData(result.sprintData);
        setMetrics({
          averageVelocity: result.averageVelocity,
          totalSprints: result.totalSprints,
          totalCompletedIssues: result.totalCompletedIssues
        });
      } catch (error) {
        console.error("Error fetching sprint velocity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, dateRange]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <AdvancedLoader
          variant="lottie"
          type="data"
          width={200}
          height={200}
          text="Loading sprint velocity data..."
          textPosition="bottom"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics.averageVelocity}</div>
            <div className="text-sm text-muted-foreground">Average Velocity</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics.totalSprints}</div>
            <div className="text-sm text-muted-foreground">Total Sprints</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics.totalCompletedIssues}</div>
            <div className="text-sm text-muted-foreground">Completed Issues</div>
          </CardContent>
        </Card>
      </div>

      <div className="h-96">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" fill="#8884d8" name="Planned Issues" />
              <Bar dataKey="completed" fill="#82ca9d" name="Completed Issues" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No sprint data available for the selected date range.</p>
          </div>
        )}
      </div>
    </div>
  );
}
