"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, User as UserIcon, AlertCircle, Sun, Moon } from "lucide-react";
import { DEMO_ACCOUNTS, authenticateUser, User } from "@/src/lib/auth";

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDemoKey, setSelectedDemoKey] = useState<"agente" | "admin" | null>(null);

  // Theme support in Login screen
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("fudo-theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fudo-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fudo-theme", "light");
    }
  };

  const handleSelectDemo = (key: "agente" | "admin", autoSubmit = false) => {
    const demo = DEMO_ACCOUNTS[key];
    setEmail(demo.user.email);
    setPassword(demo.password);
    setSelectedDemoKey(key);
    setError(null);

    if (autoSubmit) {
      onLoginSuccess(demo.user);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }

    const res = authenticateUser(email, password);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || "Credenciales incorrectas.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-[#FAF8F3] dark:bg-[#0f141c] text-[#172033] dark:text-slate-100 transition-colors relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-400/10 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-10">
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Modo claro" : "Modo oscuro"}
          aria-label={isDark ? "Modo claro" : "Modo oscuro"}
          className="w-10 h-10 rounded-xl border border-[#e9e5de] dark:border-[#242f42] bg-white dark:bg-[#151c28] text-[#697386] dark:text-slate-300 hover:text-[#172033] dark:hover:text-white shadow-2xs transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-[#697386]" />}
        </button>
      </div>

      <div className="w-full max-w-[420px] mx-auto z-10 flex flex-col items-center">
        {/* Card */}
        <div className="w-full bg-white dark:bg-[#151c28] border border-[#e9e5de] dark:border-[#242f42] rounded-3xl p-7 sm:p-8 shadow-xl shadow-neutral-900/5 dark:shadow-black/20">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo.png"
              alt="Fudo Macros"
              width={190}
              height={58}
              priority
              className="h-12 sm:h-13 w-auto object-contain select-none"
            />
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-[#172033] dark:text-slate-200 mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#697386] dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedDemoKey(null);
                  }}
                  placeholder="ej: agente@fudo.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-[#FAF8F3] dark:bg-[#0f141c] border border-[#e9e5de] dark:border-[#242f42] rounded-xl text-[#172033] dark:text-slate-100 placeholder-[#697386]/60 dark:placeholder-slate-500 focus:outline-none focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-[#172033] dark:text-slate-200"
                >
                  Contraseña
                </label>
                <span className="text-[11px] text-[#697386] dark:text-slate-400">
                  (Demo: 123 o admin)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#697386] dark:text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSelectedDemoKey(null);
                  }}
                  placeholder="Ingresá tu contraseña"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-medium bg-[#FAF8F3] dark:bg-[#0f141c] border border-[#e9e5de] dark:border-[#242f42] rounded-xl text-[#172033] dark:text-slate-100 placeholder-[#697386]/60 dark:placeholder-slate-500 focus:outline-none focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#697386] dark:text-slate-400 hover:text-[#172033] dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#ff5722] hover:bg-[#e94817] shadow-md shadow-orange-500/25 active:scale-98 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>Iniciar sesión</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="mt-7 pt-6 border-t border-[#e9e5de] dark:border-[#242f42]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#697386] dark:text-slate-400 mb-3 text-center">
              Usuarios de prueba (Roles)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Agente card */}
              <button
                type="button"
                onClick={() => handleSelectDemo("agente", false)}
                className={`p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  selectedDemoKey === "agente" || email === DEMO_ACCOUNTS.agente.user.email
                    ? "border-[#ff5722] bg-[#fff0e9] dark:bg-[#ff5722]/10 ring-1 ring-[#ff5722]"
                    : "border-[#e9e5de] dark:border-[#242f42] bg-[#FAF8F3]/60 dark:bg-[#0f141c]/60 hover:bg-[#FAF8F3] dark:hover:bg-[#1a2332]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#172033] dark:text-slate-200 truncate">
                    Agente
                  </span>
                </div>
                <span className="text-[10px] text-[#697386] dark:text-slate-400 truncate">
                  agente@fudo.com
                </span>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                  Clave: 123
                </span>
              </button>

              {/* Admin card */}
              <button
                type="button"
                onClick={() => handleSelectDemo("admin", false)}
                className={`p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  selectedDemoKey === "admin" || email === DEMO_ACCOUNTS.admin.user.email
                    ? "border-[#ff5722] bg-[#fff0e9] dark:bg-[#ff5722]/10 ring-1 ring-[#ff5722]"
                    : "border-[#e9e5de] dark:border-[#242f42] bg-[#FAF8F3]/60 dark:bg-[#0f141c]/60 hover:bg-[#FAF8F3] dark:hover:bg-[#1a2332]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#ff5722] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#172033] dark:text-slate-200 truncate">
                    Administrador
                  </span>
                </div>
                <span className="text-[10px] text-[#697386] dark:text-slate-400 truncate">
                  admin@fudo.com
                </span>
                <span className="text-[10px] font-medium text-[#ff5722] mt-1">
                  Clave: admin
                </span>
              </button>
            </div>

            <div className="mt-3 text-center">
              <span className="text-[11px] text-[#697386] dark:text-slate-400">
                Tip: Haz clic en cualquiera para autocompletar e ingresar.
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-xs text-[#697386] dark:text-slate-500 text-center">
          Fudo Hub &copy; {new Date().getFullYear()} &middot; Soporte al cliente
        </p>
      </div>
    </div>
  );
}
