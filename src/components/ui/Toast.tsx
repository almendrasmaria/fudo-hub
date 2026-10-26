"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      containerClass:
        "bg-white dark:bg-[#151c28] border-emerald-200 dark:border-emerald-800/60 shadow-lg shadow-emerald-500/10",
      iconClass: "text-[#3CAD75] bg-emerald-50 dark:bg-emerald-950/50",
    },
    error: {
      icon: XCircle,
      containerClass:
        "bg-white dark:bg-[#151c28] border-red-200 dark:border-red-800/60 shadow-lg shadow-red-500/10",
      iconClass: "text-red-500 bg-red-50 dark:bg-red-950/50",
    },
    warning: {
      icon: AlertCircle,
      containerClass:
        "bg-white dark:bg-[#151c28] border-amber-200 dark:border-amber-800/60 shadow-lg shadow-amber-500/10",
      iconClass: "text-amber-500 bg-amber-50 dark:bg-amber-950/50",
    },
    info: {
      icon: Info,
      containerClass:
        "bg-white dark:bg-[#151c28] border-sky-200 dark:border-sky-800/60 shadow-lg shadow-sky-500/10",
      iconClass: "text-sky-500 bg-sky-50 dark:bg-sky-950/50",
    },
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border text-[#172033] dark:text-slate-100 transition-all duration-200 animate-in slide-in-from-bottom-5 fade-in ${config.containerClass}`}
    >
      <div className={`p-2 rounded-xl shrink-0 ${config.iconClass}`}>
        <Icon className="w-4 h-4 stroke-[2.2]" />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
        {toast.message && (
          <p className="text-[11px] text-[#697386] dark:text-slate-400 mt-0.5 leading-relaxed font-normal">
            {toast.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
        className="text-[#697386] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
