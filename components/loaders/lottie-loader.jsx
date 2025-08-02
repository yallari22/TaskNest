"use client";

import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "./animations/loading-animation.json";
import dataLoadingAnimation from "./animations/data-loading-animation.json";
import processingAnimation from "./animations/processing-animation.json";

const animations = {
  default: loadingAnimation,
  data: dataLoadingAnimation,
  processing: processingAnimation,
};

export default function LottieLoader({
  animationName = "default",
  width = "100%",
  height = 80,
  loop = true,
  autoplay = true,
  className = "",
}) {
  const animationData = animations[animationName] || animations.default;

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width, height }}
      />
    </div>
  );
}
