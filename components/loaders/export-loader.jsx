"use client";

import React from "react";
import { AdvancedLoader } from "./index";

export default function ExportLoader({ size = 16, color = "#36d7b7", inline = false }) {
  return (
    <div className={inline ? "inline-flex" : "flex"}>
      <AdvancedLoader
        variant="spinner"
        type="clip"
        color={color}
        size={size}
      />
    </div>
  );
}
