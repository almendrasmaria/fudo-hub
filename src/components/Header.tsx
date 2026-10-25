"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { Sun, Moon, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export interface HeaderProps {
  onNewMacro?: () => void;
  onOpenRecent?: () => void;
  activeView?: "macros" | "integraciones" | "impresoras" | "derivaciones" | "facturacion";
  onSelectView?: (view: "macros" | "integraciones" | "impresoras" | "derivaciones" | "facturacion") => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    media.removeEventListener("change", callback);
  };
}

function getThemeSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("fudo-theme");
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerThemeSnapshot(): boolean {
  return false;
}

export default function Header({
  activeView = "macros",
  onSelectView,
  isSidebarOpen = true,
  onToggleSidebar,
}: HeaderProps) {
  const isDark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fudo-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fudo-theme", "light");
    }
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <header className="h-16 shrink-0 px-4 sm:px-8 flex items-center justify-between border-b border-[#e9e5de] bg-white/80 backdrop-blur-md sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? "Cerrar barra lateral" : "Abrir barra lateral"}
            aria-label={isSidebarOpen ? "Cerrar barra lateral" : "Abrir barra lateral"}
            className={`h-9 px-2.5 rounded-xl border transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-1.5 ${
              !isSidebarOpen
                ? "bg-[#fff0e9] border-[#ffd7c5] text-[#ff5722] hover:bg-[#ffe6da] dark:bg-[#ff5722]/15 dark:border-[#ff5722]/30 dark:hover:bg-[#ff5722]/25 font-semibold text-xs shadow-2xs"
                : "border-[#e9e5de] bg-white text-[#697386] hover:text-[#172033] hover:bg-[#FAF8F3] dark:hover:bg-slate-800 shadow-2xs"
            }`}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftOpen className="w-4 h-4 text-[#ff5722]" />
                <span className="text-xs font-bold text-[#ff5722] hidden sm:inline">Menú</span>
              </>
            )}
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-medium text-[#697386]">
        <span
          onClick={() => onSelectView && onSelectView("macros")}
          className="hover:text-[#172033] cursor-pointer transition-colors"
        >
          Soporte
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#697386]/60" />
        <span
          onClick={() => onSelectView && onSelectView(activeView)}
          className="text-[#172033] font-bold cursor-pointer"
        >
          {activeView === "derivaciones"
            ? "Derivaciones"
            : activeView === "impresoras"
            ? "Compatibilidad de impresoras"
            : activeView === "integraciones"
            ? "Integraciones"
            : activeView === "facturacion"
            ? "Facturación electrónica"
            : "Macros"}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="w-10 h-10 rounded-xl border border-[#e9e5de] bg-white text-[#697386] hover:text-[#172033] hover:bg-[#FAF8F3] shadow-2xs transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-[#697386]" />
          )}
        </button>
      </div>
    </header>
  );
}
