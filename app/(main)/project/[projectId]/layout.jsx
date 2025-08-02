"use client";

import { Suspense } from "react";
import { AdvancedLoader } from "@/components/loaders";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProjectLayout({ children, params }) {
  const pathname = usePathname();
  const { projectId } = params;

  const isSettingsActive = pathname.includes("/settings");
  const isReportsActive = pathname.includes("/reports");
  const settingsSubpath = pathname.split("/settings/")[1] || "workflows";

  return (
    <div className="mx-auto">
      <div className="mb-6 border-b">
        <Tabs defaultValue={isSettingsActive ? "settings" : isReportsActive ? "reports" : "board"} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="board" asChild>
              <Link href={`/project/${projectId}`}>Board</Link>
            </TabsTrigger>
            <TabsTrigger value="reports" asChild>
              <Link href={`/project/${projectId}/reports`}>Reports</Link>
            </TabsTrigger>
            <TabsTrigger value="settings" asChild>
              <Link href={`/project/${projectId}/settings/workflows`}>Settings</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isSettingsActive && (
          <div className="mt-2 mb-4">
            <Tabs defaultValue={settingsSubpath} className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="workflows" asChild>
                  <Link href={`/project/${projectId}/settings/workflows`}>Workflows</Link>
                </TabsTrigger>
                <TabsTrigger value="members" asChild>
                  <Link href={`/project/${projectId}/settings/members`}>Members</Link>
                </TabsTrigger>
                <TabsTrigger value="general" asChild>
                  <Link href={`/project/${projectId}/settings/general`}>General</Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      <Suspense fallback={
        <div className="py-8 flex justify-center">
          <AdvancedLoader
            variant="lottie"
            type="default"
            width={200}
            height={100}
            text="Loading project content..."
            textPosition="bottom"
          />
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
}
