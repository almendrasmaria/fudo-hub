"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = "macros",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "dots")[] = [];

    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("dots");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("dots");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("dots");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("dots");
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-[#e9e5de]">
      <p className="text-xs text-[#697386] font-medium">
        Mostrando <span className="font-bold text-[#172033]">{startItem}-{endItem}</span> de{" "}
        <span className="font-bold text-[#172033]">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-[#e9e5de] bg-white text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((page, idx) => {
          if (page === "dots") {
            return (
              <span
                key={`dots-${idx}`}
                className="w-6 text-center text-xs text-[#697386] select-none"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#ff5722] text-white shadow-xs shadow-orange-500/20"
                  : "border border-[#e9e5de] bg-white text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033]"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-[#e9e5de] bg-white text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
          title="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
