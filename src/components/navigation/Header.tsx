"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useClinicStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { Stethoscope, User, Calendar, RotateCcw, Building2, Menu, X } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { metrics, resetToDefaultData, doctorProfile } = useClinicStore();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleReset = () => {
    resetToDefaultData();
    toast({
      title: "Clinic Data Reset",
      description: "Demo appointments, live queue tokens, and metrics have been restored to defaults.",
      type: "info",
    });
  };

  const navLinks = [
    {
      href: "/",
      label: "Public Website",
      icon: <Building2 className="w-4 h-4" />,
      exact: true,
    },
    {
      href: "/patient",
      label: "Patient Portal",
      icon: <User className="w-4 h-4" />,
      exact: false,
    },
    {
      href: "/doctor",
      label: "Doctor Portal",
      icon: <Stethoscope className="w-4 h-4" />,
      badge: metrics.waitingCount > 0 ? `${metrics.waitingCount} waiting` : undefined,
      exact: false,
    },
    {
      href: "/reception",
      label: "Reception Desk",
      icon: <Calendar className="w-4 h-4" />,
      badge: metrics.totalAppointments > 0 ? `${metrics.totalAppointments} today` : undefined,
      exact: false,
    },
  ];

  const isCurrentActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinic-500 rounded-lg">
            <div className="w-10 h-10 rounded-xl bg-clinic-600 flex items-center justify-center text-white shadow-sm shadow-clinic-600/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg block leading-tight">
                {doctorProfile.clinicName}
              </span>
              <span className="text-xs text-slate-500 font-medium">Solo Practice • {doctorProfile.name}</span>
            </div>
          </Link>

          {/* Desktop Role Switcher Bar */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60" aria-label="Role navigation">
            {navLinks.map((link) => {
              const active = isCurrentActive(link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 select-none min-h-[36px]",
                    active
                      ? "bg-white text-clinic-700 shadow-xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className={cn(
                        "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                        active ? "bg-clinic-100 text-clinic-800" : "bg-slate-200 text-slate-700"
                      )}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Demo Reset and Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset mock data to initial demo state"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinic-500 min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Mock Data</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 flex flex-col gap-1 pb-4 animate-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const active = isCurrentActive(link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium min-h-[44px]",
                    active ? "bg-clinic-50 text-clinic-700 font-semibold" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {link.icon}
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-200 text-slate-700">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

