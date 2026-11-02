"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  Trash2,
  Pencil,
  Search,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Filter,
  X,
  MessageSquareQuote,
  Eye,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { Macro } from "@/src/data/macros";
import ImageLightbox from "@/src/components/ui/ImageLightbox";
import ConfirmModal from "@/src/components/ui/ConfirmModal";

interface AdminApprovalsViewProps {
  macros: Macro[];
  onApprove: (macro: Macro) => Promise<void> | void;
  onDiscard: (macro: Macro) => Promise<void> | void;
  onEdit: (macro: Macro) => void;
  onGoToMacros: () => void;
}

type FilterStatus = "pending" | "approved" | "all";

export default function AdminApprovalsView({
  macros,
  onApprove,
  onDiscard,
  onEdit,
  onGoToMacros,
}: AdminApprovalsViewProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedMacroId, setCopiedMacroId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [macroToDiscard, setMacroToDiscard] = useState<Macro | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Counters
  const pendingCount = useMemo(
    () => macros.filter((m) => m.shareStatus === "pending").length,
    [macros]
  );
  const approvedCount = useMemo(
    () => macros.filter((m) => m.shareStatus === "approved").length,
    [macros]
  );
  const allSharedCount = useMemo(
    () => macros.filter((m) => m.shareStatus === "pending" || m.shareStatus === "approved").length,
    [macros]
  );

  // Filtered macros
  const displayedMacros = useMemo(() => {
    return macros
      .filter((m) => {
        if (filterStatus === "pending") return m.shareStatus === "pending";
        if (filterStatus === "approved") return m.shareStatus === "approved";
        return m.shareStatus === "pending" || m.shareStatus === "approved";
      })
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.text.toLowerCase().includes(q) ||
          (m.errorCode && m.errorCode.toLowerCase().includes(q)) ||
          (m.categoryLabel && m.categoryLabel.toLowerCase().includes(q))
        );
      });
  }, [macros, filterStatus, searchQuery]);

  const handleCopyText = async (macro: Macro) => {
    try {
      await navigator.clipboard.writeText(macro.text);
      setCopiedMacroId(macro.id);
      setTimeout(() => setCopiedMacroId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleQuickApprove = async (macro: Macro) => {
    setIsProcessing(true);
    try {
      await onApprove(macro);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDiscard = async () => {
    if (!macroToDiscard) return;
    setIsProcessing(true);
    try {
      await onDiscard(macroToDiscard);
      setMacroToDiscard(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#151c28] border border-[#e8edf3] dark:border-[#242f42] p-6 sm:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff7ed] dark:bg-orange-950/40 text-[#c2410c] dark:text-orange-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Control de calidad &middot; Administrador</span>
            </div>

            <h1 className="text-2xl sm:text-[32px] font-bold text-[#0f172a] dark:text-white tracking-tight leading-tight">
              Aprobaciones de macros
            </h1>
            <p className="text-sm sm:text-[15px] text-[#62748e] dark:text-slate-400 mt-2 leading-relaxed">
              Supervisa las macros propuestas por los agentes. Puedes editarlas para perfeccionar el contenido, aprobarlas para que todo el equipo las use o descartarlas si son incorrectas.
            </p>
          </div>

          {/* Metric Counters */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Pending count card */}
            <button
              type="button"
              onClick={() => setFilterStatus("pending")}
              className="px-6 py-4 rounded-2xl transition-all text-left min-w-[125px] cursor-pointer bg-[#fff7ed] dark:bg-orange-950/40 hover:opacity-90 active:scale-[0.98]"
            >
              <span className="block text-[11px] font-bold text-[#ca3800] dark:text-orange-400 uppercase tracking-wider mb-1">
                POR REVISAR
              </span>
              <span className="block text-3xl sm:text-4xl font-extrabold text-[#ca3800] dark:text-orange-400 leading-none">
                {pendingCount}
              </span>
            </button>

            {/* Approved count card */}
            <button
              type="button"
              onClick={() => setFilterStatus("approved")}
              className="px-6 py-4 rounded-2xl transition-all text-left min-w-[125px] cursor-pointer bg-[#ecfdf5] dark:bg-emerald-950/40 hover:opacity-90 active:scale-[0.98]"
            >
              <span className="block text-[11px] font-bold text-[#007a55] dark:text-emerald-400 uppercase tracking-wider mb-1">
                APROBADAS
              </span>
              <span className="block text-3xl sm:text-4xl font-extrabold text-[#007a55] dark:text-emerald-400 leading-none">
                {approvedCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Segmented Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Modern Segmented Control */}
        <div className="flex items-center p-1.5 bg-white dark:bg-[#151c28] border border-[#e8e4dc] dark:border-[#242f42] rounded-2xl shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterStatus("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              filterStatus === "pending"
                ? "bg-[#ff5722] text-white shadow-sm"
                : "text-[#697386] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pendientes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                filterStatus === "pending"
                  ? "bg-white/25 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("approved")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              filterStatus === "approved"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-[#697386] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aprobadas</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                filterStatus === "approved"
                  ? "bg-white/25 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {approvedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              filterStatus === "all"
                ? "bg-[#172033] dark:bg-slate-700 text-white shadow-sm"
                : "text-[#697386] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Todas</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                filterStatus === "all"
                  ? "bg-white/25 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {allSharedCount}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#697386] dark:text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, código o contenido..."
            className="w-full pl-10 pr-9 py-2.5 text-xs font-medium bg-white dark:bg-[#151c28] border border-[#e8e4dc] dark:border-[#242f42] rounded-2xl text-[#172033] dark:text-slate-100 placeholder-[#697386]/60 dark:placeholder-slate-500 focus:outline-none focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/15 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#697386] hover:text-[#172033] dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cards Stream */}
      {displayedMacros.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {displayedMacros.map((macro) => {
            const isPending = macro.shareStatus === "pending";
            const isApproved = macro.shareStatus === "approved";

            return (
              <div
                key={macro.id}
                className="group relative bg-white dark:bg-[#151c28] border border-[#e8e4dc] dark:border-[#242f42] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200"
              >
                {/* Card Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category pill */}
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#FAF8F3] dark:bg-[#0f141c] text-[#697386] dark:text-slate-300 border border-[#e8e4dc] dark:border-[#242f42]">
                      {macro.categoryLabel || macro.category.toUpperCase()}
                    </span>

                    {/* Error code badge */}
                    {macro.errorCode && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{macro.errorCode}</span>
                      </span>
                    )}

                    {/* Status Badge */}
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#fff0e9] text-[#ff5722] dark:bg-orange-950/40 dark:text-orange-400 border border-[#ffd7c5] dark:border-orange-900/50">
                        <Clock className="w-3 h-3 text-[#ff5722] dark:text-orange-400" />
                        <span>Pendiente de aprobación</span>
                      </span>
                    ) : isApproved ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Activa en el equipo</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Author / Origin metadata */}
                  <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#697386] dark:text-slate-400 bg-[#faf8f3] dark:bg-[#111722] px-3 py-1 rounded-full border border-[#ede9e1] dark:border-[#1e2838]">
                    <UserCheck className="w-3.5 h-3.5 text-[#ff5722]" />
                    <span>Enviada por Agente de Soporte</span>
                    <span>&middot;</span>
                    <span>{macro.updatedAt || "Reciente"}</span>
                  </div>
                </div>

                {/* Macro Title */}
                <h2 className="text-lg sm:text-xl font-black text-[#172033] dark:text-white mb-4 tracking-tight">
                  {macro.title}
                </h2>

                {/* Customer Response Preview Bubble */}
                <div className="relative mb-5 rounded-2xl bg-[#FAF8F3] dark:bg-[#111722] border border-[#e8e4dc] dark:border-[#222c3c] p-4 sm:p-5 shadow-2xs">
                  {/* Top Bar inside bubble */}
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#e8e4dc]/70 dark:border-[#222c3c]/80">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#ff5722]/10 dark:bg-[#ff5722]/20 flex items-center justify-center text-[#ff5722]">
                        <MessageSquareQuote className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#172033] dark:text-slate-200">
                        Mensaje predefinido para el cliente
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyText(macro)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a2333] border border-[#e8e4dc] dark:border-[#2c394e] text-[11px] font-bold text-[#697386] dark:text-slate-200 hover:text-[#ff5722] hover:border-orange-200 transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      {copiedMacroId === macro.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar respuesta</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Body Text */}
                  <p className="text-xs sm:text-[13px] text-[#172033] dark:text-slate-200 whitespace-pre-line leading-relaxed font-normal">
                    {macro.text}
                  </p>

                  {/* Attached Image Thumbnail */}
                  {macro.image?.url && (
                    <div className="mt-4 pt-3 border-t border-[#e8e4dc]/80 dark:border-[#222c3c]/90">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#697386] dark:text-slate-400 mb-2">
                        Captura visual complementaria:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxImage({
                            src: macro.image!.url!,
                            alt: macro.image!.name || macro.title,
                          })
                        }
                        className="group relative inline-flex items-center gap-3 p-2 rounded-2xl border border-[#e8e4dc] dark:border-[#2a364a] bg-white dark:bg-[#161e2b] hover:border-[#ff5722] hover:shadow-xs transition-all cursor-pointer"
                      >
                        <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-[#e8e4dc] dark:border-[#2a364a]">
                          <Image
                            src={macro.image.url}
                            alt={macro.image.name || macro.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="text-left pr-3">
                          <span className="block text-xs font-bold text-[#172033] dark:text-slate-200 group-hover:text-[#ff5722] truncate max-w-[220px]">
                            {macro.image.name || "Ver imagen adjunta"}
                          </span>
                          <span className="text-[10px] text-[#697386] dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Eye className="w-3 h-3" />
                            <span>Clic para ampliar</span>
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Admin Action Bar */}
                <div className="pt-4 border-t border-[#f0ece5] dark:border-[#222c3c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Context notice */}
                  <div className="text-xs text-[#697386] dark:text-slate-400 flex items-center gap-2">
                    {isPending ? (
                      <>
                        <Clock className="w-4 h-4 text-[#ff5722] shrink-0" />
                        <span>Esperando tu decisión antes de hacerla visible para los demás agentes.</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Publicada en la biblioteca compartida para todos los agentes.</span>
                      </>
                    )}
                  </div>

                  {/* Actions Group */}
                  <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                    {/* Discard button */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setMacroToDiscard(macro)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-2xs"
                      title="Eliminar del sistema para evitar su uso incorrecto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Descartar macro</span>
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onEdit(macro)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#172033] dark:text-slate-200 bg-[#FAF8F3] hover:bg-[#ede9df] dark:bg-[#1a2333] dark:hover:bg-[#222e42] border border-[#e8e4dc] dark:border-[#2d3b52] transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar macro</span>
                    </button>

                    {/* Primary Approve button (only if pending) */}
                    {isPending && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleQuickApprove(macro)}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aprobar y publicar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-[#151c28] border border-[#e8e4dc] dark:border-[#242f42] rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800/40 shadow-xs">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h3 className="text-lg font-black text-[#172033] dark:text-white mb-2">
            {filterStatus === "pending"
              ? "¡Bandeja al día! Sin solicitudes pendientes"
              : "No se encontraron macros con este filtro"}
          </h3>

          <p className="text-xs sm:text-sm text-[#697386] dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            {filterStatus === "pending"
              ? "No tenés macros pendientes de revisión en este momento. Cuando un agente comparta una nueva macro, aparecerá aquí para que la puedas aprobar o ajustar."
              : "Probá cambiando el filtro o la búsqueda para ver otras macros registradas."}
          </p>

          <button
            type="button"
            onClick={onGoToMacros}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#ff5722] hover:bg-[#e94817] shadow-sm shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>Ver biblioteca general de macros</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal for Discarding Macro */}
      <ConfirmModal
        isOpen={Boolean(macroToDiscard)}
        onClose={() => setMacroToDiscard(null)}
        onConfirm={handleConfirmDiscard}
        title="¿Descartar y eliminar esta macro?"
        description={`"${macroToDiscard?.title || "Esta macro"}" será eliminada definitivamente del sistema para evitar que los agentes continúen utilizándola con datos incorrectos.`}
        confirmText="Sí, descartar y eliminar"
        cancelText="Volver atrás"
        variant="danger"
        icon={Trash2}
        isLoading={isProcessing}
      />

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          isOpen={Boolean(lightboxImage)}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage.src}
          imageName={lightboxImage.alt}
        />
      )}
    </div>
  );
}
