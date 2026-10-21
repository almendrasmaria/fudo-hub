"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Image as ImageIcon, Star } from "lucide-react";
import Button from "@/src/components/ui/Button";
import { Macro, Category } from "@/src/data/macros";

export interface MacroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (macro: Macro) => void;
  initialData?: Macro | null;
  categories: Category[];
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  arqueos: { label: "ARQUEOS", color: "purple" },
  facturacion: { label: "FACTURACIÓN", color: "blue" },
  "carta-digital": { label: "CARTA DIGITAL", color: "emerald" },
  configuracion: { label: "CONFIGURACIÓN", color: "orange" },
};

export default function MacroModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
}: MacroModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("arqueos");
  const [text, setText] = useState("");
  const [imageName, setImageName] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState("");

  const selectableCategories = categories.filter((c) => c.id !== "todas");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setText(initialData.text);
      setImageName(initialData.image?.name || "");
      setIsFavorite(initialData.isFavorite);
    } else {
      setTitle("");
      setCategory(selectableCategories[0]?.id || "arqueos");
      setText("");
      setImageName("");
      setIsFavorite(false);
    }
    setError("");
  }, [initialData, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }

    if (!text.trim()) {
      setError("El contenido de la macro no puede estar vacío");
      return;
    }

    const meta = categoryLabels[category] || {
      label: category.toUpperCase(),
      color: "orange",
    };

    const macroToSave: Macro = {
      id: initialData?.id || `macro-${Date.now()}`,
      title: title.trim(),
      category,
      categoryLabel: meta.label,
      categoryColor: meta.color,
      text: text.trim(),
      updatedAt: initialData ? "recién" : "recién",
      isFavorite,
      image: imageName.trim()
        ? {
            name: imageName.trim().endsWith(".png")
              ? imageName.trim()
              : `${imageName.trim()}.png`,
            previewType: category,
          }
        : undefined,
    };

    onSave(macroToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-3xl border border-[#e9e5de] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[#e9e5de] flex items-center justify-between bg-[#FAF8F3]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#fff0e9] text-[#ff5722] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#172033]">
                {initialData ? "Editar macro" : "Nueva macro"}
              </h2>
              <p className="text-[11px] text-[#697386]">
                {initialData
                  ? "Modificá la respuesta y sus datos asociados"
                  : "Creá una respuesta rápida para compartir con clientes"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#697386] hover:text-[#172033] hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              Título de la macro <span className="text-[#ff5722]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Diferencia en el cierre de caja"
              className="w-full px-3.5 py-2.5 bg-white border border-[#e9e5de] rounded-xl text-xs text-[#172033] placeholder-[#697386]/60 shadow-2xs focus:outline-hidden focus:border-[#ff5722] focus:ring-3 focus:ring-orange-500/10 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              Categoría <span className="text-[#ff5722]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectableCategories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      isSelected
                        ? "bg-[#fff0e9] border-[#ff5722] text-[#ff5722] shadow-2xs"
                        : "bg-white border-[#e9e5de] text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033]"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              Contenido / Respuesta rápida <span className="text-[#ff5722]">*</span>
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="¡Hola! 👋 Para solucionar esto, ingresá a..."
              className="w-full p-3 bg-white border border-[#e9e5de] rounded-xl text-xs text-[#172033] placeholder-[#697386]/60 shadow-2xs focus:outline-hidden focus:border-[#ff5722] focus:ring-3 focus:ring-orange-500/10 transition-all font-normal leading-relaxed resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              Nombre de captura adjunta (Opcional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ImageIcon className="w-3.5 h-3.5 text-[#697386]" />
              </div>
              <input
                type="text"
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                placeholder="Ej: Movimientos de caja.png"
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#e9e5de] rounded-xl text-xs text-[#172033] placeholder-[#697386]/60 shadow-2xs focus:outline-hidden focus:border-[#ff5722] focus:ring-3 focus:ring-orange-500/10 transition-all font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  isFavorite
                    ? "bg-[#F5A524] border-[#F5A524] text-white shadow-2xs"
                    : "border-[#e9e5de] bg-white text-transparent"
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs font-semibold text-[#172033]">
                Guardar en Favoritos
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-[#e9e5de] flex items-center justify-end gap-2.5">
            <Button variant="secondary" size="md" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit">
              {initialData ? "Guardar cambios" : "Crear macro"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
