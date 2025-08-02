"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const createTestNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-notification");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error creating test notification:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Test Notifications</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Test Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Click the button below to create a test notification. This will create a notification
            for your user account that will appear in the notification dropdown in the header.
          </p>
          <Button 
            onClick={createTestNotification} 
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Test Notification"}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 rounded bg-slate-800">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Sign in to your account</li>
            <li>Click the "Create Test Notification" button above</li>
            <li>Check the notification bell in the header</li>
            <li>Click on the notification to mark it as read</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
