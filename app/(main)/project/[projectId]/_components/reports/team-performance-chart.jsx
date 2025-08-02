"use client";

import { useState, useEffect } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AdvancedLoader } from "@/components/loaders";
import { getTeamPerformanceData } from "@/actions/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function TeamPerformanceChart({ projectId, dateRange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    teamPerformance: 0,
    teamMemberNames: [],
    totalIssues: 0,
    completedIssues: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getTeamPerformanceData(projectId, dateRange);
        setData(result.teamPerformanceData);
        setMetrics({
          teamPerformance: result.teamPerformance,
          teamMemberNames: result.teamMemberNames,
          totalIssues: result.totalIssues,
          completedIssues: result.completedIssues
        });
      } catch (error) {
        console.error("Error fetching team performance data:", error);
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
          type="grid"
          color="#36d7b7"
          size={25}
          text="Loading team performance data..."
          textPosition="bottom"
        />
      </div>
    );
  }

  // Create radar chart data keys based on team member count
  const getRadarComponents = () => {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

    return metrics.teamMemberNames.map((name, index) => (
      <Radar
        key={`member${index + 1}`}
        name={name}
        dataKey={`member${index + 1}`}
        stroke={colors[index % colors.length]}
        fill={colors[index % colors.length]}
        fillOpacity={0.6}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium mb-2">Team Performance</div>
            <div className="text-2xl font-bold mb-2">{metrics.teamPerformance}%</div>
            <Progress value={metrics.teamPerformance} className="h-2" />
            <div className="text-xs text-muted-foreground mt-2">
              {metrics.completedIssues} of {metrics.totalIssues} issues completed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium mb-2">Team Members</div>
            <div className="grid grid-cols-2 gap-2">
              {metrics.teamMemberNames.map((name, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"][index % 5]
                    }}
                  ></div>
                  <span className="text-sm truncate">{name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="h-96">
        {data.length > 0 && metrics.teamMemberNames.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={150} data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              {getRadarComponents()}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No team performance data available for the selected date range.</p>
          </div>
        )}
      </div>
    </div>
  );
}
