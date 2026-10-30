import React from "react";
import { cn } from "@/lib/utils";

interface QueueTokenProps {
  tokenNumber?: string;
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  className?: string;
}

export function QueueToken({ tokenNumber = "--", size = "md", isActive = false, className }: QueueTokenProps) {
  const sizeStyles = {
    sm: "h-7 px-2 text-xs font-mono font-semibold",
    md: "h-9 px-3 text-sm font-mono font-bold",
    lg: "h-14 px-5 text-2xl font-mono font-extrabold tracking-tight",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-xl border transition-all shrink-0 select-none",
        isActive
          ? "bg-clinic-600 text-white border-clinic-700 shadow-sm shadow-clinic-600/30 ring-2 ring-clinic-500/20"
          : "bg-slate-100 text-slate-800 border-slate-200",
        sizeStyles[size],
        className
      )}
    >
      <span>{tokenNumber}</span>
    </div>
  );
}

