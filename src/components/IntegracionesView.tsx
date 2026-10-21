"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Check,
  Copy,
  Cable,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Send,
  ArrowRightLeft,
  ExternalLink,
} from "lucide-react";
import {
  platforms,
  integrationIssues,
  IntegrationIssue,
  IntegrationSolution,
  IntegrationPlatform,
} from "@/src/data/integraciones";

interface IntegracionesViewProps {
  onGoToDerivaciones?: () => void;
}

/** Una card = un problema + una delivery app */
interface IntegrationCard {
  id: string;
  issue: IntegrationIssue;
  solution: IntegrationSolution;
  platformId: string;
}

const normalizeText = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getPlatform = (id: string): IntegrationPlatform =>
  platforms.find((p) => p.id === id) as IntegrationPlatform;

// Se separa cada solución en una card por delivery app
const allCards: IntegrationCard[] = integrationIssues.flatMap((issue) =>
  issue.solutions.flatMap((solution, sIdx) =>
    solution.platformIds.map((platformId) => ({
      id: `${issue.id}-${sIdx}-${platformId}`,
      issue,
      solution,
      platformId,
    }))
  )
);

export default function IntegracionesView({ onGoToDerivaciones }: IntegracionesViewProps) {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const emailRegex = /([\w.+-]+@[\w-]+\.[\w.-]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0070BA] font-bold underline inline-flex items-center gap-0.5 mx-0.5 hover:text-[#005187]"
          >
            <span>{part.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
            <ExternalLink className="w-3 h-3 inline" />
          </a>
        );
      }
      return part.split(emailRegex).map((ep, j) =>
        ep.match(emailRegex) ? (
          <a
            key={`${i}-${j}`}
            href={`mailto:${ep}`}
            className="text-[#0070BA] font-bold underline hover:text-[#005187]"
          >
            {ep}
          </a>
        ) : (
          <React.Fragment key={`${i}-${j}`}>{ep}</React.Fragment>
        )
      );
    });
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const filteredCards = useMemo(() => {
    const queryTokens = normalizeText(searchQuery).split(/\s+/).filter(Boolean);

    return allCards.filter((card) => {
      if (selectedPlatformId !== "todas" && card.platformId !== selectedPlatformId) return false;

      if (queryTokens.length > 0) {
        const { issue, solution, platformId } = card;
        const searchable = normalizeText(
          `${getPlatform(platformId).name} ${issue.problem} ${issue.categoryLabel} ${issue.reportData.join(
            " "
          )} ${solution.scenario || ""} ${solution.steps.join(" ")} ${solution.note || ""} ${
            solution.clientMessage || ""
          }`
        );
        if (!queryTokens.every((token) => searchable.includes(token))) return false;
      }
      return true;
    });
  }, [selectedPlatformId, searchQuery]);

  const countsByPlatform = useMemo(() => {
    const counts: Record<string, number> = { todas: allCards.length };
    platforms.forEach((p) => {
      counts[p.id] = allCards.filter((c) => c.platformId === p.id).length;
    });
    return counts;
  }, []);

  const selectedPlatform = selectedPlatformId === "todas" ? null : getPlatform(selectedPlatformId);

  const renderDerivationBadge = (solution: IntegrationSolution) => {
    if (!solution.derivation) return null;
    if (solution.derivation === "si") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 border bg-orange-50 text-orange-700 border-orange-200">
          <Send className="w-3 h-3 rotate-45 text-orange-600" />
          <span>{solution.derivationLabel}</span>
        </span>
      );
    }
    if (solution.derivation === "no") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 border bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{solution.derivationLabel}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 border bg-amber-50 text-amber-800 border-amber-200">
        <Send className="w-3 h-3 text-amber-600" />
        <span>{solution.derivationLabel}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16 max-w-5xl mx-auto">
      {/* View Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[#ff5722] text-xs font-bold uppercase tracking-wider mb-1">
          <Cable className="w-4 h-4" />
          <span>Guía de Soporte Delivery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Integraciones Delivery por Plataforma
        </h1>
        <p className="text-xs sm:text-sm text-[#697386] mt-0.5">
          Datos para reportar, solución paso a paso, criterio de derivación a Integraciones y respuestas listas para el cliente en Rappi, PedidosYa, Uber Eats, Justo, iFood y Didi.
        </p>
      </div>

      {/* Platform quick access tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {platforms.map((p) => {
          const isSelected = selectedPlatformId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlatformId(isSelected ? "todas" : p.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-[#fff0e9] border-[#ff5722] shadow-sm"
                  : "bg-white border-[#e9e5de] hover:border-[#dcd6cc] shadow-2xs"
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold text-white select-none"
                  style={{ backgroundColor: p.color }}
                >
                  {p.shortCode}
                </span>
                {isSelected && <Check className="w-4 h-4 text-[#ff5722]" />}
              </div>
              <div className="mt-2">
                <p className="text-xs font-bold text-[#172033]">{p.name}</p>
                <p className="text-[10px] text-[#697386] mt-0.5">
                  {countsByPlatform[p.id]} casos documentados
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="bg-white border border-[#e9e5de] rounded-2xl p-3 shadow-2xs">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#697386]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="integraciones-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              selectedPlatform
                ? `Buscar en ${selectedPlatform.name} (ej: no ingresa pedido, tienda cerrada, precios, stock)...`
                : "Buscar por problema (ej: no ingresa pedido, tienda cerrada, precios, stock, baja)..."
            }
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#e9e5de] text-xs font-medium text-[#172033] placeholder:text-[#697386] focus:outline-none focus:border-[#ff5722] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#697386] hover:text-[#172033] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#697386] px-1">
        <span>
          Mostrando <strong>{filteredCards.length}</strong> de <strong>{allCards.length}</strong>{" "}
          casos de integración
          {selectedPlatform && (
            <span className="ml-1 text-[#ff5722] font-semibold">({selectedPlatform.name})</span>
          )}
        </span>
        {(searchQuery || selectedPlatformId !== "todas") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedPlatformId("todas");
            }}
            className="text-[#ff5722] hover:underline font-bold cursor-pointer"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Cards List */}
      {filteredCards.length > 0 ? (
        <div className="space-y-4">
          {filteredCards.map((card) => {
            const { issue, solution, platformId } = card;
            const platform = getPlatform(platformId);
            const isExpanded = expandedCards[card.id] ?? true;
            const isCopied = copiedId === card.id;
            const needsDerivation =
              solution.derivation === "si" || solution.derivation === "condicional";

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-[#e9e5de] shadow-2xs hover:border-[#dcd6cc] transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5 border-b border-[#e9e5de]/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${platform.badgeBg} ${platform.badgeText} ${platform.badgeBorder}`}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: platform.color }}
                          />
                          <span>{platform.name}</span>
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E6F2FA] text-[#3674A9] border border-[#CDE3F5]">
                          {issue.categoryLabel}
                        </span>
                        {solution.scenario && (
                          <span className="text-[11px] font-semibold text-[#697386] bg-[#FAF8F3] border border-[#e9e5de] px-2 py-0.5 rounded-md">
                            {solution.scenario}
                          </span>
                        )}
                        {renderDerivationBadge(solution)}
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold text-[#172033] tracking-tight pt-1">
                        {issue.problem}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpand(card.id)}
                      className="p-1.5 rounded-lg text-[#697386] hover:text-[#172033] hover:bg-[#FAF8F3] transition-colors cursor-pointer shrink-0"
                      title={isExpanded ? "Contraer detalle" : "Expandir detalle"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Data to report box */}
                  {issue.reportData.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#E6F2FA]/50 border-l-4 border-[#3674A9] text-xs text-[#1f4f7a]">
                      <p className="font-semibold text-[11px] uppercase tracking-wider text-[#3674A9] mb-1 flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Datos para reportar:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {issue.reportData.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#CDE3F5] font-semibold text-[#172033]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-4 bg-[#FAF9F5]/40">
                    {/* Steps */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#697386] mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Solución paso a paso</span>
                      </h4>
                      <div className="space-y-1.5">
                        {solution.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-[#172033] bg-white p-2.5 rounded-xl border border-[#e9e5de]/70 shadow-2xs"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#FAF8F3] border border-[#e9e5de] text-[11px] font-bold text-[#ff5722] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed pt-0.5">
                              {renderTextWithLinks(step)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlighted note */}
                    {solution.note && (
                      <div className="p-3.5 rounded-xl bg-[#E0F7FA] border-2 border-[#00BCD4] shadow-2xs space-y-1 text-xs text-[#006064]">
                        <div className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[#00838F]">
                          <AlertTriangle className="w-4 h-4 text-[#00ACC1]" />
                          <span>Importante:</span>
                        </div>
                        <p className="font-bold leading-relaxed">
                          {renderTextWithLinks(solution.note)}
                        </p>
                      </div>
                    )}

                    {/* Client Ready Message */}
                    {solution.clientMessage && (
                      <div className="bg-white rounded-xl border border-[#e9e5de] p-3.5 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#ff5722]" />
                            <span>Respuesta sugerida para enviar al cliente</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCopyMessage(card.id, solution.clientMessage || "")}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                              isCopied
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "bg-[#fff0e9] text-[#ff5722] hover:bg-[#ffd7c5] shadow-2xs"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar mensaje</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#e9e5de]/60 text-xs text-[#172033] leading-relaxed italic select-all whitespace-pre-line">
                          &quot;{solution.clientMessage}&quot;
                        </div>
                      </div>
                    )}

                    {onGoToDerivaciones && needsDerivation && (
                      <div className="pt-2 flex justify-end border-t border-[#f0ede6]">
                        <button
                          type="button"
                          onClick={onGoToDerivaciones}
                          className="text-xs font-bold text-[#697386] hover:text-[#ff5722] flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Ver horarios de guardia de Integraciones</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-[#e9e5de] rounded-2xl p-12 text-center my-8 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#fff0e9] text-[#ff5722] flex items-center justify-center mx-auto mb-2">
            <Cable className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#172033]">
            No se encontraron casos de integración coincidentes
          </h3>
          <p className="text-xs text-[#697386] max-w-sm mx-auto">
            No hay casos que coincidan con &quot;{searchQuery}&quot; para los filtros seleccionados. Intenta con otro término o limpia los filtros.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedPlatformId("todas");
            }}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-[#FAF8F3] border border-[#e9e5de] text-[#172033] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
