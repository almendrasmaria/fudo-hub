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
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import Badge from "@/src/components/ui/Badge";
import { Macro } from "@/src/data/macros";

export interface MacroCardProps {
  macro: Macro;
  onEdit?: (macro: Macro) => void;
  onDelete?: (macroId: string) => void;
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
}: MacroCardProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

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
      if (macro.image?.url) {
        const response = await fetch(macro.image.url);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
      } else {
        await navigator.clipboard.writeText(
          `[Imagen adjunta: ${macro.image?.name || "Captura"}]`
        );
      }
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    }
  };

  return (
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
        </div>

        {/* Card Title */}
        <h3
          className={`text-base font-bold text-[#172033] dark:text-white mb-2.5 group-hover:text-[#ff5722] transition-colors ${
            isFacturacion ? "font-extrabold tracking-tight" : ""
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

            <div className="px-3 py-2 bg-white dark:bg-[#151c28] flex items-center justify-between text-[11px] text-[#697386] dark:text-slate-400">
              <div className="flex items-center gap-1.5 truncate pr-2">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{macro.image.name}</span>
              </div>
              <button
                onClick={handleCopyImage}
                className="shrink-0 flex items-center gap-1 text-[#ff5722] hover:text-[#e94817] font-semibold text-[11px] transition-colors cursor-pointer"
              >
                {copiedImage ? (
                  <>
                    <Check className="w-3 h-3 text-[#3CAD75]" />
                    <span className="text-[#3CAD75]">Copiada</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
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
              onClick={() => {
                if (window.confirm(`¿Estás seguro de que deseás eliminar la macro "${macro.title}"?`)) {
                  onDelete(macro.id);
                }
              }}
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
          >
            {copiedText ? "¡Copiado!" : "Copiar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
