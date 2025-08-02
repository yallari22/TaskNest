"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Heading({ 
  children, 
  level = 1, 
  className, 
  gradient = false,
  ...props 
}) {
  const Component = `h${level}`;
  
  const baseClasses = {
    1: "text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight",
    2: "text-3xl md:text-4xl font-bold tracking-tight",
    3: "text-2xl md:text-3xl font-bold",
    4: "text-xl md:text-2xl font-semibold",
    5: "text-lg md:text-xl font-semibold",
    6: "text-base md:text-lg font-medium",
  };

  const gradientClass = gradient ? "gradient-title" : "";

  return (
    <Component
      className={cn(baseClasses[level], gradientClass, className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Paragraph({ 
  children, 
  size = "default", 
  className, 
  ...props 
}) {
  const sizeClasses = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <p
      className={cn(sizeClasses[size], className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function Lead({ 
  children, 
  className, 
  ...props 
}) {
  return (
    <p
      className={cn("text-xl text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function Subtle({ 
  children, 
  className, 
  ...props 
}) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}
