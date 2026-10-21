"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Check,
  Copy,
  ReceiptText,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  GitFork,
  Hash,
  XCircle,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import {
  CountryId,
  countriesInfo,
  invoiceIssues,
  InvoiceIssue,
} from "@/src/data/facturacion";

export default function FacturacionView() {
  const [selectedCountry, setSelectedCountry] = useState<CountryId | "todos">("chile");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<Record<string, boolean>>({});
  const [activeDecisionBranches, setActiveDecisionBranches] = useState<Record<string, string>>({});

  const normalizeText = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
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
      return part;
    });
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIssues((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const setDecisionBranch = (issueId: string, branchId: string) => {
    setActiveDecisionBranches((prev) => ({
      ...prev,
      [issueId]: branchId,
    }));
  };

  // Filtered issues calculation
  const filteredIssues = useMemo(() => {
    const normQuery = normalizeText(searchQuery);
    const queryTokens = normQuery.split(/\s+/).filter(Boolean);

    return invoiceIssues.filter((issue) => {
      // Country filter
      if (selectedCountry !== "todos" && issue.countryId !== selectedCountry) {
        return false;
      }

      // Search query
      if (queryTokens.length > 0) {
        const treeText = issue.decisionTree
          ? `${issue.decisionTree.question} ${issue.decisionTree.branches
              .map(
                (b) =>
                  `${b.label} ${b.summary} ${b.note || ""} ${b.steps?.join(" ") || ""} ${
                    b.clientMessage || ""
                  }`
              )
              .join(" ")}`
          : "";

        const searchable = normalizeText(
          `${issue.errorCode} ${issue.title} ${issue.errorSnippet} ${issue.rootCause} ${issue.solutionSteps.join(
            " "
          )} ${issue.clientMessage} ${issue.entity} ${countriesInfo[issue.countryId].name} ${
            issue.derivationTarget || ""
          } ${issue.derivationChannel || ""} ${issue.warningNote || ""} ${treeText}`
        );

        const matchesAll = queryTokens.every((token) => searchable.includes(token));
        if (!matchesAll) return false;
      }

      return true;
    });
  }, [selectedCountry, searchQuery]);

  // Counts by country
  const countsByCountry = useMemo(() => {
    const counts: Record<string, number> = { todos: invoiceIssues.length };
    (Object.keys(countriesInfo) as CountryId[]).forEach((cid) => {
      counts[cid] = invoiceIssues.filter((i) => i.countryId === cid).length;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16 max-w-5xl mx-auto">
      {/* View Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[#ff5722] text-xs font-bold uppercase tracking-wider mb-1">
          <ReceiptText className="w-4 h-4" />
          <span>Guía Fiscal de Soporte</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Facturación Electrónica por País
        </h1>
        <p className="text-xs sm:text-sm text-[#697386] mt-0.5">
          Diagramas oficiales, errores frecuentes, árboles de decisión y respuestas listas para el cliente en Colombia (DIAN), Argentina, México y Chile.
        </p>
      </div>

      {/* Official Tax Portals Quick Access Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(countriesInfo) as CountryId[]).map((cid) => {
          const c = countriesInfo[cid];
          const isSelected = selectedCountry === cid;
          return (
            <div
              key={cid}
              onClick={() => setSelectedCountry(isSelected ? "todos" : cid)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-[#fff0e9] border-[#ff5722] shadow-sm"
                  : "bg-white border-[#e9e5de] hover:border-[#dcd6cc] shadow-2xs"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl select-none">{c.flag}</span>
                <a
                  href={c.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title={`Abrir portal oficial ${c.entity}`}
                  className="text-[#697386] hover:text-[#ff5722] p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-[#172033]">{c.name}</p>
                </div>
                <p className="text-[11px] font-semibold text-[#ff5722]">
                  {c.entity}
                </p>
                <p className="text-[10px] text-[#697386] mt-0.5">
                  {countsByCountry[cid]} casos documentados
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
            id="facturacion-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código de error (ej: Rango full, No range key, intID, invoice/items), texto o síntoma..."
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
          Mostrando <strong>{filteredIssues.length}</strong> de{" "}
          <strong>{invoiceIssues.length}</strong> errores fiscales
          {selectedCountry !== "todos" && (
            <span className="ml-1 text-[#ff5722] font-semibold">
              ({countriesInfo[selectedCountry].name})
            </span>
          )}
        </span>
        {(searchQuery || selectedCountry !== "todos") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCountry("todos");
            }}
            className="text-[#ff5722] hover:underline font-bold cursor-pointer"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Issues List */}
      {filteredIssues.length > 0 ? (
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const country = countriesInfo[issue.countryId];
            const isExpanded = expandedIssues[issue.id] ?? true; // expanded by default
            const isCopied = copiedId === issue.id;

            // Decision tree state
            const currentBranchId =
              activeDecisionBranches[issue.id] ||
              issue.decisionTree?.branches[0]?.id ||
              "";
            const currentBranch = issue.decisionTree?.branches.find(
              (b) => b.id === currentBranchId
            );

            return (
              <div
                key={issue.id}
                className="bg-white rounded-2xl border border-[#e9e5de] shadow-2xs hover:border-[#dcd6cc] transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5 border-b border-[#e9e5de]/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Country badge */}
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172033] bg-[#FAF8F3] px-2.5 py-0.5 rounded-lg border border-[#e9e5de]">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </span>

                        {/* Entity badge */}
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E6F2FA] text-[#3674A9] border border-[#CDE3F5]">
                          {issue.entity}
                        </span>

                        {/* Error code badge (only if defined) */}
                        {issue.errorCode && (
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60">
                            {issue.errorCode}
                          </span>
                        )}

                        {/* Slack Channel badge if available */}
                        {issue.derivationChannel && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Hash className="w-3 h-3 text-indigo-600" />
                            <span>{issue.derivationChannel}</span>
                          </span>
                        )}

                        {/* Portal link button */}
                        {issue.portalLink && (
                          <a
                            href={issue.portalLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0070BA] hover:text-[#005187] hover:underline"
                            title={issue.portalLink.label}
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{issue.portalLink.label}</span>
                          </a>
                        )}

                        {/* Video tutorial button */}
                        {issue.videoLink && (
                          <a
                            href={issue.videoLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                            title={issue.videoLink.label}
                          >
                            <PlayCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>{issue.videoLink.label}</span>
                          </a>
                        )}
                      </div>

                      {/* Issue Title */}
                      <h3 className="text-base sm:text-lg font-extrabold text-[#172033] tracking-tight pt-1">
                        {issue.title}
                      </h3>
                    </div>

                    {/* Expand/Collapse toggle */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(issue.id)}
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

                  {/* Error Snippet Quote Box */}
                  <div className="mt-3 p-2.5 rounded-xl bg-red-50/40 dark:bg-red-950/20 border-l-4 border-red-500 font-mono text-xs text-red-800 dark:text-red-300 select-all">
                    <p className="font-semibold text-[11px] uppercase tracking-wider text-red-600 dark:text-red-400 mb-0.5">
                      Mensaje de error del sistema:
                    </p>
                    &quot;{issue.errorSnippet}&quot;
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-4 bg-[#FAF9F5]/40 dark:bg-slate-900/30">
                    {/* Visual Screenshot Replica for Modal Errors (e.g. Rango full) */}
                    {issue.dialogScreenshot && (
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <Sparkles className="w-3.5 h-3.5 text-[#ff5722]" />
                          <span>Captura visual de la ventana emergente en Fudo:</span>
                        </div>
                        <div className="flex justify-center p-3 bg-slate-100 rounded-lg">
                          <div className="w-64 bg-[#2C334D] text-white rounded-lg shadow-xl overflow-hidden border border-slate-700">
                            {/* Window title bar */}
                            <div className="bg-[#21273D] px-3 py-1.5 flex items-center justify-between text-[11px] font-bold tracking-wider">
                              <span>{issue.dialogScreenshot.title}</span>
                              <span className="text-slate-400 text-xs">✕</span>
                            </div>
                            {/* Window body */}
                            <div className="p-5 bg-white text-slate-800 text-center space-y-3">
                              <div className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center mx-auto text-red-500">
                                <XCircle className="w-7 h-7" />
                              </div>
                              <p className="text-sm font-bold text-slate-800">
                                {issue.dialogScreenshot.message}
                              </p>
                              <div className="pt-1">
                                <button
                                  type="button"
                                  className="px-5 py-1 text-xs font-bold rounded-md bg-[#ff6b4a] text-white shadow hover:bg-[#fa5a35] transition-colors"
                                >
                                  {issue.dialogScreenshot.buttonText}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interactive Decision Tree / Flowchart Branching Widget */}
                    {issue.decisionTree && (
                      <div className="rounded-2xl border-2 border-[#ffccba] bg-[#FFFBF8] p-4 shadow-2xs space-y-3.5">
                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#E94817]">
                          <GitFork className="w-4 h-4 text-[#ff5722]" />
                          <span>Flujo de Validación y Decisión (Protocolo Oficial)</span>
                        </div>

                        {/* Question Box */}
                        <div className="bg-white p-3 rounded-xl border border-[#ffd7c5] shadow-2xs">
                          <p className="text-xs font-bold text-[#697386] uppercase tracking-wider mb-1">
                            Pregunta clave de diagnóstico:
                          </p>
                          <p className="text-sm sm:text-base font-extrabold text-[#172033]">
                            {issue.decisionTree.question}
                          </p>
                        </div>

                        {/* Interactive Branch Switcher */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {issue.decisionTree.branches.map((branch) => {
                            const isBranchActive = currentBranchId === branch.id;
                            return (
                              <button
                                key={branch.id}
                                type="button"
                                onClick={() => setDecisionBranch(issue.id, branch.id)}
                                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  isBranchActive
                                    ? "bg-white border-[#ff5722] shadow-sm ring-2 ring-[#ff5722]/20"
                                    : "bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-600"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                                      isBranchActive
                                        ? "bg-[#ff5722] text-white"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {branch.label}
                                  </span>
                                  {isBranchActive && (
                                    <span className="text-[11px] font-bold text-[#ff5722] flex items-center gap-1">
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Activo</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-medium text-[#172033] mt-2 line-clamp-2">
                                  {branch.summary}
                                </p>
                              </button>
                            );
                          })}
                        </div>

                        {/* Active Branch Workflow Details */}
                        {currentBranch && (
                          <div className="bg-white rounded-xl p-3.5 border border-[#ffd7c5] space-y-3 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
                                <span>Resolución para: <strong>{currentBranch.label}</strong></span>
                              </span>
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                  currentBranch.badgeType === "derivation"
                                    ? "bg-[#FFF0E9] text-[#E94817] border border-[#FFD7C5]"
                                    : "bg-[#E7F5EE] text-[#347F65] border border-[#CEEAD9]"
                                }`}
                              >
                                {currentBranch.badgeText}
                              </span>
                            </div>

                            <p className="text-xs text-[#172033] font-medium leading-relaxed">
                              {currentBranch.summary}
                            </p>

                            {/* Sticky Note for renewal/escalation if present */}
                            {currentBranch.note && (
                              <div className="p-3 rounded-xl bg-[#E0F7FA] border-l-4 border-[#00ACC1] text-xs text-[#006064] leading-relaxed font-medium">
                                <p className="font-bold mb-0.5">📌 Nota importante:</p>
                                {renderTextWithLinks(currentBranch.note)}
                              </div>
                            )}

                            {/* Steps if present */}
                            {currentBranch.steps && currentBranch.steps.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <p className="text-xs font-bold text-[#697386] uppercase tracking-wider">
                                  Pasos a seguir:
                                </p>
                                {currentBranch.steps.map((step, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="flex items-start gap-2.5 text-xs text-[#172033] bg-[#FAF8F3] p-2.5 rounded-xl border border-[#e9e5de]"
                                  >
                                    <span className="w-5 h-5 rounded-full bg-[#ff5722] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                      {sIdx + 1}
                                    </span>
                                    <span className="leading-relaxed pt-0.5">
                                      {renderTextWithLinks(step)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Branch-specific copyable message */}
                            {currentBranch.clientMessage && (
                              <div className="pt-2">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#697386]">
                                    Mensaje específico para esta opción:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyMessage(
                                        `${issue.id}-${currentBranch.id}`,
                                        currentBranch.clientMessage || ""
                                      )
                                    }
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                                      copiedId === `${issue.id}-${currentBranch.id}`
                                        ? "bg-emerald-600 text-white"
                                        : "bg-[#fff0e9] text-[#ff5722] hover:bg-[#ffd7c5]"
                                    }`}
                                  >
                                    {copiedId === `${issue.id}-${currentBranch.id}` ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>¡Copiado!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copiar este mensaje</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#e9e5de] text-xs text-[#172033] leading-relaxed italic select-all">
                                  &quot;{currentBranch.clientMessage}&quot;
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Root Cause */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#697386] mb-1 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#ff5722]" />
                        <span>Causa raíz y diagnóstico</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-[#172033] leading-relaxed">
                        {issue.rootCause}
                      </p>
                    </div>

                    {/* Standard Solution Steps (if not using decisionTree or as backup summary) */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#697386] mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Solución paso a paso</span>
                      </h4>
                      <div className="space-y-1.5">
                        {issue.solutionSteps.map((step, idx) => (
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

                    {/* Critical Sticky Warning Note */}
                    {issue.warningNote && (
                      <div className="p-3.5 rounded-xl bg-[#E0F7FA] border-2 border-[#00BCD4] shadow-2xs space-y-1 text-xs text-[#006064]">
                        <div className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[#00838F]">
                          <AlertTriangle className="w-4 h-4 text-[#00ACC1]" />
                          <span>Nota Oficial del Protocolo:</span>
                        </div>
                        <p className="font-bold leading-relaxed">
                          {renderTextWithLinks(issue.warningNote)}
                        </p>
                      </div>
                    )}

                    {/* Client Ready Message */}
                    <div className="bg-white rounded-xl border border-[#e9e5de] p-3.5 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#ff5722]" />
                          <span>Respuesta sugerida para enviar al cliente</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopyMessage(issue.id, issue.clientMessage)}
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

                      <div className="p-3 rounded-lg bg-[#FAF8F3] border border-[#e9e5de]/60 text-xs text-[#172033] leading-relaxed italic select-all">
                        &quot;{issue.clientMessage}&quot;
                      </div>
                    </div>
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
            <ReceiptText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#172033]">
            No se encontraron errores fiscales coincidentes
          </h3>
          <p className="text-xs text-[#697386] max-w-sm mx-auto">
            No hay casos que coincidan con &quot;{searchQuery}&quot; para los filtros seleccionados. Intenta con otro término o limpia los filtros.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCountry("todos");
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
