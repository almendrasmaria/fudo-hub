"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, ChevronRight } from "lucide-react";

export interface HeaderProps {
  onNewMacro?: () => void;
  onOpenRecent?: () => void;
  activeView?: "macros" | "integraciones" | "impresoras" | "derivaciones" | "facturacion";
  onSelectView?: (view: "macros" | "integraciones" | "impresoras" | "derivaciones" | "facturacion") => void;
}

export default function Header({
  activeView = "macros",
  onSelectView,
}: HeaderProps) {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const isDarkStored =
      localStorage.getItem("fudo-theme") === "dark" ||
      (!localStorage.getItem("fudo-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDarkStored) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fudo-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fudo-theme", "light");
    }
  };

  return (
    <header className="h-16 shrink-0 px-8 flex items-center justify-between border-b border-[#e9e5de] bg-white/80 backdrop-blur-md sticky top-0 z-20 transition-colors">
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
