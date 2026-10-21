"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Star,
  Clock,
  Pencil,
  Image as ImageIcon,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import Badge from "@/src/components/ui/Badge";
import { Macro } from "@/src/data/macros";

export interface MacroCardProps {
  macro: Macro;
  onToggleFavorite?: (macroId: string) => void;
  onEdit?: (macro: Macro) => void;
}

export default function MacroCard({
  macro,
  onToggleFavorite,
  onEdit,
}: MacroCardProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

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
    } catch (err) {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e9e5de] hover:border-[#dcd6cc] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between p-5 group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge variant={macro.category}>
            {macro.categoryLabel}
          </Badge>

          <button
            onClick={() => onToggleFavorite && onToggleFavorite(macro.id)}
            className="p-1 rounded-lg text-slate-300 hover:text-[#F5A524] transition-colors cursor-pointer"
            title={macro.isFavorite ? "Quitar de favoritos" : "Guardar como favorito"}
          >
            <Star
              className={`w-4 h-4 transition-transform active:scale-125 ${
                macro.isFavorite
                  ? "fill-[#F5A524] text-[#F5A524]"
                  : "text-slate-300 hover:text-[#F5A524]"
              }`}
            />
          </button>
        </div>

        <h3 className="text-base font-bold text-[#172033] mb-2 group-hover:text-[#ff5722] transition-colors line-clamp-2">
          {macro.title}
        </h3>

        <p className="text-xs text-[#697386] leading-relaxed mb-4 whitespace-pre-line font-normal">
          {macro.text}
        </p>

        {macro.image && (
          <div className="mb-4 rounded-xl border border-[#e9e5de] bg-[#FAF9F5] overflow-hidden">
            <div className="p-3 bg-gradient-to-b from-[#F3EFE6] to-[#FAF8F3] border-b border-[#e9e5de] flex items-center gap-3">
              <div className="w-12 h-14 bg-[#172033] rounded-lg p-1.5 flex flex-col justify-between shrink-0 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-xs bg-[#ff5722]" />
                <div className="space-y-1">
                  <div className="w-7 h-0.5 bg-slate-600 rounded-full" />
                  <div className="w-5 h-0.5 bg-slate-600 rounded-full" />
                  <div className="w-6 h-0.5 bg-slate-600 rounded-full" />
                </div>
              </div>

              <div className="flex-1 space-y-2 py-0.5">
                <div className="flex items-center justify-between">
                  <div className="w-24 h-1.5 bg-[#172033]/80 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-[#FFD052]" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="h-4 rounded border border-[#ff5722]/40 bg-white shadow-2xs flex items-center px-1">
                    <div className="w-10 h-0.5 bg-[#ff5722] rounded-full" />
                  </div>
                  <div className="h-4 rounded border border-[#e9e5de] bg-white shadow-2xs" />
                </div>
                <div className="h-3 rounded border border-[#e9e5de] bg-white" />
              </div>
            </div>

            <div className="px-3 py-2 bg-white flex items-center justify-between text-[11px] text-[#697386]">
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

      <div className="pt-3 border-t border-[#f0ece5] flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-[#697386]">
          <Clock className="w-3 h-3" />
          <span>Actualizado {macro.updatedAt}</span>
        </div>

        <div className="flex items-center gap-2">
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
