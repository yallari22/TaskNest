"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AdvancedLoader } from "@/components/loaders";
import { getTimeTrackingSummaryData } from "@/actions/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, BarChart2 } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function TimeTrackingSummaryChart({ projectId, dateRange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalHours: 0,
    averageTimePerIssue: 0,
    uniqueIssuesTracked: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getTimeTrackingSummaryData(projectId, dateRange);
        setData(result.timeTrackingData);
        setMetrics({
          totalHours: result.totalHours,
          averageTimePerIssue: result.averageTimePerIssue,
          uniqueIssuesTracked: result.uniqueIssuesTracked
        });
      } catch (error) {
        console.error("Error fetching time tracking data:", error);
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
          type="processing"
          width={200}
          height={200}
          text="Loading time tracking data..."
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
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Total Time Tracked</div>
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.totalHours} hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Average Time Per Issue</div>
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.averageTimePerIssue} hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Issues Tracked</div>
            </div>
            <div className="text-2xl font-bold mt-2">{metrics.uniqueIssuesTracked}</div>
          </CardContent>
        </Card>
      </div>

      <div className="h-96">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} hours`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No time tracking data available for the selected date range.</p>
          </div>
        )}
      </div>
    </div>
  );
}
