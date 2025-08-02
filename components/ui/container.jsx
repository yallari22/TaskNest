"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Container({ 
  children, 
  className, 
  size = "default", 
  as: Component = "div",
  ...props 
}) {
  const sizeClasses = {
    sm: "max-w-4xl",
    default: "max-w-7xl",
    lg: "max-w-screen-2xl",
    fluid: "max-w-full",
  };

  return (
    <Component
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
