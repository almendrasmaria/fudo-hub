import { supabase, isSupabaseConfigured } from "./supabase";
import { Macro, MacroCountry, MacroShareStatus, initialMacros } from "@/src/data/macros";

export interface MacroRow {
  id: string;
  title: string;
  category: string;
  category_label: string;
  category_color?: string | null;
  country?: string | null;
  error_code?: string | null;
  error_snippet?: string | null;
  text: string;
  image_name?: string | null;
  image_url?: string | null;
  image_size?: string | null;
  is_favorite?: boolean | null;
  is_shared?: boolean | null;
  share_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "recién";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  if (diffDays === 1) return "ayer";
  if (diffDays < 30) return `hace ${diffDays} días`;
  return date.toLocaleDateString("es-AR", { month: "short", day: "numeric" });
}

function mapRowToMacro(row: MacroRow): Macro {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    categoryLabel: row.category_label || row.category.toUpperCase(),
    categoryColor: row.category_color || "orange",
    country: (row.country as MacroCountry) || undefined,
    errorCode: row.error_code || undefined,
    errorSnippet: row.error_snippet || undefined,
    text: row.text,
    image: row.image_url
      ? {
          name: row.image_name || "Captura adjunta",
          url: row.image_url,
          size: row.image_size || undefined,
          previewType: row.category,
        }
      : undefined,
    updatedAt: row.updated_at
      ? formatRelativeTime(new Date(row.updated_at))
      : "recientemente",
    isFavorite: Boolean(row.is_favorite),
    isShared: Boolean(row.is_shared),
    shareStatus: (row.share_status as MacroShareStatus) || "private",
  };
}

/**
 * Obtiene las macros desde Supabase. Si aún no está configurado o falla, devuelve initialMacros.
 */
export async function getMacros(): Promise<Macro[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return initialMacros;
  }

  try {
    const { data, error } = await supabase
      .from("macros")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error consultando macros en Supabase, usando locales:", error.message);
      return initialMacros;
    }

    const dbMacros = (data as MacroRow[]).map(mapRowToMacro);
    const dbIds = new Set(dbMacros.map((m) => m.id));
    const remainingInitial = initialMacros.filter((m) => !dbIds.has(m.id));
    return [...dbMacros, ...remainingInitial];
  } catch (err) {
    console.error("Excepción al cargar macros de Supabase:", err);
    return initialMacros;
  }
}

/**
 * Sube un archivo de imagen al bucket 'macro-images' de Supabase Storage
 */
export async function uploadMacroImage(file: File): Promise<{
  url: string;
  name: string;
  size: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase no está configurado. Revisa tu archivo .env.local");
  }

  // Sanitizar nombre de archivo y evitar colisiones con timestamp
  const extension = file.name.split(".").pop() || "png";
  const sanitizedBase = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 30);
  const fileName = `${Date.now()}_${sanitizedBase}.${extension}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("macro-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/png",
    });

  if (uploadError) {
    throw new Error(`Error al subir la imagen: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("macro-images")
    .getPublicUrl(filePath);

  return {
    url: publicUrlData.publicUrl,
    name: file.name,
    size: formatFileSize(file.size),
  };
}

/**
 * Guarda o edita una macro en Supabase (y sube la imagen al Storage si hay archivo nuevo)
 */
export async function saveMacro(
  macro: Macro,
  imageFile?: File | null
): Promise<Macro> {
  const updatedMacro = { ...macro };

  // 1. Si hay un archivo de imagen nuevo seleccionado, subirlo primero
  if (imageFile && isSupabaseConfigured()) {
    const uploaded = await uploadMacroImage(imageFile);
    updatedMacro.image = {
      name: uploaded.name,
      url: uploaded.url,
      size: uploaded.size,
      previewType: macro.category,
    };
  }

  // 2. Si Supabase no está configurado, devolvemos la macro para guardarla en memoria local
  if (!isSupabaseConfigured() || !supabase) {
    return updatedMacro;
  }

  // 3. Persistir en la tabla de Supabase
  const row: MacroRow = {
    id: updatedMacro.id,
    title: updatedMacro.title,
    category: updatedMacro.category,
    category_label: updatedMacro.categoryLabel,
    category_color: updatedMacro.categoryColor || "orange",
    country: updatedMacro.country || "general",
    error_code: updatedMacro.errorCode || null,
    error_snippet: updatedMacro.errorSnippet || null,
    text: updatedMacro.text,
    image_name: updatedMacro.image?.name || null,
    image_url: updatedMacro.image?.url || null,
    image_size: updatedMacro.image?.size || null,
    is_favorite: updatedMacro.isFavorite ?? false,
    is_shared: updatedMacro.isShared ?? false,
    share_status: updatedMacro.shareStatus || "private",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("macros").upsert(row);

  if (error) {
    throw new Error(`Error al guardar en la base de datos: ${error.message}`);
  }

  return updatedMacro;
}

/**
 * Elimina una macro de Supabase
 */
export async function deleteMacro(macroId: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    return;
  }

  const { error } = await supabase.from("macros").delete().eq("id", macroId);
  if (error) {
    throw new Error(`Error al eliminar la macro: ${error.message}`);
  }
}
