import React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    label: string;
    isPositive: boolean;
  };
  highlight?: "teal" | "amber" | "emerald" | "default";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = "default",
  className,
}: MetricCardProps) {
  const highlightStyles = {
    default: "border-slate-200/80 bg-white",
    teal: "border-clinic-200 bg-clinic-50/40",
    amber: "border-amber-200 bg-amber-50/40",
    emerald: "border-emerald-200 bg-emerald-50/40",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-xs transition-all hover:shadow-sm",
        highlightStyles[highlight],
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        {icon && <div className="text-slate-400 shrink-0">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              trend.isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
            )}
          >
            {trend.label}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

