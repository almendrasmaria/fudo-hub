"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Image as ImageIcon,
  Share2,
  Clock,
  UploadCloud,
  Trash2,
  Pencil,
  Check,
  Loader2,
} from "lucide-react";
import Button from "@/src/components/ui/Button";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import { Macro, Category, MacroImage, MacroCountry } from "@/src/data/macros";

export interface MacroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (macro: Macro, imageFile?: File | null) => Promise<void> | void;
  onDelete?: (macroId: string) => void;
  initialData?: Macro | null;
  categories: Category[];
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  arqueos: { label: "ARQUEOS", color: "purple" },
  facturacion: { label: "FACTURACIÓN", color: "blue" },
  "tu-delivery": { label: "TU DELIVERY", color: "emerald" },
  "carta-digital": { label: "TU DELIVERY", color: "emerald" },
  configuracion: { label: "CONFIGURACIÓN", color: "orange" },
  otros: { label: "OTROS", color: "slate" },
};

function createPastedImageFile(file: File): File {
  const timestamp = new Date().toISOString().slice(0, 10);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return new File(
    [file],
    `captura-${timestamp}-${randomSuffix}.png`,
    { type: file.type }
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MacroModalDialog({
  onClose,
  onSave,
  onDelete,
  initialData,
  categories,
}: Omit<MacroModalProps, "isOpen">) {
  const selectableCategories = categories.filter((c) => c.id !== "todas");

  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(
    initialData?.category || selectableCategories[0]?.id || "arqueos"
  );
  const [country, setCountry] = useState<MacroCountry>(
    (initialData?.country as MacroCountry) || "general"
  );
  const [text, setText] = useState(initialData?.text || "");
  const [imageData, setImageData] = useState<MacroImage | null>(
    initialData?.image ? { ...initialData.image } : null
  );
  const [isShared, setIsShared] = useState(
    Boolean(
      initialData?.isShared ||
      initialData?.shareStatus === "pending" ||
      initialData?.shareStatus === "approved"
    )
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isSubmitting]);

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen (PNG, JPG, WEBP, GIF)");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageData({
        name: file.name,
        url: e.target?.result as string,
        size: formatFileSize(file.size),
        previewType: category,
      });
      setError("");
    };
    reader.readAsDataURL(file);
  };

  // Support Ctrl+V paste of images from clipboard
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const autoNamedFile = createPastedImageFile(file);
          handleProcessFile(autoNamedFile);
          break;
        }
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageData(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteConfirm = () => {
    if (!initialData || !onDelete) return;
    onDelete(initialData.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      country: category === "facturacion" ? country : undefined,
      text: text.trim(),
      updatedAt: initialData ? initialData.updatedAt : "recién",
      isShared,
      shareStatus: isShared
        ? initialData?.shareStatus === "approved"
          ? "approved"
          : "pending"
        : "private",
      image: imageData
        ? {
            name: imageData.name.trim() || `captura-${Date.now()}.png`,
            url: imageData.url,
            size: imageData.size,
            previewType: category,
          }
        : undefined,
    };

    setIsSubmitting(true);
    setError("");

    try {
      await onSave(macroToSave, selectedFile);
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocurrió un error al guardar la macro";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onPaste={handlePaste}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#151c28] rounded-3xl border border-[#e9e5de] dark:border-[#242f42] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#e9e5de] dark:border-[#242f42] flex items-center justify-between bg-[#FAF8F3] dark:bg-[#0f1520]">
          <div>
            <h2 className="text-base font-extrabold text-[#172033] dark:text-slate-100">
              {initialData ? "Editar macro" : "Nueva macro"}
            </h2>
            <p className="text-[11px] text-[#697386] dark:text-slate-400">
              {initialData
                ? "Modificá la respuesta y sus datos asociados"
                : "Creá una respuesta rápida para compartir con clientes"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-xl text-[#697386] hover:text-[#172033] hover:bg-white dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#1c2637] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Macro Title */}
          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-slate-200 mb-1.5">
              Título de la macro <span className="text-[#ff5722]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Diferencia en el cierre de caja"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0f1520] border border-[#e9e5de] dark:border-[#242f42] rounded-xl text-xs text-[#172033] dark:text-slate-100 placeholder-[#697386]/60 dark:placeholder-slate-500 shadow-2xs focus:outline-hidden focus:border-[#ff5722] focus:ring-3 focus:ring-orange-500/10 transition-all font-medium"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-slate-200 mb-1.5">
              Categoría <span className="text-[#ff5722]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {selectableCategories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      isSelected
                        ? "bg-[#fff0e9] border-[#ff5722] text-[#ff5722] shadow-2xs dark:bg-orange-500/15 dark:border-[#ff5722] dark:text-[#ff7849]"
                        : "bg-white border-[#e9e5de] text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033] dark:bg-[#0f1520] dark:border-[#242f42] dark:text-slate-300 dark:hover:bg-[#1c2637] dark:hover:text-white"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Country Selector for Facturación */}
          {category === "facturacion" && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-[#172033] dark:text-slate-200 mb-1.5">
                País correspondiente
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: "general", label: "General" },
                  { id: "argentina", label: "Argentina" },
                  { id: "chile", label: "Chile" },
                  { id: "colombia", label: "Colombia" },
                  { id: "mexico", label: "México" },
                ].map((c) => {
                  const isSelected = country === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCountry(c.id as MacroCountry)}
                      className={`px-2 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center flex items-center justify-center ${
                        isSelected
                          ? "bg-[#fff0e9] border-[#ff5722] text-[#ff5722] shadow-2xs dark:bg-orange-500/15 dark:border-[#ff5722] dark:text-[#ff7849]"
                          : "bg-white border-[#e9e5de] text-[#697386] hover:bg-[#FAF8F3] hover:text-[#172033] dark:bg-[#0f1520] dark:border-[#242f42] dark:text-slate-300 dark:hover:bg-[#1c2637]"
                      }`}
                    >
                      <span className="truncate">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content / Quick Reply Text */}
          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-slate-200 mb-1.5">
              Contenido / Respuesta rápida <span className="text-[#ff5722]">*</span>
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="¡Hola! 👋 Para solucionar esto, ingresá a..."
              className="w-full p-3 bg-white dark:bg-[#0f1520] border border-[#e9e5de] dark:border-[#242f42] rounded-xl text-xs text-[#172033] dark:text-slate-100 placeholder-[#697386]/60 dark:placeholder-slate-500 shadow-2xs focus:outline-hidden focus:border-[#ff5722] focus:ring-3 focus:ring-orange-500/10 transition-all font-normal leading-relaxed resize-none"
            />
          </div>

          {/* Photo Upload & Preview Section */}
          <div>
            {imageData ? (
              /* Image Uploaded State: Edit and Delete available */
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#172033] dark:text-slate-200">
                    Captura adjunta
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ff5722] hover:text-[#e94817] cursor-pointer transition-colors"
                      title="Cambiar por otra imagen"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Cambiar foto</span>
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer transition-colors"
                      title="Eliminar captura adjunta"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Quitar foto</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F3] dark:bg-[#0f1520] border border-[#e9e5de] dark:border-[#242f42] rounded-2xl flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-900/10 dark:bg-black/30 border border-[#e9e5de] dark:border-[#242f42] shrink-0 flex items-center justify-center relative">
                    {imageData.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageData.url}
                        alt={imageData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {/* File name & size */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="text"
                      value={imageData.name}
                      onChange={(e) =>
                        setImageData({ ...imageData, name: e.target.value })
                      }
                      placeholder="Nombre del archivo..."
                      title="Hacé clic para editar el nombre de la captura"
                      className="text-xs font-bold text-[#172033] dark:text-slate-200 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#ff5722] focus:outline-hidden truncate w-full"
                    />
                    <div className="flex items-center gap-2 text-[11px] text-[#697386] dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        <Check className="w-3 h-3" />
                        Adjunta
                      </span>
                      {imageData.size && <span>• {imageData.size}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State: Dropzone to upload or paste */
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#172033] dark:text-slate-200">
                    Captura adjunta (Opcional)
                  </label>
                  <span className="text-[11px] text-[#697386] dark:text-slate-400">
                    PNG, JPG, WEBP, GIF o Ctrl+V
                  </span>
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#ff5722] bg-[#fff0e9]/50 dark:bg-orange-500/10"
                      : "border-[#e9e5de] hover:border-[#ff5722]/60 hover:bg-[#FAF8F3] dark:border-[#242f42] dark:hover:border-[#ff5722]/60 dark:hover:bg-[#0f1520]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] dark:bg-slate-800 text-[#ff5722] mx-auto flex items-center justify-center mb-2 border border-[#e9e5de] dark:border-[#242f42]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#172033] dark:text-slate-200">
                    Hacé clic para subir o arrastrá una imagen
                  </p>
                  <p className="text-[11px] text-[#697386] dark:text-slate-400 mt-0.5">
                    También podés presionar{" "}
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono">
                      Ctrl+V
                    </kbd>{" "}
                    para pegar una captura directamente
                  </p>
                </div>
              </div>
            )}

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Selector de Compartir / Aprobación Admin */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              isShared
                ? "bg-purple-50/70 border-purple-200 dark:bg-purple-950/25 dark:border-purple-800/50"
                : "bg-[#FAF8F3] border-[#e9e5de] dark:bg-[#0f1520] dark:border-[#242f42]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div
                  className={`p-2 rounded-xl mt-0.5 shrink-0 transition-colors ${
                    isShared
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                      : "bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#172033] dark:text-slate-100">
                      Compartir con el equipo
                    </span>
                    {isShared ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-300 shrink-0" />
                        <span>Pasa a revisión de Admin</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        Macro personal
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#697386] dark:text-slate-400 leading-relaxed">
                    {isShared
                      ? "Se enviará al Administrador para su validación. Una vez aprobada, se publicará para todos los operadores de soporte."
                      : "Solo estará visible en tu biblioteca privada. Activá esta opción si considerás que puede servir a todo el equipo."}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isShared}
                onClick={() => setIsShared(!isShared)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isShared ? "bg-[#ff5722]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isShared ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#e9e5de] dark:border-[#242f42] flex items-center justify-between gap-2.5">
            <div>
              {initialData && onDelete && (
                <Button
                  variant="ghost"
                  size="md"
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30"
                  icon={Trash2}
                >
                  Eliminar macro
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isSubmitting}
                icon={isSubmitting ? Loader2 : undefined}
                className={isSubmitting ? "[&_svg]:animate-spin" : ""}
              >
                {isSubmitting
                  ? "Guardando en Supabase..."
                  : initialData
                  ? "Guardar cambios"
                  : "Crear macro"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar macro?"
        description={`Estás por eliminar "${initialData?.title || 'esta macro'}". Esta acción quitará la macro de la biblioteca y no se puede deshacer.`}
        confirmText="Eliminar macro"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

export default function MacroModal(props: MacroModalProps) {
  if (!props.isOpen) return null;
  return <MacroModalDialog key={props.initialData?.id || "new"} {...props} />;
}
