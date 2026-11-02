"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  UploadCloud,
  ExternalLink,
  FileCheck2,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CompatibilityStatus, PrinterModel } from "@/src/data/impresoras";
import { UserRole } from "@/src/lib/auth";

interface PrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (printer: PrinterModel, selfTestFile?: File | null) => Promise<void> | void;
  currentUserRole?: UserRole;
  currentUserName?: string;
  initialData?: PrinterModel | null;
}

const COMMON_BRANDS = [
  "Epson",
  "Hasar",
  "3NSTAR",
  "XPrinter",
  "Bixolon",
  "Sam4s",
  "Bematech",
  "Zebra",
  "Citizen",
  "POS-D",
  "Sunmi",
  "SAT",
];

export default function PrinterModal({
  isOpen,
  onClose,
  onSave,
  currentUserRole = "admin",
  currentUserName = "Operador",
  initialData = null,
}: PrinterModalProps) {
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [model, setModel] = useState(initialData?.model || "");
  const [recommendedFudo, setRecommendedFudo] = useState<CompatibilityStatus>(
    initialData?.recommendedFudo || "si"
  );
  const [escPos, setEscPos] = useState<CompatibilityStatus>(
    initialData?.escPos || "si"
  );
  const [qrArgentina, setQrArgentina] = useState<CompatibilityStatus>(
    initialData?.qrArgentina || "si"
  );
  const [pdf417Chile, setPdf417Chile] = useState<CompatibilityStatus>(
    initialData?.pdf417Chile || "no_especificado"
  );
  const [hasSelfTest, setHasSelfTest] = useState<boolean>(
    initialData?.hasSelfTest || Boolean(initialData?.selfTestImageUrl)
  );
  const [selfTestFile, setSelfTestFile] = useState<File | null>(null);
  const [selfTestPreview, setSelfTestPreview] = useState<string | null>(
    initialData?.selfTestImageUrl || null
  );
  const [purchaseUrl, setPurchaseUrl] = useState(initialData?.purchaseUrl || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo del self test debe ser una imagen (PNG, JPG, JPEG, WEBP)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("La imagen no debe superar los 8 MB");
      return;
    }

    setError("");
    setSelfTestFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSelfTestPreview(objectUrl);
  };

  const handleRemoveFile = () => {
    setSelfTestFile(null);
    setSelfTestPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) {
      setError("Por favor indicá la marca de la impresora");
      return;
    }
    if (!model.trim()) {
      setError("Por favor indicá el modelo de la impresora");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const isApproved =
        currentUserRole === "admin" || initialData?.status === "approved";

      const printerToSave: PrinterModel = {
        id: initialData?.id || `printer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        brand: brand.trim().toUpperCase(),
        model: model.trim(),
        escPos,
        qrArgentina,
        pdf417Chile,
        recommendedFudo,
        notes: notes.trim() || undefined,
        hasSelfTest,
        selfTestImageUrl: selfTestPreview || undefined,
        selfTestImageName: selfTestFile?.name || initialData?.selfTestImageName,
        purchaseUrl: purchaseUrl.trim() || undefined,
        status: isApproved ? "approved" : "pending",
        submittedBy: {
          name: currentUserName,
          role: currentUserRole,
          date: new Date().toLocaleDateString("es-AR"),
        },
        createdAt: initialData?.createdAt || new Date().toISOString(),
      };

      await onSave(printerToSave, selfTestFile);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocurrió un error al guardar la impresora";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#151c28] border border-[#e8e4dc] dark:border-[#242f42] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#f0ece5] dark:border-[#242f42] flex items-center justify-between gap-4 shrink-0 bg-white dark:bg-[#151c28]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#ff5722] dark:text-orange-400 flex items-center justify-center border border-orange-200/80 dark:border-orange-900/50 shrink-0">
              <Printer className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#172033] dark:text-white leading-tight">
                {initialData ? "Editar impresora" : "Agregar impresora compatible"}
              </h2>
              <p className="text-xs text-[#697386] dark:text-slate-400 mt-0.5">
                Cargá los datos técnicos y reconfirmá compatibilidad con Fudo Print.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-[#697386] hover:text-[#172033] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Marca y Modelo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ej: Epson, Hasar, 3NSTAR"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e4dc] dark:border-[#2d3b52] bg-[#FAF8F3] dark:bg-[#1a2333] text-sm font-semibold text-[#172033] dark:text-white placeholder:text-[#697386] focus:outline-none focus:border-[#ff5722] focus:bg-white dark:focus:bg-[#151c28]"
              />
              {/* Quick Brand suggestions */}
              <div className="flex flex-wrap gap-1 mt-2">
                {COMMON_BRANDS.slice(0, 7).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrand(b)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-100 hover:text-[#ff5722] transition-colors cursor-pointer"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Modelo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ej: TM-T20III, XP-80C"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e4dc] dark:border-[#2d3b52] bg-[#FAF8F3] dark:bg-[#1a2333] text-sm font-semibold text-[#172033] dark:text-white placeholder:text-[#697386] focus:outline-none focus:border-[#ff5722] focus:bg-white dark:focus:bg-[#151c28]"
              />
            </div>
          </div>

          {/* Selectores de Compatibilidad Técnica */}
          <div className="space-y-3 pt-2 border-t border-[#f0ece5] dark:border-[#242f42]">
            <span className="block text-xs font-black text-[#172033] dark:text-slate-200 uppercase tracking-wider">
              Compatibilidad con Fudo Print
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. Recomendada por Fudo */}
              <div className="p-3 rounded-2xl bg-[#faf8f3] dark:bg-[#192233]/70 border border-[#e8e4dc] dark:border-[#242f42] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172033] dark:text-slate-200">
                    Recomendada por Fudo
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRecommendedFudo("si")}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      recommendedFudo === "si"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-emerald-50"
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommendedFudo("advertencia")}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      recommendedFudo === "advertencia"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-amber-50"
                    }`}
                  >
                    Advertencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommendedFudo("no")}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      recommendedFudo === "no"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-rose-50"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* 2. ESC/POS (Comandas) */}
              <div className="p-3 rounded-2xl bg-[#faf8f3] dark:bg-[#192233]/70 border border-[#e8e4dc] dark:border-[#242f42] space-y-2">
                <span className="block text-xs font-bold text-[#172033] dark:text-slate-200">
                  ESC/POS (Comandas térmicas)
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEscPos("si")}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      escPos === "si"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-emerald-50"
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setEscPos("advertencia")}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      escPos === "advertencia"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-amber-50"
                    }`}
                  >
                    Advertencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setEscPos("no")}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      escPos === "no"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-rose-50"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* 3. QR Argentina (ARCA / MP) */}
              <div className="p-3 rounded-2xl bg-[#faf8f3] dark:bg-[#192233]/70 border border-[#e8e4dc] dark:border-[#242f42] space-y-2">
                <span className="block text-xs font-bold text-[#172033] dark:text-slate-200">
                  QR - Facturas ARG (ARCA / MP)
                </span>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => setQrArgentina("si")}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                      qrArgentina === "si"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-emerald-50"
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrArgentina("advertencia")}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                      qrArgentina === "advertencia"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-amber-50"
                    }`}
                  >
                    Adv.
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrArgentina("no")}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                      qrArgentina === "no"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-rose-50"
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrArgentina("no_especificado")}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                      qrArgentina === "no_especificado"
                        ? "bg-slate-700 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Sin datos
                  </button>
                </div>
              </div>

              {/* 4. PDF417 Chile */}
              <div className="p-3 rounded-2xl bg-[#faf8f3] dark:bg-[#192233]/70 border border-[#e8e4dc] dark:border-[#242f42] space-y-2">
                <span className="block text-xs font-bold text-[#172033] dark:text-slate-200">
                  PDF417 Chile (Boletas SII)
                </span>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => setPdf417Chile("si")}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                      pdf417Chile === "si"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-emerald-50"
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdf417Chile("advertencia")}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                      pdf417Chile === "advertencia"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-amber-50"
                    }`}
                  >
                    Adv.
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdf417Chile("no")}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                      pdf417Chile === "no"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300 hover:bg-rose-50"
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdf417Chile("no_especificado")}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center ${
                      pdf417Chile === "no_especificado"
                        ? "bg-slate-700 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Sin datos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Reconfirmación: Self-test y Link de Compra */}
          <div className="space-y-4 pt-2 border-t border-[#f0ece5] dark:border-[#242f42]">
            <span className="block text-xs font-black text-[#172033] dark:text-slate-200 uppercase tracking-wider">
              Verificación y Enlaces
            </span>

            {/* ¿Tenés el self test? */}
            <div className="p-4 rounded-2xl bg-[#faf8f3] dark:bg-[#192233]/70 border border-[#e8e4dc] dark:border-[#242f42] space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#ff5722]" />
                  <div>
                    <span className="block text-xs font-bold text-[#172033] dark:text-white">
                      ¿Tenés el self test?
                    </span>
                    <span className="block text-[11px] text-[#697386] dark:text-slate-400">
                      Adjuntá la foto del ticket impreso de prueba para validar compatibilidad.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setHasSelfTest(true)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      hasSelfTest
                        ? "bg-[#ff5722] text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHasSelfTest(false);
                      handleRemoveFile();
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !hasSelfTest
                        ? "bg-slate-700 text-white shadow-xs"
                        : "bg-white dark:bg-[#151c28] text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Si tiene self-test, mostrar dropzone */}
              {hasSelfTest && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selfTestPreview ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#151c28] border border-emerald-200 dark:border-emerald-800/60">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selfTestPreview}
                          alt="Self test preview"
                          className="w-12 h-12 object-cover rounded-lg border border-[#e8e4dc] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate">
                            {selfTestFile?.name || initialData?.selfTestImageName || "Self-test adjunto"}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Foto cargada correctamente
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Quitar foto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-4 rounded-xl border-2 border-dashed border-[#e8e4dc] dark:border-[#2d3b52] hover:border-[#ff5722] bg-white dark:bg-[#151c28] flex flex-col items-center justify-center gap-1 text-center transition-colors cursor-pointer group"
                    >
                      <UploadCloud className="w-6 h-6 text-[#697386] group-hover:text-[#ff5722] transition-colors" />
                      <span className="text-xs font-bold text-[#172033] dark:text-white group-hover:text-[#ff5722]">
                        Hacé clic para subir la foto del Self Test
                      </span>
                      <span className="text-[10px] text-[#697386] dark:text-slate-400">
                        Formatos soportados: PNG, JPG o WEBP (máx. 8MB)
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ¿Tenés el link de compra? */}
            <div className="p-4 rounded-2xl bg-[#faf8f3] dark:bg-[#192233]/70 border border-[#e8e4dc] dark:border-[#242f42] space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[#172033] dark:text-white">
                <ExternalLink className="w-4 h-4 text-[#ff5722]" />
                <span>¿Tenés el link de compra? (Opcional)</span>
              </label>
              <input
                type="url"
                value={purchaseUrl}
                onChange={(e) => setPurchaseUrl(e.target.value)}
                placeholder="https://articulo.mercadolibre.com.ar/... o web del fabricante"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e4dc] dark:border-[#2d3b52] bg-white dark:bg-[#151c28] text-xs font-medium text-[#172033] dark:text-white placeholder:text-[#697386] focus:outline-none focus:border-[#ff5722]"
              />
            </div>

            {/* Notas / Advertencia de compatibilidad */}
            <div>
              <label className="block text-xs font-bold text-[#172033] dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Notas u observaciones técnicas (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Requiere configurar a 9600 baudios. En 58mm solo sirve para MercadoPago."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e4dc] dark:border-[#2d3b52] bg-[#FAF8F3] dark:bg-[#1a2333] text-xs font-medium text-[#172033] dark:text-white placeholder:text-[#697386] focus:outline-none focus:border-[#ff5722] focus:bg-white dark:focus:bg-[#151c28]"
              />
            </div>
          </div>

          {/* Banner de revisión para agentes */}
          {currentUserRole !== "admin" && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-2.5 text-amber-900 dark:text-amber-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Revisión de Administrador:</span>
                <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                  Al guardar, esta impresora pasará a la bandeja de aprobación del Administrador antes de quedar visible para todo el equipo.
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#f0ece5] dark:border-[#242f42] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#697386] hover:text-[#172033] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#ff5722] hover:bg-[#e94817] shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Guardando...</span>
              ) : currentUserRole === "admin" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar y publicar</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enviar a revisión</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
