"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AdvancedLoader } from "@/components/loaders";
import { getIssueResolutionTimeData } from "@/actions/analytics";
import { Card, CardContent } from "@/components/ui/card";

export default function IssueResolutionTimeChart({ projectId, dateRange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    averageResolutionTime: 0,
    resolutionByPriority: {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    totalResolvedIssues: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getIssueResolutionTimeData(projectId, dateRange);
        setData(result.resolutionTimeData);
        setMetrics({
          averageResolutionTime: result.averageResolutionTime,
          resolutionByPriority: result.resolutionByPriority,
          totalResolvedIssues: result.totalResolvedIssues
        });
      } catch (error) {
        console.error("Error fetching issue resolution time data:", error);
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
          variant="spinner"
          type="pulse"
          color="#36d7b7"
          size={15}
          text="Loading resolution time data..."
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
            <div className="text-2xl font-bold">{metrics.averageResolutionTime} days</div>
            <div className="text-sm text-muted-foreground">Average Resolution Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics.totalResolvedIssues}</div>
            <div className="text-sm text-muted-foreground">Total Resolved Issues</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium">Resolution Time by Priority (days)</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                Urgent: {metrics.resolutionByPriority.urgent}
              </div>
              <div>
                <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></span>
                High: {metrics.resolutionByPriority.high}
              </div>
              <div>
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                Medium: {metrics.resolutionByPriority.medium}
              </div>
              <div>
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                Low: {metrics.resolutionByPriority.low}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="h-96">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: "Days", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="urgent"
                stroke="#ff0000"
                name="Urgent Priority"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="high"
                stroke="#ff9900"
                name="High Priority"
              />
              <Line
                type="monotone"
                dataKey="medium"
                stroke="#ffcc00"
                name="Medium Priority"
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke="#00cc00"
                name="Low Priority"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No resolution time data available for the selected date range.</p>
          </div>
        )}
      </div>
    </div>
  );
}
