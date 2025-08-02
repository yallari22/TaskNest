"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import { getAIPriorityRecommendation } from "@/lib/ai-suggestions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export default function AIPrioritySuggestion({ issueData, onAccept }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [accepted, setAccepted] = useState(false);

  const handleGetSuggestion = async () => {
    setLoading(true);
    try {
      const result = await getAIPriorityRecommendation(issueData);
      setSuggestion(result);
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (suggestion) {
      onAccept(suggestion.priority);
      setAccepted(true);
      setTimeout(() => setAccepted(false), 2000);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div>
      {!suggestion ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetSuggestion}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" />
          {loading ? "Analyzing..." : "AI Suggest"}
        </Button>
      ) : (
        <div className="mt-2 p-3 bg-secondary/50 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="font-medium">AI Suggestion</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">Confidence:</span>
                    <div className="w-16 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getConfidenceColor(
                          suggestion.confidence
                        )}`}
                        style={{ width: `${suggestion.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {(suggestion.confidence * 100).toFixed(0)}% confidence level
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mb-2">
            <Badge variant="outline" className="font-bold">
              {suggestion.priority}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {suggestion.explanation}
          </p>

          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={handleAccept}
              className="flex items-center gap-1"
              disabled={accepted}
            >
              {accepted ? (
                <>
                  <Check className="h-3 w-3" /> Applied
                </>
              ) : (
                "Accept Suggestion"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
