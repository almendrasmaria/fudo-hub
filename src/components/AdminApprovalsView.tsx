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
  XCircle,
  MessageSquareQuote,
  Eye,
  UserCheck,
  Layers,
  Printer,
  Receipt,
  QrCode,
  Barcode,
  ExternalLink,
  FileCheck2,
  AlertTriangle,
  Info,
} from "lucide-react";
import Image from "next/image";
import { Macro } from "@/src/data/macros";
import { PrinterModel } from "@/src/data/impresoras";
import ImageLightbox from "@/src/components/ui/ImageLightbox";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import PrinterModal from "@/src/components/PrinterModal";

interface AdminApprovalsViewProps {
  macros: Macro[];
  onApprove: (macro: Macro) => Promise<void> | void;
  onDiscard: (macro: Macro) => Promise<void> | void;
  onEdit: (macro: Macro) => void;
  onGoToMacros: () => void;
  // Printers support
  customPrinters?: PrinterModel[];
  onApprovePrinter?: (printer: PrinterModel) => Promise<void> | void;
  onDiscardPrinter?: (printer: PrinterModel) => Promise<void> | void;
  onSavePrinter?: (printer: PrinterModel, file?: File | null) => Promise<void> | void;
  onGoToPrinters?: () => void;
}

type ApprovalType = "macros" | "impresoras";
type FilterStatus = "pending" | "approved" | "all";

export default function AdminApprovalsView({
  macros,
  onApprove,
  onDiscard,
  onEdit,
  onGoToMacros,
  customPrinters = [],
  onApprovePrinter,
  onDiscardPrinter,
  onSavePrinter,
  onGoToPrinters,
}: AdminApprovalsViewProps) {
  const [activeTab, setActiveTab] = useState<ApprovalType>("macros");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedMacroId, setCopiedMacroId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string; title?: string } | null>(null);
  const [macroToDiscard, setMacroToDiscard] = useState<Macro | null>(null);
  const [printerToDiscard, setPrinterToDiscard] = useState<PrinterModel | null>(null);
  const [printerToEdit, setPrinterToEdit] = useState<PrinterModel | null>(null);
  const [activeWarningKey, setActiveWarningKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Counters for Macros
  const pendingMacroCount = useMemo(
    () => macros.filter((m) => m.shareStatus === "pending").length,
    [macros]
  );
  const approvedMacroCount = useMemo(
    () => macros.filter((m) => m.shareStatus === "approved").length,
    [macros]
  );

  // Counters for Printers
  const pendingPrinterCount = useMemo(
    () => customPrinters.filter((p) => p.status === "pending").length,
    [customPrinters]
  );
  const approvedPrinterCount = useMemo(
    () => customPrinters.filter((p) => p.status === "approved").length,
    [customPrinters]
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

  // Filtered printers
  const displayedPrinters = useMemo(() => {
    return customPrinters
      .filter((p) => {
        if (filterStatus === "pending") return p.status === "pending";
        if (filterStatus === "approved") return p.status === "approved";
        return true;
      })
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q))
        );
      });
  }, [customPrinters, filterStatus, searchQuery]);

  const handleCopyText = async (macro: Macro) => {
    try {
      await navigator.clipboard.writeText(macro.text);
      setCopiedMacroId(macro.id);
      setTimeout(() => setCopiedMacroId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleQuickApproveMacro = async (macro: Macro) => {
    setIsProcessing(true);
    try {
      await onApprove(macro);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDiscardMacro = async () => {
    if (!macroToDiscard) return;
    setIsProcessing(true);
    try {
      await onDiscard(macroToDiscard);
      setMacroToDiscard(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickApprovePrinter = async (printer: PrinterModel) => {
    if (!onApprovePrinter) return;
    setIsProcessing(true);
    try {
      await onApprovePrinter(printer);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDiscardPrinter = async () => {
    if (!printerToDiscard || !onDiscardPrinter) return;
    setIsProcessing(true);
    try {
      await onDiscardPrinter(printerToDiscard);
      setPrinterToDiscard(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Main Switcher: Macros vs Impresoras */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#151c28] border border-[#e8edf3] dark:border-[#242f42] rounded-2xl w-fit shadow-2xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab("macros");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "macros"
              ? "bg-[#ff5722] text-white shadow-xs"
              : "text-[#697386] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Macros</span>
          {pendingMacroCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeTab === "macros"
                  ? "bg-white/25 text-white"
                  : "bg-orange-100 text-[#ff5722]"
              }`}
            >
              {pendingMacroCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("impresoras");
            setSearchQuery("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "impresoras"
              ? "bg-[#ff5722] text-white shadow-xs"
              : "text-[#697386] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Impresoras</span>
          {pendingPrinterCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeTab === "impresoras"
                  ? "bg-white/25 text-white"
                  : "bg-orange-100 text-[#ff5722]"
              }`}
            >
              {pendingPrinterCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "macros" ? (
        /* ==================== MACROS APPROVAL VIEW ==================== */
        <>
          {/* Executive Hero Banner for Macros */}
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
                <button
                  type="button"
                  onClick={() => setFilterStatus("pending")}
                  className="px-6 py-4 rounded-2xl transition-all text-left min-w-[125px] cursor-pointer bg-[#fff7ed] dark:bg-orange-950/40 hover:opacity-90 active:scale-[0.98]"
                >
                  <span className="block text-[11px] font-bold text-[#ca3800] dark:text-orange-400 uppercase tracking-wider mb-1">
                    POR REVISAR
                  </span>
                  <span className="block text-3xl sm:text-4xl font-extrabold text-[#ca3800] dark:text-orange-400 leading-none">
                    {pendingMacroCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterStatus("approved")}
                  className="px-6 py-4 rounded-2xl transition-all text-left min-w-[125px] cursor-pointer bg-[#ecfdf5] dark:bg-emerald-950/40 hover:opacity-90 active:scale-[0.98]"
                >
                  <span className="block text-[11px] font-bold text-[#007a55] dark:text-emerald-400 uppercase tracking-wider mb-1">
                    APROBADAS
                  </span>
                  <span className="block text-3xl sm:text-4xl font-extrabold text-[#007a55] dark:text-emerald-400 leading-none">
                    {approvedMacroCount}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Control Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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
                  {pendingMacroCount}
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
                  {approvedMacroCount}
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
              </button>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#697386] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, contenido o código..."
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#151c28] border border-[#e8e4dc] dark:border-[#242f42] rounded-xl text-xs font-semibold text-[#172033] dark:text-white placeholder:text-[#697386] focus:outline-none focus:border-[#ff5722]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#697386] hover:text-[#172033] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Macros List */}
          {displayedMacros.length > 0 ? (
            <div className="space-y-4">
              {displayedMacros.map((macro) => {
                const isPending = macro.shareStatus === "pending";
                return (
                  <div
                    key={macro.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#151c28] border border-[#e8edf3] dark:border-[#242f42] shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {macro.categoryLabel}
                        </span>
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#c2410c] dark:text-orange-400 text-xs font-bold border border-orange-200">
                            <Clock className="w-3 h-3" />
                            <span>Pendiente de aprobación</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aprobada</span>
                          </span>
                        )}
                        <h3 className="text-base font-bold text-[#172033] dark:text-white">
                          {macro.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleCopyText(macro)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#172033] dark:text-white transition cursor-pointer flex items-center gap-1.5"
                        >
                          {copiedMacroId === macro.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#697386]" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#faf8f3] dark:bg-[#192233]/60 border border-[#e8e4dc] dark:border-[#2d3b52] text-xs text-[#172033] dark:text-slate-200 whitespace-pre-line leading-relaxed">
                      {macro.text}
                    </div>

                    {/* Image if attached */}
                    {macro.image && macro.image.url && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setLightboxImage({
                              src: macro.image!.url!,
                              alt: macro.image!.name,
                              title: macro.title,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#c2410c] text-xs font-bold border border-orange-200 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver captura adjunta ({macro.image.name})</span>
                        </button>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-[#f0ece5] dark:border-[#242f42] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-[#697386] dark:text-slate-400">
                        {isPending
                          ? "Esperando tu decisión antes de hacerla visible para los demás agentes."
                          : "Publicada en la biblioteca general del equipo."}
                      </span>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => setMacroToDiscard(macro)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Descartar macro</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onEdit(macro)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#172033] dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition cursor-pointer flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar macro</span>
                        </button>

                        {isPending && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleQuickApproveMacro(macro)}
                            className="px-4 py-1.5 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
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
            <div className="p-12 text-center bg-white dark:bg-[#151c28] border border-[#e8edf3] dark:border-[#242f42] rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0f172a] dark:text-white">
                ¡Bandeja al día! Sin solicitudes pendientes
              </h3>
              <p className="text-xs text-[#62748e] dark:text-slate-400 max-w-sm mx-auto">
                No tenés macros pendientes de revisión en este momento. Cuando un agente comparta una nueva macro, aparecerá aquí.
              </p>
              <button
                type="button"
                onClick={onGoToMacros}
                className="mt-2 px-4 py-2 bg-[#ff5722] text-white text-xs font-bold rounded-xl hover:bg-[#e94817] transition cursor-pointer inline-flex items-center gap-2"
              >
                <span>Ver biblioteca general de macros</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      ) : (
        /* ==================== IMPRESORAS APPROVAL VIEW ==================== */
        <>
          {/* Executive Hero Banner for Impresoras */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#151c28] border border-[#e8edf3] dark:border-[#242f42] p-6 sm:p-8">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                {/* Status Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff7ed] dark:bg-orange-950/40 text-[#c2410c] dark:text-orange-400 text-xs font-semibold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Control de calidad &middot; Administrador</span>
                </div>

                <h1 className="text-2xl sm:text-[32px] font-bold text-[#0f172a] dark:text-white tracking-tight leading-tight">
                  Aprobaciones de impresoras
                </h1>
                <p className="text-sm sm:text-[15px] text-[#62748e] dark:text-slate-400 mt-2 leading-relaxed">
                  Supervisa los modelos propuestos por los operadores. Valida el self-test, compatibilidad con ESC/POS, QR y link de compra antes de agregarlas al catálogo general.
                </p>
              </div>

              {/* Metric Counters */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setFilterStatus("pending")}
                  className="px-6 py-4 rounded-2xl transition-all text-left min-w-[125px] cursor-pointer bg-[#fff7ed] dark:bg-orange-950/40 hover:opacity-90 active:scale-[0.98]"
                >
                  <span className="block text-[11px] font-bold text-[#ca3800] dark:text-orange-400 uppercase tracking-wider mb-1">
                    POR REVISAR
                  </span>
                  <span className="block text-3xl sm:text-4xl font-extrabold text-[#ca3800] dark:text-orange-400 leading-none">
                    {pendingPrinterCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterStatus("approved")}
                  className="px-6 py-4 rounded-2xl transition-all text-left min-w-[125px] cursor-pointer bg-[#ecfdf5] dark:bg-emerald-950/40 hover:opacity-90 active:scale-[0.98]"
                >
                  <span className="block text-[11px] font-bold text-[#007a55] dark:text-emerald-400 uppercase tracking-wider mb-1">
                    APROBADAS
                  </span>
                  <span className="block text-3xl sm:text-4xl font-extrabold text-[#007a55] dark:text-emerald-400 leading-none">
                    {approvedPrinterCount}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Control Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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
                  {pendingPrinterCount}
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
                  {approvedPrinterCount}
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
              </button>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#697386] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por marca, modelo o notas..."
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#151c28] border border-[#e8e4dc] dark:border-[#242f42] rounded-xl text-xs font-semibold text-[#172033] dark:text-white placeholder:text-[#697386] focus:outline-none focus:border-[#ff5722]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#697386] hover:text-[#172033] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Printers List */}
          {displayedPrinters.length > 0 ? (
            <div className="space-y-4">
              {displayedPrinters.map((printer) => {
                const isPending = printer.status === "pending";
                const isRecommended = printer.recommendedFudo === "si";
                const isNotRecommended = printer.recommendedFudo === "no";
                const hasWarning = printer.recommendedFudo === "advertencia";

                return (
                  <div
                    key={printer.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#151c28] border border-[#e8edf3] dark:border-[#242f42] shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF8F3] dark:bg-[#1a2333] text-[#172033] dark:text-slate-200 border border-[#e9e5de] dark:border-[#2d3b52]">
                          {printer.brand}
                        </span>
                        <h3 className="text-base font-extrabold text-[#172033] dark:text-white">
                          {printer.model}
                        </h3>

                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#c2410c] dark:text-orange-400 text-xs font-bold border border-orange-200">
                            <Clock className="w-3 h-3" />
                            <span>Pendiente de aprobación</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aprobada</span>
                          </span>
                        )}

                        {printer.submittedBy && (
                          <span className="text-xs text-[#697386] dark:text-slate-400">
                            &middot; Enviada por {printer.submittedBy.name}
                          </span>
                        )}
                      </div>

                      {/* Status badge with hover tooltip */}
                      <div
                        className="relative"
                        onMouseEnter={() =>
                          printer.notes && setActiveWarningKey(`${printer.id}-status`)
                        }
                        onMouseLeave={() => setActiveWarningKey(null)}
                      >
                        {isRecommended && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs ${
                              printer.notes ? "cursor-help ring-1 ring-emerald-300" : ""
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Recomendada</span>
                            {printer.notes && <Info className="w-3 h-3 opacity-80" />}
                          </span>
                        )}
                        {isNotRecommended && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200 text-xs font-bold shadow-2xs ${
                              printer.notes ? "cursor-help ring-1 ring-red-300" : ""
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span>No recomendada</span>
                            {printer.notes && <Info className="w-3 h-3 opacity-80" />}
                          </span>
                        )}
                        {hasWarning && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold shadow-2xs ${
                              printer.notes ? "cursor-help ring-1 ring-amber-300" : ""
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Con advertencia</span>
                            {printer.notes && <Info className="w-3 h-3 opacity-80" />}
                          </span>
                        )}

                        {activeWarningKey === `${printer.id}-status` && printer.notes && (
                          <div className="absolute right-0 top-full mt-2 z-50 w-80 p-3.5 rounded-2xl bg-white border-2 border-slate-300 shadow-2xl backdrop-blur-md">
                            <p className="text-[11px] font-bold uppercase text-slate-800 mb-1">
                              Observaciones técnicas
                            </p>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {printer.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Specs & Evidence Buttons */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* ESC/POS */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] dark:bg-[#1a2333] border border-[#e9e5de] dark:border-[#2d3b52]">
                        <Receipt className="w-3.5 h-3.5 text-[#697386]" />
                        <span className="text-[#697386] font-semibold">ESC/POS:</span>
                        <span className="font-bold text-emerald-700">
                          {printer.escPos === "si" ? "Sí" : printer.escPos === "no" ? "No" : "Advertencia"}
                        </span>
                      </div>

                      {/* QR */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] dark:bg-[#1a2333] border border-[#e9e5de] dark:border-[#2d3b52]">
                        <QrCode className="w-3.5 h-3.5 text-[#697386]" />
                        <span className="text-[#697386] font-semibold">QR ARG:</span>
                        <span className="font-bold text-emerald-700">
                          {printer.qrArgentina === "si" ? "Sí" : printer.qrArgentina === "no" ? "No" : "Advertencia"}
                        </span>
                      </div>

                      {/* PDF417 */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] dark:bg-[#1a2333] border border-[#e9e5de] dark:border-[#2d3b52]">
                        <Barcode className="w-3.5 h-3.5 text-[#697386]" />
                        <span className="text-[#697386] font-semibold">PDF417 Chile:</span>
                        <span className="font-bold text-emerald-700">
                          {printer.pdf417Chile === "si" ? "Sí" : printer.pdf417Chile === "no" ? "No" : "Sin datos"}
                        </span>
                      </div>

                      {/* Self-Test Badge / Lightbox */}
                      {printer.selfTestImageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setLightboxImage({
                              src: printer.selfTestImageUrl!,
                              alt: `Self-test ${printer.brand} ${printer.model}`,
                              title: `Self-test: ${printer.brand} ${printer.model}`,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#c2410c] font-bold border border-orange-200 transition cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-[#ff5722]" />
                          <span>Ver Self-test adjunto</span>
                        </button>
                      )}

                      {/* Purchase Link */}
                      {printer.purchaseUrl && (
                        <a
                          href={printer.purchaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Link de compra</span>
                        </a>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-[#f0ece5] dark:border-[#242f42] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-[#697386] dark:text-slate-400">
                        {isPending
                          ? "Esperando tu validación antes de hacerla pública en el catálogo general."
                          : "Publicada en el catálogo general de impresoras."}
                      </span>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => setPrinterToDiscard(printer)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Descartar impresora</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => setPrinterToEdit(printer)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#172033] dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition cursor-pointer flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar impresora</span>
                        </button>

                        {isPending && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleQuickApprovePrinter(printer)}
                            className="px-4 py-1.5 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
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
            <div className="p-12 text-center bg-white dark:bg-[#151c28] border border-[#e8edf3] dark:border-[#242f42] rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0f172a] dark:text-white">
                ¡Bandeja al día! Sin solicitudes pendientes de impresoras
              </h3>
              <p className="text-xs text-[#62748e] dark:text-slate-400 max-w-sm mx-auto">
                No tenés propuestas de impresoras esperando revisión. Cuando un agente proponga un modelo, aparecerá aquí para que revises su self-test y lo apruebes.
              </p>
              {onGoToPrinters && (
                <button
                  type="button"
                  onClick={onGoToPrinters}
                  className="mt-2 px-4 py-2 bg-[#ff5722] text-white text-xs font-bold rounded-xl hover:bg-[#e94817] transition cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Ver catálogo de impresoras</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Confirm Discard Modal for Macro */}
      {macroToDiscard && (
        <ConfirmModal
          isOpen={true}
          title="¿Descartar solicitud de macro?"
          description={`¿Estás seguro de descartar "${macroToDiscard.title}"? Esta acción removerá la propuesta del sistema.`}
          confirmText="Descartar"
          cancelText="Cancelar"
          variant="danger"
          onConfirm={handleConfirmDiscardMacro}
          onClose={() => setMacroToDiscard(null)}
        />
      )}

      {/* Confirm Discard Modal for Printer */}
      {printerToDiscard && (
        <ConfirmModal
          isOpen={true}
          title="¿Descartar propuesta de impresora?"
          description={`¿Estás seguro de descartar la impresora "${printerToDiscard.brand} ${printerToDiscard.model}"? No estará disponible en el catálogo.`}
          confirmText="Descartar"
          cancelText="Cancelar"
          variant="danger"
          onConfirm={handleConfirmDiscardPrinter}
          onClose={() => setPrinterToDiscard(null)}
        />
      )}

      {/* Printer Modal for editing in approvals */}
      {printerToEdit && onSavePrinter && (
        <PrinterModal
          isOpen={true}
          onClose={() => setPrinterToEdit(null)}
          onSave={async (updatedPrinter, file) => {
            await onSavePrinter(updatedPrinter, file);
            setPrinterToEdit(null);
          }}
          currentUserRole="admin"
          currentUserName="Administrador Fudo"
          initialData={printerToEdit}
        />
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <ImageLightbox
          isOpen={true}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage.src}
          imageName={lightboxImage.alt}
          macroTitle={lightboxImage.title}
        />
      )}
    </div>
  );
}
