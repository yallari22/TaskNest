"use client";

import React from "react";
import {
  BarLoader,
  BeatLoader,
  ClipLoader,
  ClockLoader,
  FadeLoader,
  GridLoader,
  HashLoader,
  MoonLoader,
  PulseLoader,
  RingLoader,
  ScaleLoader,
} from "react-spinners";

const spinnerTypes = {
  bar: BarLoader,
  beat: BeatLoader,
  clip: ClipLoader,
  clock: ClockLoader,
  fade: FadeLoader,
  grid: GridLoader,
  hash: HashLoader,
  moon: MoonLoader,
  pulse: PulseLoader,
  ring: RingLoader,
  scale: ScaleLoader,
};

export default function SpinnerLoader({
  type = "bar",
  color = "#36d7b7",
  size = 35,
  width = "100%",
  height = "auto",
  className = "",
  text = "",
  textPosition = "bottom", // "top", "bottom", "left", "right"
}) {
  const SpinnerComponent = spinnerTypes[type] || spinnerTypes.bar;
  
  const spinnerProps = type === "bar" 
    ? { width, color } 
    : { color, size };

  const flexDirection = 
    textPosition === "bottom" ? "flex-col" :
    textPosition === "top" ? "flex-col-reverse" :
    textPosition === "left" ? "flex-row-reverse" :
    "flex-row";

  return (
    <div className={`flex justify-center items-center ${flexDirection} gap-3 ${className}`}>
      <div className="flex justify-center">
        <SpinnerComponent {...spinnerProps} />
      </div>
      {text && (
        <div className="text-sm text-muted-foreground animate-pulse">
          {text}
        </div>
      )}
    </div>
  );
}
