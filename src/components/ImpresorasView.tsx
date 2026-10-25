"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import {
  printersData,
} from "@/src/data/impresoras";
import Pagination from "@/src/components/ui/Pagination";

const ITEMS_PER_PAGE = 8;

export default function ImpresorasView() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  // Filter and rank printers
  const filteredPrinters = useMemo(() => {
    const normQuery = normalizeText(searchQuery);
    const queryTokens = normQuery.split(/\s+/).filter(Boolean);

    return printersData
      .filter((p) => {
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
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredPrinters.length / ITEMS_PER_PAGE);

  const paginatedPrinters = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPrinters.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPrinters, currentPage]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16 max-w-5xl mx-auto">
      {/* Simple, Clean Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[#ff5722] text-xs font-bold uppercase tracking-wider mb-1">
          <Printer className="w-3.5 h-3.5" />
          <span>Hardware & Fudo Print</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Impresoras compatibles
        </h1>
        <p className="text-xs sm:text-sm text-[#697386] mt-0.5">
          Escribí el modelo que tiene el cliente para saber al instante si es compatible, si imprime comandas y si soporta QR fiscal.
        </p>
      </div>

      {/* Prominent, Simple Search Box */}
      <div className="bg-white rounded-2xl border border-[#e9e5de] p-3 sm:p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-5 h-5 text-[#ff5722] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="printer-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Escribí la marca o modelo (ej: TM-T20, Hasar 250, XP-80, IT 1050, Bixolon...)"
            className="w-full pl-12 pr-10 py-3 bg-[#FAF8F3] border border-[#e9e5de] rounded-xl text-sm font-semibold text-[#172033] placeholder:text-[#697386] focus:outline-none focus:border-[#ff5722] focus:bg-white transition-all shadow-inner"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#697386] hover:text-[#172033] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results List - Clear, Scannable Row Cards */}
      <div className="space-y-3">
        {filteredPrinters.length > 0 ? (
          paginatedPrinters.map((printer) => {
            const isRecommended = printer.recommendedFudo === "si";
            const isNotRecommended = printer.recommendedFudo === "no";
            const hasWarning = printer.recommendedFudo === "advertencia";

            return (
              <div
                key={printer.id}
                className={`bg-white rounded-xl border p-4 shadow-2xs hover:border-[#dcd6cc] transition-all space-y-2.5 ${
                  isNotRecommended
                    ? "border-red-200/80 bg-red-50/15"
                    : hasWarning
                    ? "border-amber-200/80 bg-amber-50/10"
                    : "border-[#e9e5de]"
                }`}
              >
                {/* Header: Brand & Model (Left) + Status & Clean Copy Button (Right) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF8F3] text-[#172033] border border-[#e9e5de]">
                      {printer.brand}
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold text-[#172033]">
                      {printer.model}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Status badge */}
                    {isRecommended && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300 shrink-0" />
                        Recomendada
                      </span>
                    )}
                    {isNotRecommended && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200 text-xs font-bold shadow-2xs dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40">
                        <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-300 shrink-0" />
                        No recomendada
                      </span>
                    )}
                    {hasWarning && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold shadow-2xs dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300 shrink-0" />
                        Con advertencia
                      </span>
                    )}
                    {!isRecommended && !isNotRecommended && !hasWarning && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600/40">
                        En evaluación
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline Specs Pills - Lucide icons and technical labels */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* ESC/POS */}
                  <div
                    title="Compatibilidad con protocolo ESC/POS (Comandas térmicas)"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] border border-[#e9e5de]"
                  >
                    <Receipt className="w-3.5 h-3.5 text-[#697386]" />
                    <span className="text-[#697386] font-semibold">ESC/POS:</span>
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
                    title="Necesario para imprimir QR dinámico de MercadoPago y Factura Electrónica de ARG, BR y COL"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] border border-[#e9e5de]"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#697386]" />
                    <span className="text-[#697386] font-semibold">QR - Facturas ARG:</span>
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
                        ? "Advertencia"
                        : printer.qrArgentina === "no"
                        ? "No"
                        : "Sin datos"}
                    </span>
                  </div>

                  {/* PDF417 Chile */}
                  <div
                    title="Soporte para código bidimensional PDF417 de Boletas Electrónicas de Chile (SII)"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F3] border border-[#e9e5de]"
                  >
                    <Barcode className="w-3.5 h-3.5 text-[#697386]" />
                    <span className="text-[#697386] font-semibold">PDF417 Chile:</span>
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
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-[#e9e5de] rounded-2xl p-10 text-center shadow-2xs">
            <Printer className="w-10 h-10 text-[#697386]/50 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#172033] mb-1">
              No se encontró el modelo &quot;{searchQuery}&quot;
            </h3>
            <p className="text-xs text-[#697386] max-w-sm mx-auto mb-4">
              Revisá si el nombre está bien escrito o buscá directamente por la marca (ej: Epson, Hasar, X-Printer).
            </p>
            <button
              type="button"
              onClick={() => {
                handleSearchChange("");
              }}
              className="px-4 py-2 bg-[#ff5722] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#e94817] transition-all cursor-pointer"
            >
              Ver todas las impresoras
            </button>
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
    </div>
  );
}
