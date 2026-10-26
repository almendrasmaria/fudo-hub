"use client";

import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "success" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ElementType;
  iconPosition?: "left" | "right";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  disabled = false,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[#ff5722] hover:bg-[#e94817] text-white shadow-sm shadow-orange-500/20 active:scale-98",
    secondary:
      "bg-white border border-[#e9e5de] text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033] shadow-2xs active:scale-98 dark:bg-[#151c28] dark:border-[#242f42] dark:text-slate-300 dark:hover:bg-[#1c2637] dark:hover:text-white",
    ghost:
      "bg-transparent text-[#697386] hover:text-[#172033] hover:bg-[#FAF8F3] active:scale-98 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#1c2637]",
    success:
      "bg-[#3CAD75] text-white shadow-xs shadow-emerald-500/20 active:scale-98",
    outline:
      "bg-transparent border border-[#e9e5de] text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033] active:scale-98 dark:border-[#242f42] dark:text-slate-300 dark:hover:bg-[#1c2637] dark:hover:text-white",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-xs shadow-red-600/20 active:scale-98 border border-transparent",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-xs px-4 py-2 gap-2",
    lg: "text-sm px-5 py-2.5 gap-2.5",
    icon: "p-1.5 rounded-lg",
  };

  const appliedVariant = variants[variant] || variants.primary;
  const appliedSize = sizes[size] || sizes.md;

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${appliedVariant} ${appliedSize} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && (
        <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
      )}
      {children && <span>{children}</span>}
      {Icon && iconPosition === "right" && (
        <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
      )}
    </button>
  );
}
