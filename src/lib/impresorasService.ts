import { supabase, isSupabaseConfigured } from "./supabase";
import { printersData, PrinterModel } from "@/src/data/impresoras";

const PRINTERS_STORAGE_KEY = "fudo-custom-printers";

export function getCustomPrinters(): PrinterModel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRINTERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PrinterModel[];
  } catch (err) {
    console.error("Error reading custom printers from localStorage:", err);
    return [];
  }
}

export function saveCustomPrintersToStorage(printers: PrinterModel[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRINTERS_STORAGE_KEY, JSON.stringify(printers));
  } catch (err) {
    console.error("Error saving custom printers to localStorage:", err);
  }
}

/**
 * Upload self test image to Supabase storage if available, or return base64 DataURL as fallback.
 */
export async function uploadSelfTestImage(file: File): Promise<{ url: string; name: string }> {
  // If Supabase is configured, upload to storage
  if (isSupabaseConfigured() && supabase) {
    try {
      const extension = file.name.split(".").pop() || "png";
      const sanitizedBase = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30);
      const fileName = `selftest_${Date.now()}_${sanitizedBase}.${extension}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("macro-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || "image/png",
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("macro-images")
          .getPublicUrl(filePath);

        return {
          url: publicUrlData.publicUrl,
          name: file.name,
        };
      }
    } catch (err) {
      console.warn("Could not upload self-test to Supabase Storage, using base64 fallback:", err);
    }
  }

  // Base64 fallback for offline/local reliability
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        name: file.name,
      });
    };
    reader.onerror = () => reject(new Error("Error leyendo el archivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Save or update a printer model.
 */
export async function savePrinterModel(
  printer: PrinterModel,
  selfTestFile?: File | null
): Promise<PrinterModel> {
  const updated = { ...printer };

  if (selfTestFile) {
    const uploaded = await uploadSelfTestImage(selfTestFile);
    updated.selfTestImageUrl = uploaded.url;
    updated.selfTestImageName = uploaded.name;
    updated.hasSelfTest = true;
  }

  const existing = getCustomPrinters();
  const index = existing.findIndex((p) => p.id === updated.id);

  let next: PrinterModel[];
  if (index >= 0) {
    next = [...existing];
    next[index] = updated;
  } else {
    next = [updated, ...existing];
  }

  saveCustomPrintersToStorage(next);
  return updated;
}

/**
 * Approve a pending printer.
 */
export function approvePrinterModel(printerId: string): PrinterModel | null {
  const existing = getCustomPrinters();
  const index = existing.findIndex((p) => p.id === printerId);
  if (index < 0) return null;

  const updated: PrinterModel = {
    ...existing[index],
    status: "approved",
  };

  const next = [...existing];
  next[index] = updated;
  saveCustomPrintersToStorage(next);
  return updated;
}

/**
 * Delete a custom printer.
 */
export function deletePrinterModel(printerId: string): void {
  const existing = getCustomPrinters();
  const next = existing.filter((p) => p.id !== printerId);
  saveCustomPrintersToStorage(next);
}

/**
 * Merges base printers with custom printers.
 */
export function mergePrinters(customPrinters: PrinterModel[]): PrinterModel[] {
  const customIds = new Set(customPrinters.map((p) => p.id));
  const basePrinters = printersData.filter((p) => !customIds.has(p.id));
  return [...customPrinters, ...basePrinters];
}
