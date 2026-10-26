"use client";

import React, { useEffect, useRef } from "react";
import { Search, Plus, Star, User, Globe } from "lucide-react";
import FilterChip from "@/src/components/ui/FilterChip";
import Button from "@/src/components/ui/Button";
import { Category, macroCountryFilters } from "@/src/data/macros";

export interface SearchHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categoryCounts?: Record<string, number>;
  totalCount: number;
  filteredCount: number;
  onNewMacro?: () => void;
  selectedCountry?: string;
  onSelectCountry?: (countryId: string) => void;
  countryCounts?: Record<string, number>;
  isFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
  isMyMacrosOnly: boolean;
  onToggleMyMacrosOnly: () => void;
  myMacrosCount: number;
}

export default function SearchHero({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalCount,
  filteredCount,
  onNewMacro,
  selectedCountry = "todos",
  onSelectCountry,
  countryCounts,
  isFavoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount = 0,
  isMyMacrosOnly,
  onToggleMyMacrosOnly,
  myMacrosCount = 0,
}: SearchHeroProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="mb-8">
      {/* Header title & action */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="text-[#ff5722] text-xs font-bold uppercase tracking-wider mb-1.5">
            Biblioteca inteligente
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white tracking-tight">
            Respondé más rápido, ayudá mejor
          </h1>
        </div>

        {onNewMacro && (
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={onNewMacro}
            className="shadow-sm"
          >
            Nueva macro
          </Button>
        )}
      </div>

      {/* Smart search input */}
      <div className="relative mb-5 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-[#697386] group-focus-within:text-[#ff5722] transition-colors" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscador inteligente de macros..."
          className="w-full pl-12 pr-20 py-3.5 bg-white dark:bg-[#151c28] border border-[#e9e5de] dark:border-[#242f42] rounded-2xl text-[#172033] dark:text-slate-100 placeholder-[#697386]/70 dark:placeholder-slate-500 text-sm shadow-2xs focus:outline-hidden focus:border-[#ff5722] focus:ring-4 focus:ring-orange-500/10 transition-all font-medium"
        />
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
          <button
            type="button"
            onClick={() => searchInputRef.current?.focus()}
            className="px-2.5 py-1 bg-[#FAF8F3] dark:bg-[#1c2637] border border-[#e9e5de] dark:border-[#242f42] rounded-lg text-xs font-semibold text-[#697386] dark:text-slate-400 hover:bg-[#F3EFE6] dark:hover:bg-[#242f42] transition-colors shadow-2xs cursor-pointer select-none"
          >
            Ctrl K
          </button>
        </div>
      </div>

      {/* UNIFIED SINGLE ROW: Categories + Personal Toggles (Favoritas & Mis macros) */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Categories: Todas (once!), Arqueos, Facturación, etc. */}
          {categories.map((cat) => {
            const isAll = cat.id === "todas";
            const isActive = isAll
              ? selectedCategory === "todas" && !isFavoritesOnly && !isMyMacrosOnly
              : selectedCategory === cat.id;
            const count = categoryCounts ? categoryCounts[cat.id] : undefined;

            return (
              <FilterChip
                key={cat.id}
                active={isActive}
                onClick={() => onSelectCategory(cat.id)}
              >
                <span>{cat.name.replace("Todas las macros", "Todas")}</span>
                {!isAll && typeof count === "number" && (
                  <span className="text-[10px] opacity-75 ml-0.5">({count})</span>
                )}
              </FilterChip>
            );
          })}

          {/* Elegant Divider between Categories and Modifiers */}
          <div className="h-5 w-px bg-[#e9e5de] dark:bg-[#242f42] mx-1 self-center hidden sm:block" />

          {/* Favoritas Toggle Button using Lucide Star */}
          <button
            type="button"
            onClick={onToggleFavoritesOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isFavoritesOnly
                ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                : "bg-white text-slate-700 hover:text-amber-600 border-[#e9e5de] hover:border-amber-300 dark:bg-[#151c28] dark:border-[#242f42] dark:text-slate-300 dark:hover:text-amber-400"
            }`}
            title={isFavoritesOnly ? "Mostrar todas las macros" : "Filtrar solo favoritas"}
          >
            <Star
              className={`w-3.5 h-3.5 shrink-0 ${
                isFavoritesOnly
                  ? "fill-white text-white"
                  : favoritesCount > 0
                  ? "fill-amber-400 text-amber-500"
                  : "text-slate-400"
              }`}
            />
            <span>Favoritas</span>
            {favoritesCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isFavoritesOnly
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Mis macros Toggle Button using Lucide User */}
          <button
            type="button"
            onClick={onToggleMyMacrosOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isMyMacrosOnly
                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                : "bg-white text-slate-700 hover:text-purple-600 border-[#e9e5de] hover:border-purple-300 dark:bg-[#151c28] dark:border-[#242f42] dark:text-slate-300 dark:hover:text-purple-400"
            }`}
            title={isMyMacrosOnly ? "Mostrar todas las macros" : "Filtrar macros creadas por mí"}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>Mis macros</span>
            {myMacrosCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isMyMacrosOnly
                    ? "bg-white/20 text-white"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                }`}
              >
                {myMacrosCount}
              </span>
            )}
          </button>
        </div>

        {/* Counter */}
        <span className="text-xs text-[#697386] dark:text-slate-400 font-semibold">
          {filteredCount === totalCount
            ? `${totalCount} ${totalCount === 1 ? "macro" : "macros"}`
            : `${filteredCount} de ${totalCount} macros`}
        </span>
      </div>

      {/* Sub-filtro por País en Facturación (Using only Lucide Globe, no emoji fallbacks) */}
      {selectedCategory === "facturacion" && onSelectCountry && (
        <div className="mt-4 pt-3.5 border-t border-[#e9e5de]/70 dark:border-[#242f42] flex items-center gap-2 flex-wrap animate-in fade-in duration-150">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#697386] dark:text-slate-400 mr-1 flex items-center gap-1">
            <span>País:</span>
          </span>
          {macroCountryFilters.map((country) => {
            const isCountryActive = selectedCountry === country.id;
            const count = countryCounts ? countryCounts[country.id] : undefined;
            const label = country.id === "todos" ? "Todos los países" : country.label;

            return (
              <button
                key={country.id}
                type="button"
                onClick={() => onSelectCountry(country.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isCountryActive
                    ? "bg-[#ff5722] text-white border-[#ff5722] shadow-xs"
                    : "bg-white text-slate-700 hover:text-slate-900 border-[#e9e5de] hover:border-slate-300 dark:bg-[#151c28] dark:border-[#242f42] dark:text-slate-300 dark:hover:bg-[#1c2637]"
                }`}
              >
                {country.id === "todos" && (
                  <Globe className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
                )}
                <span>{label}</span>
                {country.entity && (
                  <span
                    className={`text-[10px] font-extrabold px-1 rounded ${
                      isCountryActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {country.entity}
                  </span>
                )}
                {typeof count === "number" && (
                  <span className="text-[10px] ml-0.5 opacity-80">
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
