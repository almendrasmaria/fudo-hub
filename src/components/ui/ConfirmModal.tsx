"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import Button from "./Button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  icon?: React.ElementType;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  icon: CustomIcon,
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const IconComponent =
    CustomIcon || (variant === "danger" ? Trash2 : AlertTriangle);

  const iconColors = {
    danger:
      "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/60",
    warning:
      "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/60",
    primary:
      "bg-[#fff0e9] text-[#ff5722] border-[#ffd7c5] dark:bg-orange-500/15 dark:text-[#ff7849] dark:border-[#ff5722]/30",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#151c28] rounded-3xl border border-[#e9e5de] dark:border-[#242f42] shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          disabled={isLoading}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-[#697386] hover:text-[#172033] hover:bg-[#FAF8F3] dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#1c2637] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Icon and Text */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${iconColors[variant]}`}
          >
            <IconComponent className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="flex-1 pr-6">
            <h3
              id="confirm-modal-title"
              className="text-base font-extrabold text-[#172033] dark:text-slate-100 mb-1 leading-snug"
            >
              {title}
            </h3>
            <p className="text-xs text-[#697386] dark:text-slate-400 leading-relaxed font-normal">
              {description}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#f0ece5] dark:border-[#242f42]">
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            variant={variant === "danger" ? "danger" : variant === "primary" ? "primary" : "secondary"}
            size="md"
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
