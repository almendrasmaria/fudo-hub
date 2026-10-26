"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Clock,
  Pencil,
  Image as ImageIcon,
  Users,
  Trash2,
  FileText,
  Star,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import Badge from "@/src/components/ui/Badge";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import { Macro } from "@/src/data/macros";

export interface MacroCardProps {
  macro: Macro;
  onEdit?: (macro: Macro) => void;
  onDelete?: (macroId: string) => void;
  onToggleFavorite?: (macroId: string) => void;
}

const countryBadges: Record<string, { label: string; className: string }> = {
  argentina: {
    label: "ARCA",
    className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
  },
  chile: {
    label: "SII",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60",
  },
  colombia: {
    label: "DIAN",
    className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  },
  mexico: {
    label: "SAT",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  },
};

export default function MacroCard({
  macro,
  onEdit,
  onDelete,
  onToggleFavorite,
}: MacroCardProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isFacturacion = macro.category === "facturacion";

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(macro.text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error("Error al copiar texto:", err);
    }
  };

  const handleCopyImage = async () => {
    try {
      if (!macro.image?.url) return;

      let pngBlob: Blob | null = null;

      // Convert image to PNG blob via canvas so clipboard write never fails
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = macro.image!.url!;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          pngBlob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/png")
          );
        }
      } catch {
        // Fallback: fetch blob directly
        try {
          const res = await fetch(macro.image.url);
          const rawBlob = await res.blob();
          if (rawBlob.type === "image/png") {
            pngBlob = rawBlob;
          }
        } catch {
          // ignore
        }
      }

      if (pngBlob) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": pngBlob,
          }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      } else {
        // Fallback to text copy of image URL
        await navigator.clipboard.writeText(macro.image.url);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      }
    } catch (err) {
      console.error("Error al copiar imagen:", err);
      try {
        await navigator.clipboard.writeText(macro.image?.url || `[Imagen: ${macro.image?.name}]`);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      } catch (fallbackErr) {
        console.error("Error crítico al copiar imagen:", fallbackErr);
      }
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-[#151c28] rounded-2xl border border-[#e9e5de] dark:border-[#242f42] hover:border-[#dcd6cc] dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between p-5 group">
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={macro.category}>
                {macro.categoryLabel}
              </Badge>

              {macro.country && countryBadges[macro.country] && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${countryBadges[macro.country].className}`}
                  title={`País: ${macro.country.toUpperCase()}`}
                >
                  <span>{countryBadges[macro.country].label}</span>
                </span>
              )}

              {/* Error Code Pill for Facturacion */}
              {isFacturacion && macro.errorCode && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60">
                  {macro.errorCode}
                </span>
              )}

              {macro.shareStatus === "pending" && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
                  title="Enviada al Administrador para revisión"
                >
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-300 shrink-0" />
                  <span>En revisión</span>
                </span>
              )}

              {macro.shareStatus === "approved" && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60"
                  title="Aprobada y visible para todo el equipo"
                >
                  <Users className="w-3 h-3 text-purple-600 dark:text-purple-300 shrink-0" />
                  <span>Equipo</span>
                </span>
              )}
            </div>

            {/* Favorite Star Button */}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(macro.id);
                }}
                title={macro.isFavorite ? "Quitar de favoritas" : "Guardar como favorita"}
                aria-label={macro.isFavorite ? "Quitar de favoritas" : "Guardar como favorita"}
                className={`p-1.5 rounded-xl transition-all cursor-pointer active:scale-90 border ${macro.isFavorite
                  ? "bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60 shadow-2xs"
                  : "border-transparent text-slate-300 hover:text-amber-500 hover:bg-amber-50/60 hover:border-amber-200 dark:text-slate-600 dark:hover:text-amber-400 dark:hover:bg-amber-950/30"
                  }`}
              >
                <Star
                  className={`w-4 h-4 transition-transform ${macro.isFavorite
                    ? "fill-amber-400 text-amber-500 scale-105"
                    : "stroke-2"
                    }`}
                />
              </button>
            )}
          </div>

          {/* Card Title */}
          <h3
            className={`text-base font-bold text-[#172033] dark:text-white mb-2.5 group-hover:text-[#ff5722] transition-colors ${isFacturacion ? "font-extrabold tracking-tight" : ""
              }`}
          >
            {isFacturacion && macro.errorSnippet ? macro.errorSnippet : macro.title}
          </h3>

          {/* FACTURACIÓN SPECIFIC LAYOUT */}
          {isFacturacion ? (
            <div className="space-y-3 mb-4">
              {/* Suggested Client Response Container */}
              <div className="bg-[#FAF9F5] dark:bg-[#0f1520] rounded-xl border border-[#e9e5de] dark:border-[#242f42] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#ff5722] dark:text-orange-400">
                    <FileText className="w-3.5 h-3.5 text-[#ff5722]" />
                    <span>Respuesta para el cliente</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#697386] dark:text-slate-400 uppercase tracking-wider">
                    Soporte
                  </span>
                </div>
                <p className="text-xs text-[#172033] dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                  {macro.text}
                </p>
              </div>
            </div>
          ) : (
            /* REGULAR MACROS LAYOUT (Arqueos, Carta digital, Configuración) */
            <p className="text-xs text-[#697386] dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-line font-normal">
              {macro.text}
            </p>
          )}

          {/* Real Image Preview (ONLY when macro.image?.url exists) */}
          {macro.image?.url && (
            <div className="mb-4 rounded-xl border border-[#e9e5de] dark:border-[#242f42] bg-[#FAF9F5] dark:bg-[#0f1520] overflow-hidden">
              <div className="relative h-44 w-full bg-slate-900/5 dark:bg-black/30 border-b border-[#e9e5de] dark:border-[#242f42] flex items-center justify-center overflow-hidden group/img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={macro.image.url}
                  alt={macro.image.name || "Captura"}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="px-3.5 py-2.5 bg-white dark:bg-[#151c28] flex items-center justify-between text-[11px] text-[#697386] dark:text-slate-400">
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#ff5722] shrink-0" />
                  <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                    {macro.image.name}
                  </span>
                  {macro.image.size && (
                    <span className="text-slate-400 shrink-0">({macro.image.size})</span>
                  )}
                </div>

                {/* Copiar imagen button */}
                <button
                  type="button"
                  onClick={handleCopyImage}
                  className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer active:scale-95 shadow-2xs ${copiedImage
                    ? "bg-emerald-50 text-[#3CAD75] border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800"
                    : "bg-[#fff0e9] text-[#ff5722] border-[#ffd7c5] hover:bg-[#ffe6da] dark:bg-orange-500/15 dark:border-orange-500/30 dark:hover:bg-orange-500/25"
                    }`}
                  title="Copiar imagen para pegar directo en WhatsApp o chat"
                >
                  {copiedImage ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3CAD75] stroke-[2.5]" />
                      <span className="text-[#3CAD75] font-bold">¡Imagen copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 stroke-2" />
                      <span>Copiar imagen</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-[#f0ece5] dark:border-[#242f42] flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-[#697386] dark:text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Actualizado {macro.updatedAt}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => setShowDeleteConfirm(true)}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50/60 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-950/30"
                title="Eliminar macro"
              >
                Eliminar
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              icon={Pencil}
              onClick={() => onEdit && onEdit(macro)}
            >
              Editar
            </Button>

            <Button
              variant={copiedText ? "success" : "primary"}
              size="sm"
              icon={copiedText ? Check : Copy}
              onClick={handleCopyText}
              title="Copiar respuesta de texto"
            >
              {copiedText ? "¡Texto copiado!" : "Copiar texto"}
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete?.(macro.id);
        }}
        title="¿Eliminar macro?"
        description={`Estás por eliminar "${macro.title}". Esta acción quitará la macro de la biblioteca de soporte y no se puede deshacer.`}
        confirmText="Eliminar macro"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}
