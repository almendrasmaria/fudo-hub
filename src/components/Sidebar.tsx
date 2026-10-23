"use client";

import React from "react";
import {
  LayoutGrid,
  ArrowRightLeft,
  Printer,
  Cable,
  ReceiptText,
} from "lucide-react";
import { Category } from "@/src/data/macros";
import { printersData } from "@/src/data/impresoras";
import { teamList } from "@/src/data/derivaciones";
import { platforms } from "@/src/data/integraciones";
import { invoiceIssues } from "@/src/data/facturacion";

export interface SidebarProps {
  categories?: Category[];
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
  categoryCounts?: Record<string, number>;
  activeView?: "macros" | "integraciones" | "impresoras" | "derivaciones" | "facturacion";
  onSelectView?: (view: "macros" | "integraciones" | "impresoras" | "derivaciones" | "facturacion") => void;
}

export default function Sidebar({
  categoryCounts,
  activeView = "macros",
  onSelectView,
  onSelectCategory,
}: SidebarProps) {
  const totalMacros = categoryCounts?.["todas"] ?? 6;

  const handleMacrosClick = () => {
    if (onSelectView) onSelectView("macros");
    if (onSelectCategory) onSelectCategory("todas");
  };

  const handleIntegracionesClick = () => {
    if (onSelectView) onSelectView("integraciones");
  };

  const handleImpresorasClick = () => {
    if (onSelectView) onSelectView("impresoras");
  };

  const handleFacturacionClick = () => {
    if (onSelectView) onSelectView("facturacion");
  };

  const handleDerivacionesClick = () => {
    if (onSelectView) onSelectView("derivaciones");
  };

  return (
    <aside className="w-64 bg-white border-r border-[#e9e5de] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto p-5 z-30 transition-colors">
      <div>
        <div
          onClick={() => onSelectView && onSelectView("macros")}
          className="mb-8 px-1 cursor-pointer select-none"
        >
          <img
            src="/logo.png"
            alt="Fudo Macros"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* Section 1: Espacio de trabajo (Macros) */}
        <div className="mb-2 px-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#697386]">
            Espacio de trabajo
          </p>
        </div>

        <nav className="space-y-1 mb-6">
          <button
            type="button"
            onClick={handleMacrosClick}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
              activeView === "macros"
                ? "bg-[#fff0e9] text-[#ff5722] shadow-2xs font-bold"
                : "text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033]"
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid
                className={`w-4 h-4 ${
                  activeView === "macros" ? "text-[#ff5722]" : "text-[#697386]"
                }`}
              />
              <span>Macros</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeView === "macros"
                  ? "bg-[#ffd7c5] text-[#e94817]"
                  : "bg-[#FAF8F3] text-[#697386] border border-[#e9e5de]"
              }`}
            >
              {totalMacros}
            </span>
          </button>
        </nav>

        {/* Section 2: Herramientas y Guías (Non-macros) */}
        <div className="pt-4 border-t border-[#e9e5de]">
          <div className="mb-2 px-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#697386]">
              Herramientas y guías
            </p>
          </div>

          <nav className="space-y-1">
            {/* Integraciones Nav Item */}
            <button
              type="button"
              onClick={handleIntegracionesClick}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeView === "integraciones"
                  ? "bg-[#fff0e9] text-[#ff5722] shadow-2xs font-bold"
                  : "text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Cable
                  className={`w-4 h-4 ${
                    activeView === "integraciones" ? "text-[#ff5722]" : "text-[#697386]"
                  }`}
                />
                <span>Integraciones</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeView === "integraciones"
                    ? "bg-[#ffd7c5] text-[#e94817]"
                    : "bg-[#FAF8F3] text-[#697386] border border-[#e9e5de]"
                }`}
              >
                {platforms.length}
              </span>
            </button>

            {/* Impresoras Nav Item */}
            <button
              type="button"
              onClick={handleImpresorasClick}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeView === "impresoras"
                  ? "bg-[#fff0e9] text-[#ff5722] shadow-2xs font-bold"
                  : "text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Printer
                  className={`w-4 h-4 ${
                    activeView === "impresoras" ? "text-[#ff5722]" : "text-[#697386]"
                  }`}
                />
                <span>Impresoras</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeView === "impresoras"
                    ? "bg-[#ffd7c5] text-[#e94817]"
                    : "bg-[#FAF8F3] text-[#697386] border border-[#e9e5de]"
                }`}
              >
                {printersData.length}
              </span>
            </button>

            {/* Facturación Nav Item in Sidebar */}
            <button
              type="button"
              onClick={handleFacturacionClick}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeView === "facturacion"
                  ? "bg-[#fff0e9] text-[#ff5722] shadow-2xs font-bold"
                  : "text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033]"
              }`}
            >
              <div className="flex items-center gap-3">
                <ReceiptText
                  className={`w-4 h-4 ${
                    activeView === "facturacion" ? "text-[#ff5722]" : "text-[#697386]"
                  }`}
                />
                <span>Facturación</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeView === "facturacion"
                    ? "bg-[#ffd7c5] text-[#e94817]"
                    : "bg-[#FAF8F3] text-[#697386] border border-[#e9e5de]"
                }`}
              >
                {invoiceIssues.length}
              </span>
            </button>

            {/* Derivaciones Nav Item in Sidebar */}
            <button
              type="button"
              onClick={handleDerivacionesClick}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeView === "derivaciones"
                  ? "bg-[#fff0e9] text-[#ff5722] shadow-2xs font-bold"
                  : "text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033]"
              }`}
            >
              <div className="flex items-center gap-3">
                <ArrowRightLeft
                  className={`w-4 h-4 ${
                    activeView === "derivaciones" ? "text-[#ff5722]" : "text-[#697386]"
                  }`}
                />
                <span>Derivaciones</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeView === "derivaciones"
                    ? "bg-[#ffd7c5] text-[#e94817]"
                    : "bg-[#FAF8F3] text-[#697386] border border-[#e9e5de]"
                }`}
              >
                {teamList.length}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
