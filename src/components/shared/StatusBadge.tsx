import React from "react";
import { AppointmentStatus, UserRole } from "@/lib/types";
import { getRoleStatusLabel, getStatusStyle } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: AppointmentStatus;
  role?: UserRole;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, role = "doctor", showDot = true, className }: StatusBadgeProps) {
  const label = getRoleStatusLabel(status, role);
  const style = getStatusStyle(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs select-none",
        style.badge,
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />}
      <span>{label}</span>
    </span>
  );
}

