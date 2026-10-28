"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { Sun, Moon, ChevronRight, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { User } from "@/src/lib/auth";

export interface HeaderProps {
  onNewMacro?: () => void;
  onOpenRecent?: () => void;
  activeView?: "macros" | "impresoras" | "derivaciones";
  onSelectView?: (view: "macros" | "impresoras" | "derivaciones") => void;
  currentUser?: User | null;
  onLogout?: () => void;
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
  currentUser,
  onLogout,
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
    <header className="h-16 shrink-0 px-4 sm:px-8 flex items-center justify-between border-b border-[#e9e5de] dark:border-[#242f42] bg-white/80 dark:bg-[#151c28]/80 backdrop-blur-md sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-2 text-xs font-medium text-[#697386] dark:text-slate-400">
        <span
          onClick={() => onSelectView && onSelectView("macros")}
          className="hover:text-[#172033] dark:hover:text-white cursor-pointer transition-colors"
        >
          Soporte
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#697386]/60 dark:text-slate-500" />
        <span
          onClick={() => onSelectView && onSelectView(activeView)}
          className="text-[#172033] dark:text-white font-bold cursor-pointer"
        >
          {activeView === "derivaciones"
            ? "Derivaciones"
            : activeView === "impresoras"
            ? "Compatibilidad de impresoras"
            : "Macros"}
        </span>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl bg-[#FAF8F3] dark:bg-[#0f141c] border border-[#e9e5de] dark:border-[#242f42]">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                currentUser.role === "admin"
                  ? "bg-orange-100 text-[#ff5722] dark:bg-orange-950/60 dark:text-orange-400"
                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
              }`}
            >
              {currentUser.role === "admin" ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#172033] dark:text-white leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-semibold text-[#697386] dark:text-slate-400 leading-tight">
                {currentUser.role === "admin" ? "Administrador" : "Agente"}
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#e9e5de] dark:border-[#242f42] bg-white dark:bg-[#151c28] text-[#697386] dark:text-slate-300 hover:text-[#172033] dark:hover:text-white hover:bg-[#FAF8F3] dark:hover:bg-[#1c2637] shadow-2xs transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#697386]" />
          )}
        </button>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border border-[#e9e5de] dark:border-[#242f42] bg-white dark:bg-[#151c28] text-[#697386] dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/40 shadow-2xs transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        )}
      </div>
    </header>
  );
}
