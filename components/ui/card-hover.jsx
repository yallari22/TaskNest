"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function HoverCard({ 
  children, 
  className, 
  hoverEffect = "scale", 
  ...props 
}) {
  const hoverEffects = {
    scale: "hover:scale-105",
    lift: "hover:-translate-y-2",
    glow: "hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    border: "hover:border-primary",
    none: "",
  };

  return (
    <motion.div
      whileHover={{ 
        scale: hoverEffect === "scale" ? 1.05 : 1,
        y: hoverEffect === "lift" ? -8 : 0,
        boxShadow: hoverEffect === "glow" ? "0 0 15px rgba(59, 130, 246, 0.5)" : "none",
        borderColor: hoverEffect === "border" ? "var(--primary)" : "transparent",
      }}
      transition={{ duration: 0.2 }}
      className={cn("transition-all duration-300", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function HoverCardContent({ 
  children, 
  className, 
  ...props 
}) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      {children}
    </Card>
  );
}

export { CardHeader, CardContent, CardFooter };
