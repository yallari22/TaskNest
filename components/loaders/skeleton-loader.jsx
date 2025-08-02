"use client";

import React from "react";

export default function SkeletonLoader({
  variant = "rectangle", // "rectangle", "circle", "text", "card", "list", "table"
  width = "100%",
  height = "20px",
  count = 1,
  className = "",
  animate = true,
}) {
  const baseClasses = `bg-gray-200 dark:bg-gray-700 ${
    animate ? "animate-pulse" : ""
  }`;

  const getSkeletonItem = (index) => {
    switch (variant) {
      case "circle":
        return (
          <div
            key={index}
            className={`${baseClasses} rounded-full ${className}`}
            style={{ width, height }}
          />
        );
      case "text":
        return (
          <div key={index} className="space-y-2">
            <div
              className={`${baseClasses} h-4 rounded ${className}`}
              style={{ width: "100%" }}
            />
            <div
              className={`${baseClasses} h-4 rounded ${className}`}
              style={{ width: "90%" }}
            />
            <div
              className={`${baseClasses} h-4 rounded ${className}`}
              style={{ width: "80%" }}
            />
          </div>
        );
      case "card":
        return (
          <div
            key={index}
            className={`${baseClasses} rounded-lg p-4 ${className}`}
            style={{ width, height: height || "200px" }}
          >
            <div className={`${baseClasses} h-6 w-3/4 rounded mb-4`} />
            <div className={`${baseClasses} h-4 w-full rounded mb-2`} />
            <div className={`${baseClasses} h-4 w-full rounded mb-2`} />
            <div className={`${baseClasses} h-4 w-2/3 rounded`} />
            <div className="flex justify-between mt-6">
              <div className={`${baseClasses} h-8 w-20 rounded`} />
              <div className={`${baseClasses} h-8 w-8 rounded-full`} />
            </div>
          </div>
        );
      case "list":
        return (
          <div key={index} className="space-y-3">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className={`${baseClasses} h-10 w-10 rounded-full`} />
                <div className="flex-1 space-y-2">
                  <div className={`${baseClasses} h-4 w-3/4 rounded`} />
                  <div className={`${baseClasses} h-3 w-1/2 rounded`} />
                </div>
              </div>
            ))}
          </div>
        );
      case "table":
        return (
          <div key={index} className="space-y-3">
            <div className={`${baseClasses} h-8 w-full rounded mb-4`} />
            {[...Array(count)].map((_, i) => (
              <div key={i} className={`${baseClasses} h-6 w-full rounded mb-2`} />
            ))}
          </div>
        );
      default:
        return (
          <div
            key={index}
            className={`${baseClasses} rounded ${className}`}
            style={{ width, height }}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {variant === "list" || variant === "table"
        ? getSkeletonItem(0)
        : [...Array(count)].map((_, index) => getSkeletonItem(index))}
    </div>
  );
}
