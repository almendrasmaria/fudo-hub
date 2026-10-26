"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import Sidebar from "@/src/components/Sidebar";
import Header from "@/src/components/Header";
import SearchHero from "@/src/components/SearchHero";
import MacroCard from "@/src/components/MacroCard";
import MacroModal from "@/src/components/MacroModal";
import DerivacionesView from "@/src/components/DerivacionesView";
import IntegracionesView from "@/src/components/IntegracionesView";
import ImpresorasView from "@/src/components/ImpresorasView";
import FacturacionView from "@/src/components/FacturacionView";
import Button from "@/src/components/ui/Button";
import Pagination from "@/src/components/ui/Pagination";
import ToastContainer, { ToastMessage, ToastType } from "@/src/components/ui/Toast";
import { categories, initialMacros, Macro } from "@/src/data/macros";
import { getMacros, saveMacro, deleteMacro } from "@/src/lib/macrosService";
import { SearchX, Star } from "lucide-react";

const ITEMS_PER_PAGE = 8;

const sidebarListeners = new Set<() => void>();

function subscribeSidebar(callback: () => void) {
  sidebarListeners.add(callback);
  window.addEventListener("resize", callback);
  window.addEventListener("storage", callback);
  return () => {
    sidebarListeners.delete(callback);
    window.removeEventListener("resize", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSidebarSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem("fudo-sidebar-open");
  if (saved !== null) {
    return saved === "true";
  }
  return window.innerWidth >= 1024;
}

function getServerSidebarSnapshot(): boolean {
  return true;
}

function updateSidebarState(open: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem("fudo-sidebar-open", String(open));
    sidebarListeners.forEach((listener) => listener());
  }
}

export default function Home() {
  const [activeView, setActiveView] = useState<"macros" | "integraciones" | "impresoras" | "derivaciones" | "facturacion">("facturacion");
  const [macros, setMacros] = useState<Macro[]>(initialMacros);
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [selectedCountry, setSelectedCountry] = useState<string>("todos");
  const [isFavoritesOnly, setIsFavoritesOnly] = useState<boolean>(false);
  const [isMyMacrosOnly, setIsMyMacrosOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMacro, setEditingMacro] = useState<Macro | null>(null);
  const [myMacroIds, setMyMacroIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, title: string, message?: string) => {
    setToasts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.title === title && last.message === message) {
        return prev;
      }
      const id = `toast-${Date.now()}-${Math.random()}`;
      return [...prev, { id, type, title, message }];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const isSidebarOpen = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getServerSidebarSnapshot
  );

  const toggleSidebar = () => {
    updateSidebarState(!isSidebarOpen);
  };

  const closeSidebar = () => {
    updateSidebarState(false);
  };

  React.useEffect(() => {
    const titles: Record<string, string> = {
      facturacion: "Fudo Hub | Facturación Electrónica",
      integraciones: "Fudo Hub | Integraciones Delivery",
      impresoras: "Fudo Hub | Compatibilidad de Impresoras",
      derivaciones: "Fudo Hub | Criterios de Derivación",
      macros: "Fudo Hub | Macros",
    };
    document.title = titles[activeView] || "Fudo Hub | Centro de Soporte";
  }, [activeView]);

  React.useEffect(() => {
    let isMounted = true;
    getMacros().then((data) => {
      if (isMounted) {
        const list = data && data.length > 0 ? data : initialMacros;
        let savedFavs: string[] | null = null;
        let savedMines: string[] = [];
        let savedDeleted: string[] = [];

        try {
          const favStr = localStorage.getItem("fudo-macro-favorites");
          if (favStr) savedFavs = JSON.parse(favStr);
          const mineStr = localStorage.getItem("fudo-my-macros");
          if (mineStr) savedMines = JSON.parse(mineStr);
          const delStr = localStorage.getItem("fudo-deleted-macros");
          if (delStr) savedDeleted = JSON.parse(delStr);
        } catch {
          // ignore
        }

        const excludedIds = new Set([
          ...savedDeleted,
          "macro-1",
          "macro-3",
          "macro-4",
          "macro-5",
        ]);

        const filteredList = list.filter((m) => !excludedIds.has(m.id));

        setMyMacroIds(savedMines);

        if (savedFavs) {
          const favSet = new Set(savedFavs);
          setMacros(filteredList.map((m) => ({ ...m, isFavorite: favSet.has(m.id) })));
        } else {
          const defaultFavs = filteredList.filter((m) => m.isFavorite).map((m) => m.id);
          try {
            localStorage.setItem("fudo-macro-favorites", JSON.stringify(defaultFavs));
          } catch {
            // ignore
          }
          setMacros(filteredList);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleFavorite = (macroId: string) => {
    const target = macros.find((m) => m.id === macroId);
    if (!target) return;

    const nextFav = !target.isFavorite;

    // 1. Update macros state
    setMacros((prev) =>
      prev.map((m) => (m.id === macroId ? { ...m, isFavorite: nextFav } : m))
    );

    // 2. Persist to localStorage outside of state updater
    try {
      const saved = localStorage.getItem("fudo-macro-favorites");
      const favs: string[] = saved ? JSON.parse(saved) : [];
      const updated = nextFav
        ? Array.from(new Set([...favs, macroId]))
        : favs.filter((id) => id !== macroId);
      localStorage.setItem("fudo-macro-favorites", JSON.stringify(updated));
    } catch {
      // ignore
    }

    // 3. Trigger single Toast notification
    addToast(
      nextFav ? "success" : "info",
      nextFav ? "Agregada a Favoritas" : "Quitada de Favoritas",
      `"${target.title}" ${
        nextFav ? "se guardó en tus favoritas." : "fue quitada de tus favoritas."
      }`
    );
  };

  const favoritesCount = useMemo(() => {
    return macros.filter((m) => m.isFavorite).length;
  }, [macros]);

  const myMacrosCount = useMemo(() => {
    return macros.filter(
      (m) => m.shareStatus === "private" || myMacroIds.includes(m.id) || !m.isShared
    ).length;
  }, [macros, myMacroIds]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todas: macros.length,
    };
    categories.forEach((cat) => {
      if (cat.id !== "todas") {
        counts[cat.id] = macros.filter((m) => m.category === cat.id).length;
      }
    });
    return counts;
  }, [macros]);

  const countryCounts = useMemo(() => {
    const facturacionMacros = macros.filter((m) => m.category === "facturacion");
    return {
      todos: facturacionMacros.length,
      argentina: facturacionMacros.filter((m) => m.country === "argentina").length,
      chile: facturacionMacros.filter((m) => m.country === "chile").length,
      colombia: facturacionMacros.filter((m) => m.country === "colombia").length,
      mexico: facturacionMacros.filter((m) => m.country === "mexico").length,
    };
  }, [macros]);

  const filteredMacros = useMemo(() => {
    return macros.filter((macro) => {
      // Favorite filter
      if (isFavoritesOnly && !macro.isFavorite) {
        return false;
      }

      // My macros filter
      if (isMyMacrosOnly) {
        const isMine =
          macro.shareStatus === "private" ||
          myMacroIds.includes(macro.id) ||
          !macro.isShared;
        if (!isMine) return false;
      }

      // Category filter
      const matchesCategory =
        selectedCategory === "todas" || macro.category === selectedCategory;

      // Country filter (only applies if in facturación)
      const matchesCountry =
        selectedCategory !== "facturacion" ||
        selectedCountry === "todos" ||
        macro.country === selectedCountry;

      // Search query
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        macro.title.toLowerCase().includes(query) ||
        (macro.errorSnippet && macro.errorSnippet.toLowerCase().includes(query)) ||
        macro.text.toLowerCase().includes(query) ||
        macro.categoryLabel.toLowerCase().includes(query) ||
        (macro.country && macro.country.toLowerCase().includes(query));

      return matchesCategory && matchesCountry && matchesSearch;
    });
  }, [macros, isFavoritesOnly, isMyMacrosOnly, myMacroIds, selectedCategory, selectedCountry, searchQuery]);

  const totalPages = Math.ceil(filteredMacros.length / ITEMS_PER_PAGE);

  const paginatedMacros = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMacros.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMacros, currentPage]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedCountry("todos");
    setActiveView("macros");
    setCurrentPage(1);
    if (categoryId === "todas") {
      setIsFavoritesOnly(false);
      setIsMyMacrosOnly(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("todas");
    setSelectedCountry("todos");
    setIsFavoritesOnly(false);
    setIsMyMacrosOnly(false);
    setCurrentPage(1);
  };

  const handleNewMacro = () => {
    setEditingMacro(null);
    setIsModalOpen(true);
  };

  const handleEdit = (macro: Macro) => {
    setEditingMacro(macro);
    setIsModalOpen(true);
  };

  const handleSaveMacro = async (macroToSave: Macro, imageFile?: File | null) => {
    const saved = await saveMacro(macroToSave, imageFile);

    if (editingMacro) {
      setMacros((prev) =>
        prev.map((m) => (m.id === saved.id ? saved : m))
      );
      addToast("success", "Macro actualizada", `"${saved.title}" fue actualizada correctamente.`);
    } else {
      setMacros((prev) => [saved, ...prev]);
      setCurrentPage(1);
      setMyMacroIds((prev) => {
        const next = [...prev, saved.id];
        try {
          localStorage.setItem("fudo-my-macros", JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      addToast("success", "Macro creada", `"${saved.title}" se agregó a la biblioteca.`);
    }
  };

  const handleDeleteMacro = async (macroId: string) => {
    try {
      await deleteMacro(macroId);
    } catch (err) {
      console.error("Error al eliminar macro de Supabase:", err);
    }

    try {
      const saved = localStorage.getItem("fudo-deleted-macros");
      const deleted: string[] = saved ? JSON.parse(saved) : [];
      if (!deleted.includes(macroId)) {
        localStorage.setItem(
          "fudo-deleted-macros",
          JSON.stringify([...deleted, macroId])
        );
      }
    } catch {
      // ignore
    }

    setMacros((prev) => prev.filter((m) => m.id !== macroId));
    if (editingMacro?.id === macroId) {
      setIsModalOpen(false);
      setEditingMacro(null);
    }
    addToast("success", "Macro eliminada", "La macro fue removida de la biblioteca.");
  };

  const handleOpenRecent = () => {
    addToast(
      "info",
      "Historial de macros recientes",
      "Esta función estará disponible en la próxima actualización de Fudo Hub."
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf8f3] text-[#172033]">
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        categoryCounts={categoryCounts}
        activeView={activeView}
        onSelectView={setActiveView}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onNewMacro={handleNewMacro}
          onOpenRecent={handleOpenRecent}
          activeView={activeView}
          onSelectView={setActiveView}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-7xl w-full mx-auto">
            {activeView === "derivaciones" ? (
              <DerivacionesView />
            ) : activeView === "integraciones" ? (
              <IntegracionesView
                onGoToDerivaciones={() => setActiveView("derivaciones")}
              />
            ) : activeView === "impresoras" ? (
              <ImpresorasView />
            ) : activeView === "facturacion" ? (
              <FacturacionView />
            ) : (
              <>
                <SearchHero
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                  categoryCounts={categoryCounts}
                  totalCount={macros.length}
                  filteredCount={filteredMacros.length}
                  onNewMacro={handleNewMacro}
                  selectedCountry={selectedCountry}
                  onSelectCountry={(c) => {
                    setSelectedCountry(c);
                    setCurrentPage(1);
                  }}
                  countryCounts={countryCounts}
                  isFavoritesOnly={isFavoritesOnly}
                  onToggleFavoritesOnly={() => {
                    setIsFavoritesOnly((prev) => !prev);
                    setCurrentPage(1);
                  }}
                  favoritesCount={favoritesCount}
                  isMyMacrosOnly={isMyMacrosOnly}
                  onToggleMyMacrosOnly={() => {
                    setIsMyMacrosOnly((prev) => !prev);
                    setCurrentPage(1);
                  }}
                  myMacrosCount={myMacrosCount}
                />

                {filteredMacros.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {paginatedMacros.map((macro) => (
                        <MacroCard
                          key={macro.id}
                          macro={macro}
                          onEdit={handleEdit}
                          onDelete={handleDeleteMacro}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredMacros.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={setCurrentPage}
                    />
                  </>
                ) : (
                  <div className="bg-white dark:bg-[#151c28] border border-[#e9e5de] dark:border-[#242f42] rounded-2xl p-12 text-center my-8 shadow-2xs">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        isFavoritesOnly
                          ? "bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400"
                          : isMyMacrosOnly
                          ? "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300"
                          : "bg-[#fff0e9] text-[#ff5722]"
                      }`}
                    >
                      {isFavoritesOnly ? (
                        <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                      ) : (
                        <SearchX className="w-6 h-6" />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-[#172033] dark:text-slate-100 mb-1">
                      {isFavoritesOnly
                        ? "No se encontraron macros favoritas"
                        : isMyMacrosOnly
                        ? "No se encontraron macros personales"
                        : "No se encontraron macros"}
                    </h3>
                    <p className="text-xs text-[#697386] dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
                      {isFavoritesOnly
                        ? "No tenés macros marcadas con estrella ⭐ que coincidan con la categoría o búsqueda actual."
                        : isMyMacrosOnly
                        ? "No tenés macros personales creadas en esta sección."
                        : `No hay resultados para "${searchQuery}". Probá con otra búsqueda o limpiá los filtros.`}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleResetFilters}
                    >
                      Limpiar filtros y ver todas
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <MacroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMacro}
        onDelete={handleDeleteMacro}
        initialData={editingMacro}
        categories={categories}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
