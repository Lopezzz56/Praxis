"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (options: { title: string; description?: string; type?: ToastType }) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(({ title, description, type = "info" }: { title: string; description?: string; type?: ToastType }) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((t) => {
          const typeIcons = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
            error: <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />,
            warning: <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
            info: <Info className="h-5 w-5 text-clinic-600 flex-shrink-0" />,
          };

          const borderColors = {
            success: "border-emerald-200 bg-white",
            error: "border-rose-200 bg-white",
            warning: "border-amber-200 bg-white",
            info: "border-clinic-200 bg-white",
          };

          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto rounded-xl border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-200 flex items-start gap-3",
                borderColors[t.type]
              )}
            >
              {typeIcons[t.type]}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                {t.description && <p className="text-xs text-slate-600 mt-0.5">{t.description}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

