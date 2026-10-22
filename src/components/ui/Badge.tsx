"use client";

import React from "react";

export type BadgeVariant =
  | "arqueos"
  | "facturacion"
  | "carta-digital"
  | "configuracion"
  | "counter"
  | "active-counter"
  | "default"
  | string;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export default function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    arqueos:
      "bg-[#F0EAFB] text-[#7357AA] border-[#E1D5F5] dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
    facturacion:
      "bg-[#E6F2FA] text-[#3674A9] border-[#CDE3F5] dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
    "carta-digital":
      "bg-[#E7F5EE] text-[#347F65] border-[#CEEAD9] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    configuracion:
      "bg-[#FFF0E9] text-[#E94817] border-[#FFD7C5] dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60",
    counter:
      "bg-[#FAF8F3] text-[#697386] border-[#e9e5de] dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60",
    "active-counter":
      "bg-[#ffd7c5] text-[#e94817] dark:bg-orange-950/50 dark:text-orange-300",
    default:
      "bg-[#FAF8F3] text-[#697386] border-[#e9e5de] dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60",
  };

  const appliedVariant = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center justify-center font-bold tracking-wider uppercase px-2.5 py-1 rounded-md border text-[10px] ${appliedVariant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
