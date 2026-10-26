"use client";

import React, { useEffect } from "react";
import { X, Copy, Check, ExternalLink, Image as ImageIcon } from "lucide-react";

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
  macroTitle?: string;
  onCopyImage?: () => void;
  copiedImage?: boolean;
}

export default function ImageLightbox({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  macroTitle,
  onCopyImage,
  copiedImage = false,
}: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vista previa de imagen"
      className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Bar: Title & Actions */}
      <div
        className="w-full max-w-5xl mx-auto flex items-center justify-between gap-4 text-white pb-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4 text-[#ff5722]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate leading-tight">
              {macroTitle || imageName || "Captura adjunta"}
            </h4>
            {imageName && (
              <p className="text-[11px] text-white/60 truncate">{imageName}</p>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onCopyImage && (
            <button
              type="button"
              onClick={onCopyImage}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 border ${
                copiedImage
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-sm"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/15"
              }`}
              title="Copiar imagen para pegar directo en WhatsApp o chat"
            >
              {copiedImage ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>¡Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 stroke-2" />
                  <span>Copiar imagen</span>
                </>
              )}
            </button>
          )}

          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
            title="Abrir imagen original en nueva pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar vista previa"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Image Container */}
      <div
        className="flex-1 flex items-center justify-center p-2 min-h-0 overflow-hidden"
        onClick={(e) => {
          // If clicking strictly the black background inside center, close
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="relative max-h-full max-w-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageName || "Captura ampliada"}
            className="max-h-[78vh] max-w-[92vw] md:max-w-4xl w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200"
          />
        </div>
      </div>

      {/* Bottom Hint */}
      <div
        className="w-full text-center pt-2 text-[11px] text-white/50 shrink-0 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <span>Hacé clic afuera de la imagen o presioná </span>
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-[10px] text-white/70">
          ESC
        </kbd>
        <span> para cerrar</span>
      </div>
    </div>
  );
}
