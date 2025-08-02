"use server";

// This is a placeholder for the actual AI integration
// In a real implementation, you would use an AI service like OpenAI or a custom model

export async function getAIPriorityRecommendation(issueData) {
  try {
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Simple mock logic for priority recommendation
    const title = issueData.title.toLowerCase();
    const description = issueData.description?.toLowerCase() || "";
    
    let priority = "MEDIUM";
    let confidence = 0.7;
    
    // Check for urgent keywords
    if (
      title.includes("urgent") ||
      title.includes("critical") ||
      title.includes("emergency") ||
      description.includes("urgent") ||
      description.includes("critical") ||
      description.includes("emergency")
    ) {
      priority = "URGENT";
      confidence = 0.9;
    } 
    // Check for high priority keywords
    else if (
      title.includes("important") ||
      title.includes("high") ||
      title.includes("priority") ||
      description.includes("important") ||
      description.includes("high priority")
    ) {
      priority = "HIGH";
      confidence = 0.8;
    }
    // Check for low priority keywords
    else if (
      title.includes("minor") ||
      title.includes("low") ||
      title.includes("trivial") ||
      description.includes("minor") ||
      description.includes("low priority") ||
      description.includes("trivial")
    ) {
      priority = "LOW";
      confidence = 0.8;
    }
    
    return {
      priority,
      confidence,
      explanation: `Based on the issue title and description, this appears to be a ${priority.toLowerCase()} priority issue.`,
    };
  } catch (error) {
    console.error("Error getting AI priority recommendation:", error);
    return {
      priority: "MEDIUM",
      confidence: 0.5,
      explanation: "Unable to analyze the issue. Using default priority.",
    };
  }
}

export async function getAITimeEstimation(issueData) {
  try {
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Simple mock logic for time estimation
    const title = issueData.title.toLowerCase();
    const description = issueData.description?.toLowerCase() || "";
    const priority = issueData.priority;
    
    // Base time in hours
    let estimatedTime = 4;
    let confidence = 0.6;
    
    // Adjust based on priority
    if (priority === "URGENT" || priority === "HIGH") {
      estimatedTime += 2;
    } else if (priority === "LOW") {
      estimatedTime -= 1;
    }
    
    // Adjust based on keywords
    if (
      title.includes("bug") ||
      title.includes("fix") ||
      description.includes("bug") ||
      description.includes("fix")
    ) {
      estimatedTime += 1;
      confidence = 0.7;
    }
    
    if (
      title.includes("feature") ||
      title.includes("implement") ||
      description.includes("feature") ||
      description.includes("implement")
    ) {
      estimatedTime += 3;
      confidence = 0.7;
    }
    
    if (
      title.includes("refactor") ||
      title.includes("improve") ||
      description.includes("refactor") ||
      description.includes("improve")
    ) {
      estimatedTime += 2;
      confidence = 0.7;
    }
    
    // Convert to minutes
    const estimatedMinutes = Math.max(30, estimatedTime * 60);
    
    return {
      estimatedMinutes,
      confidence,
      explanation: `Based on the issue details, this task may take approximately ${estimatedTime} hours to complete.`,
    };
  } catch (error) {
    console.error("Error getting AI time estimation:", error);
    return {
      estimatedMinutes: 240, // 4 hours
      confidence: 0.5,
      explanation: "Unable to analyze the issue. Using default time estimation.",
    };
  }
}
