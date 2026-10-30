import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AppointmentStatus, UserRole, STATUS_ROLE_MAPPING, STATUS_STYLE_CONFIG } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  try {
    const [hourStr, minuteStr] = timeString.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  } catch {
    return timeString;
  }
}

export function getRoleStatusLabel(status: AppointmentStatus, role: UserRole): string {
  return STATUS_ROLE_MAPPING[status]?.[role] || status;
}

export function getStatusStyle(status: AppointmentStatus) {
  return STATUS_STYLE_CONFIG[status] || STATUS_STYLE_CONFIG.booked;
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

