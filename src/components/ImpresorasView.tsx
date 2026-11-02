"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Printer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Receipt,
  QrCode,
  Barcode,
  Plus,
  ExternalLink,
  FileCheck2,
  Clock,
  Trash2,
  ShieldCheck,
  Check,
  Info,
} from "lucide-react";
import {
  printersData,
  PrinterModel,
} from "@/src/data/impresoras";
import {
  getCustomPrinters,
  savePrinterModel,
  approvePrinterModel,
  deletePrinterModel,
  mergePrinters,
} from "@/src/lib/impresorasService";
import { User } from "@/src/lib/auth";
import { ToastType } from "@/src/components/ui/Toast";
import Pagination from "@/src/components/ui/Pagination";
import PrinterModal from "@/src/components/PrinterModal";
import ImageLightbox from "@/src/components/ui/ImageLightbox";

const ITEMS_PER_PAGE = 8;

interface ImpresorasViewProps {
  currentUser?: User | null;
  onShowToast?: (type: ToastType, title: string, message?: string) => void;
  onCustomPrintersChange?: () => void;
}

export default function ImpresorasView({
  currentUser,
  onShowToast,
  onCustomPrintersChange,
}: ImpresorasViewProps) {
  const [customPrinters, setCustomPrinters] = useState<PrinterModel[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeWarningKey, setActiveWarningKey] = useState<string | null>(null);

  // Modal & Lightbox state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterModel | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string; title?: string } | null>(null);

  const isAdmin = currentUser?.role === "admin";

  // Load custom printers on client mount
  useEffect(() => {
    setCustomPrinters(getCustomPrinters());
  }, []);

  const normalizeText = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const element = document.getElementById("printer-search-input");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Combine static and custom printers
  const allPrinters = useMemo(() => {
    return mergePrinters(customPrinters);
  }, [customPrinters]);

  // Pending count
  const pendingCount = useMemo(() => {
    return customPrinters.filter((p) => p.status === "pending").length;
  }, [customPrinters]);

  // Filter and rank printers
  const filteredPrinters = useMemo(() => {
    const normQuery = normalizeText(searchQuery);
    const queryTokens = normQuery.split(/\s+/).filter(Boolean);

    return allPrinters
      .filter((p) => {
        // Status filter
        if (statusFilter === "pending") {
          return p.status === "pending";
        }
        if (statusFilter === "approved") {
          return p.status !== "pending";
        }

        // If not admin and viewing all, hide pending unless submitted by current user
        if (!isAdmin && p.status === "pending" && p.submittedBy?.name !== currentUser?.name) {
          return false;
        }

        // Search tokens
        if (queryTokens.length > 0) {
          const searchable = normalizeText(
            `${p.brand} ${p.model} ${p.notes || ""}`
          );
          const matchesAll = queryTokens.every((token) => searchable.includes(token));
          if (!matchesAll) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Pending first if in general view
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;

        if (!normQuery) {
          if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
          return a.model.localeCompare(b.model);
        }

        // Rank by search relevance: matches in Model/Brand first
        const normModelA = normalizeText(`${a.brand} ${a.model}`);
        const normModelB = normalizeText(`${b.brand} ${b.model}`);

        const scoreA =
          (normModelA === normQuery ? 3000 : 0) +
          (normModelA.startsWith(normQuery) ? 1500 : 0) +
          (normModelA.includes(normQuery) ? 800 : 0);
        const scoreB =
          (normModelB === normQuery ? 3000 : 0) +
          (normModelB.startsWith(normQuery) ? 1500 : 0) +
          (normModelB.includes(normQuery) ? 800 : 0);

        return scoreB - scoreA;
      });
  }, [allPrinters, searchQuery, statusFilter, isAdmin, currentUser]);

  const totalPages = Math.ceil(filteredPrinters.length / ITEMS_PER_PAGE);

  const paginatedPrinters = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPrinters.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPrinters, currentPage]);

  // Handlers for Save, Approve and Delete
  const handleSavePrinter = async (printer: PrinterModel, file?: File | null) => {
    const saved = await savePrinterModel(printer, file);
    setCustomPrinters(getCustomPrinters());
    if (onCustomPrintersChange) onCustomPrintersChange();
    setCurrentPage(1);

    if (onShowToast) {
      if (saved.status === "approved") {
        onShowToast(
          "success",
          "Impresora guardada y publicada",
          `"${saved.brand} ${saved.model}" se agregó a la lista de compatibles.`
        );
      } else {
        onShowToast(
          "info",
          "Impresora enviada a revisión",
          `"${saved.brand} ${saved.model}" pasará por control de calidad antes de publicarse.`
        );
      }
    }
  };

  const handleApprovePrinter = (printer: PrinterModel) => {
    approvePrinterModel(printer.id);
    setCustomPrinters(getCustomPrinters());
    if (onCustomPrintersChange) onCustomPrintersChange();
    if (onShowToast) {
      onShowToast(
        "success",
        "Impresora aprobada y publicada",
        `"${printer.brand} ${printer.model}" ahora es visible para todo el equipo.`
      );
    }
  };

  const handleDeletePrinter = (printer: PrinterModel) => {
    deletePrinterModel(printer.id);
    setCustomPrinters(getCustomPrinters());
    if (onCustomPrintersChange) onCustomPrintersChange();
    if (onShowToast) {
      onShowToast("success", "Impresora removida", `"${printer.brand} ${printer.model}" fue eliminada.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16 max-w-5xl mx-auto">
      {/* Header with Title and "Agregar impresora" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#ff5722] text-xs font-bold uppercase tracking-wider mb-1">
            <Printer className="w-3.5 h-3.5" />
            <span>Hardware & Fudo Print</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white tracking-tight">
            Impresoras compatibles
          </h1>
          <p className="text-xs sm:text-sm text-[#697386] dark:text-slate-400 mt-0.5">
            Escribí el modelo que tiene el cliente para saber al instante si es compatible, si imprime comandas y si soporta QR fiscal.
          </p>
        </div>

        {/* Action Button: Agregar impresora */}
        <button
          type="button"
          onClick={() => {
            setEditingPrinter(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] hover:bg-[#e94817] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Agregar impresora</span>
        </button>
      </div>

      {/* Admin Review Banner if pending printers exist */}
      {isAdmin && pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff5722] text-white flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold text-orange-900 dark:text-orange-200">
                {pendingCount} {pendingCount === 1 ? "impresora pendiente" : "impresoras pendientes"} de revisión
              </span>
              <span className="block text-[11px] text-orange-700 dark:text-orange-400">
                Propuestas por el equipo esperando tu aprobación para validarse.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setStatusFilter(statusFilter === "pending" ? "all" : "pending");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-[#ff5722] text-white shadow-xs"
                  : "bg-white dark:bg-[#151c28] text-[#ff5722] border border-orange-200 dark:border-orange-900/50 hover:bg-orange-100"
              }`}
            >
              {statusFilter === "pending" ? "Ver todas" : "Revisar pendientes"}
            </button>
          </div>
        </div>
      )}

      {/* Prominent Search Box & Filter Tabs */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-[#151c28] rounded-2xl border border-[#e9e5de] dark:border-[#242f42] p-3 sm:p-4 shadow-2xs">
          <div className="relative">
            <Search className="w-5 h-5 text-[#ff5722] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="printer-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Escribí la marca o modelo (ej: TM-T20, Hasar 250, XP-80, IT 1050, Bixolon...)"
              className="w-full pl-12 pr-10 py-3 bg-[#FAF8F3] dark:bg-[#1a2333] border border-[#e9e5de] dark:border-[#2d3b52] rounded-xl text-sm font-semibold text-[#172033] dark:text-white placeholder:text-[#697386] focus:outline-none focus:border-[#ff5722] focus:bg-white dark:focus:bg-[#151c28] transition-all shadow-inner"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#697386] hover:text-[#172033] dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results List - Clear, Scannable Row Cards */}
      <div className="space-y-3">
        {filteredPrinters.length > 0 ? (
          paginatedPrinters.map((printer) => {
            const isRecommended = printer.recommendedFudo === "si";
            const isNotRecommended = printer.recommendedFudo === "no";
            const hasWarning = printer.recommendedFudo === "advertencia";
            const isPending = printer.status === "pending";
            const isCustom = customPrinters.some((c) => c.id === printer.id);

            return (
              <div
                key={printer.id}
                className={`bg-white dark:bg-[#151c28] rounded-2xl border p-4 sm:p-5 shadow-2xs hover:border-[#dcd6cc] dark:hover:border-[#35435a] transition-all space-y-3 ${
                  isPending
                    ? "border-orange-300 dark:border-orange-900/60 bg-orange-50/15"
                    : isNotRecommended
                    ? "border-red-200/80 dark:border-red-900/50 bg-red-50/15"
                    : hasWarning
                    ? "border-amber-200/80 dark:border-amber-900/50 bg-amber-50/10"
                    : "border-[#e9e5de] dark:border-[#242f42]"
                }`}
              >
                {/* Header: Brand & Model (Left) + Status & Actions (Right) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF8F3] dark:bg-[#1a2333] text-[#172033] dark:text-slate-200 border border-[#e9e5de] dark:border-[#2d3b52]">
                      {printer.brand}
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold text-[#172033] dark:text-white">
                      {printer.model}
                    </h2>

                    {/* Pending Pill */}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#c2410c] dark:text-orange-400 text-[11px] font-bold border border-orange-200 dark:border-orange-900/60">
                        <Clock className="w-3 h-3 stroke-[2.5]" />
                        <span>Pendiente de aprobación</span>
                      </span>
                    )}

                    {/* Submitter info */}
                    {printer.submittedBy && (
                      <span className="text-[11px] text-[#697386] dark:text-slate-400">
                        &middot; Agregada por {printer.submittedBy.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    {/* Status badge with hover tooltip when printer.notes exists */}
                    <div
                      className="relative"
                      onMouseEnter={() =>
                        printer.notes && setActiveWarningKey(`${printer.id}-status`)
                      }
                      onMouseLeave={() => setActiveWarningKey(null)}
                    >
                      {isRecommended && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 select-none ${
                            printer.notes
                              ? "cursor-help hover:bg-emerald-100 dark:hover:bg-emerald-500/30 ring-1 ring-emerald-300"
                              : ""
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300 shrink-0" />
                          <span>Recomendada</span>
                          {printer.notes && (
                            <Info className="w-3 h-3 text-emerald-700 dark:text-emerald-300 opacity-80" />
                          )}
                        </span>
                      )}

                      {isNotRecommended && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200 text-xs font-bold shadow-2xs dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40 select-none ${
                            printer.notes
                              ? "cursor-help hover:bg-red-100 dark:hover:bg-red-500/30 ring-1 ring-red-300"
                              : ""
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-300 shrink-0" />
                          <span>No recomendada</span>
                          {printer.notes && (
                            <Info className="w-3 h-3 text-red-700 dark:text-red-300 opacity-80" />
                          )}
                        </span>
                      )}

                      {hasWarning && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold shadow-2xs dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 select-none ${
                            printer.notes
                              ? "cursor-help hover:bg-amber-100 dark:hover:bg-amber-500/30 ring-1 ring-amber-300"
                              : ""
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300 shrink-0" />
                          <span>Con advertencia</span>
                          {printer.notes && (
                            <Info className="w-3 h-3 text-amber-700 dark:text-amber-300 opacity-80" />
                          )}
                        </span>
                      )}

                      {!isRecommended && !isNotRecommended && !hasWarning && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600/40 select-none ${
                            printer.notes ? "cursor-help hover:bg-gray-100 ring-1 ring-slate-300" : ""
                          }`}
                        >
                          <span>En evaluación</span>
                          {printer.notes && (
                            <Info className="w-3 h-3 text-gray-500 opacity-80" />
                          )}
                        </span>
                      )}

                      {/* Tooltip Popover on Hover */}
                      {activeWarningKey === `${printer.id}-status` && printer.notes && (
                        <div
                          className={`absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 p-3.5 rounded-2xl bg-white dark:bg-[#151c28] border-2 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 pointer-events-none ${
                            isRecommended
                              ? "border-emerald-400 dark:border-emerald-500/70"
                              : isNotRecommended
                              ? "border-rose-400 dark:border-rose-500/70"
                              : "border-amber-400 dark:border-amber-500/70"
                          }`}
                        >
                          <div
                            className={`absolute right-6 -top-2 w-3.5 h-3.5 bg-white dark:bg-[#151c28] border-t-2 border-l-2 rotate-45 ${
                              isRecommended
                                ? "border-emerald-400 dark:border-emerald-500/70"
                                : isNotRecommended
                                ? "border-rose-400 dark:border-rose-500/70"
                                : "border-amber-400 dark:border-amber-500/70"
                            }`}
                          />
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                                isRecommended
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                                  : isNotRecommended
                                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300"
                                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300"
                              }`}
                            >
                              {isRecommended ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : isNotRecommended ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <AlertTriangle className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-[11px] font-black uppercase tracking-wider mb-1 ${
                                  isRecommended
                                    ? "text-emerald-800 dark:text-emerald-300"
                                    : isNotRecommended
                                    ? "text-rose-800 dark:text-rose-300"
                                    : "text-amber-800 dark:text-amber-300"
                                }`}
                              >
                                {isRecommended
                                  ? "Observaciones técnicas (Recomendada)"
                                  : isNotRecommended
                                  ? "Motivo de no compatibilidad"
                                  : "Advertencia de compatibilidad"}
                              </p>
                              <p className="text-xs text-[#172033] dark:text-slate-100 font-medium leading-relaxed">
                                {printer.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Admin Actions for Pending Printers */}
                    {isPending && isAdmin && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          type="button"
                          onClick={() => handleApprovePrinter(printer)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                          title="Aprobar y publicar para todo el equipo"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Aprobar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePrinter(printer)}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 transition cursor-pointer"
                          title="Descartar solicitud"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Delete button for custom printer (if admin or creator) */}
                    {isCustom && !isPending && isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeletePrinter(printer)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Eliminar impresora personalizada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Specs Pills & Links */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* ESC/POS */}
                  <div
                    title="Compatibilidad con protocolo ESC/POS (Comandas térmicas)"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] dark:bg-[#1a2333] border border-[#e9e5de] dark:border-[#2d3b52]"
                  >
                    <Receipt className="w-3.5 h-3.5 text-[#697386]" />
                    <span className="text-[#697386] dark:text-slate-400 font-semibold">ESC/POS:</span>
                    <span
                      className={`font-bold ${
                        printer.escPos === "si"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : printer.escPos === "advertencia"
                          ? "text-amber-800 dark:text-amber-300"
                          : printer.escPos === "no"
                          ? "text-red-700 dark:text-red-300"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {printer.escPos === "si"
                        ? "Sí"
                        : printer.escPos === "advertencia"
                        ? "Advertencia"
                        : printer.escPos === "no"
                        ? "No"
                        : "-"}
                    </span>
                  </div>

                  {/* QR - Facturas ARG */}
                  <div
                    className="relative"
                    onMouseEnter={() =>
                      printer.qrArgentina === "advertencia" &&
                      printer.notes &&
                      setActiveWarningKey(`${printer.id}-qr`)
                    }
                    onMouseLeave={() => setActiveWarningKey(null)}
                  >
                    <div
                      title={
                        printer.qrArgentina === "advertencia" && printer.notes
                          ? undefined
                          : "Necesario para imprimir QR dinámico de MercadoPago y Factura Electrónica de ARG, BR y COL"
                      }
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] dark:bg-[#1a2333] border transition-all ${
                        printer.qrArgentina === "advertencia"
                          ? "border-amber-300 dark:border-amber-700 hover:bg-amber-50/70 cursor-help"
                          : "border-[#e9e5de] dark:border-[#2d3b52]"
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#697386]" />
                      <span className="text-[#697386] dark:text-slate-400 font-semibold">QR - Facturas ARG:</span>
                      <span
                        className={`font-bold ${
                          printer.qrArgentina === "si"
                            ? "text-emerald-700 dark:text-emerald-300"
                            : printer.qrArgentina === "advertencia"
                            ? "text-amber-800 dark:text-amber-300"
                            : printer.qrArgentina === "no"
                            ? "text-red-700 dark:text-red-300"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {printer.qrArgentina === "si"
                          ? "Sí"
                          : printer.qrArgentina === "advertencia"
                          ? "Sí, advertencia!"
                          : printer.qrArgentina === "no"
                          ? "No"
                          : "Sin datos"}
                      </span>
                    </div>

                    {activeWarningKey === `${printer.id}-qr` && printer.notes && (
                      <div className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-96 p-3.5 rounded-2xl bg-white dark:bg-[#151c28] border-2 border-amber-400 dark:border-amber-500/70 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                        <div className="absolute left-6 -top-2 w-3.5 h-3.5 bg-white dark:bg-[#151c28] border-t-2 border-l-2 border-amber-400 dark:border-amber-500/70 rotate-45" />
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-700/60 mt-0.5">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                              Advertencia QR (ARCA / MercadoPago)
                            </p>
                            <p className="text-xs text-[#172033] dark:text-slate-100 font-medium leading-relaxed">
                              {printer.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PDF417 Chile */}
                  <div
                    title="Soporte para código bidimensional PDF417 de Boletas Electrónicas de Chile (SII)"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] dark:bg-[#1a2333] border border-[#e9e5de] dark:border-[#2d3b52]"
                  >
                    <Barcode className="w-3.5 h-3.5 text-[#697386]" />
                    <span className="text-[#697386] dark:text-slate-400 font-semibold">PDF417 Chile:</span>
                    <span
                      className={`font-bold ${
                        printer.pdf417Chile === "si"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : printer.pdf417Chile === "advertencia"
                          ? "text-amber-800 dark:text-amber-300"
                          : printer.pdf417Chile === "no"
                          ? "text-red-700 dark:text-red-300"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {printer.pdf417Chile === "si"
                        ? "Sí"
                        : printer.pdf417Chile === "advertencia"
                        ? "Advertencia"
                        : printer.pdf417Chile === "no"
                        ? "No"
                        : "Sin datos"}
                    </span>
                  </div>

                  {/* Self-Test Badge / Button */}
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
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/50 text-[#c2410c] dark:text-orange-400 font-bold transition cursor-pointer"
                      title="Ver foto del ticket de self-test impreso"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-[#ff5722]" />
                      <span>Ver Self-test</span>
                    </button>
                  )}

                  {/* Purchase Link Badge / Button */}
                  {printer.purchaseUrl && (
                    <a
                      href={printer.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 font-bold transition cursor-pointer"
                      title="Abrir enlace de compra en nueva pestaña"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Link de compra</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-[#151c28] border border-[#e9e5de] dark:border-[#242f42] rounded-2xl p-10 text-center shadow-2xs">
            <Printer className="w-10 h-10 text-[#697386]/50 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#172033] dark:text-white mb-1">
              No se encontró el modelo &quot;{searchQuery}&quot;
            </h3>
            <p className="text-xs text-[#697386] dark:text-slate-400 max-w-sm mx-auto mb-4">
              Revisá si el nombre está bien escrito o agregá este nuevo modelo a la lista con el botón superior.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleSearchChange("");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[#172033] dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Ver todas las impresoras
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingPrinter(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-[#ff5722] hover:bg-[#e94817] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Agregar impresora</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredPrinters.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
        itemLabel="modelos"
      />

      {/* Printer Modal */}
      <PrinterModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrinter(null);
        }}
        onSave={handleSavePrinter}
        currentUserRole={currentUser?.role || "agente"}
        currentUserName={currentUser?.name || "Operador"}
        initialData={editingPrinter}
      />

      {/* Lightbox for Self-test ticket image */}
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
