"use client";

import React from "react";
import LottieLoader from "./lottie-loader";
import SpinnerLoader from "./spinner-loader";

export default function AdvancedLoader({
  variant = "spinner", // "spinner", "lottie"
  type = "bar", // for spinner: "bar", "beat", "clip", etc. | for lottie: "default", "data", "processing"
  color = "#36d7b7",
  size = 35,
  width = "100%",
  height = "auto",
  className = "",
  text = "",
  textPosition = "bottom",
  fullPage = false,
}) {
  const loaderComponent =
    variant === "lottie" ? (
      <LottieLoader
        animationName={type}
        width={width}
        height={height}
        className={className}
      />
    ) : (
      <SpinnerLoader
        type={type}
        color={color}
        size={size}
        width={width}
        className={className}
        text={text}
        textPosition={textPosition}
      />
    );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {loaderComponent}
      </div>
    );
  }

  return loaderComponent;
}
