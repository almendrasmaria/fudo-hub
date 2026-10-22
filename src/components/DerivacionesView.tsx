"use client";

import React from "react";
import {
  Clock,
  Inbox,
  Globe,
  Sparkles,
  Users,
} from "lucide-react";
import {
  teamList,
  commercialCountries,
  chileCommercialData,
} from "@/src/data/derivaciones";

export default function DerivacionesView() {
  const badgeStyles: Record<string, string> = {
    purple:
      "bg-[#F0EAFB] text-[#7357AA] border-[#E1D5F5] dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
    emerald:
      "bg-[#E7F5EE] text-[#347F65] border-[#CEEAD9] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
    sky:
      "bg-[#E6F2FA] text-[#3674A9] border-[#CDE3F5] dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
    orange:
      "bg-[#FFF0E9] text-[#E94817] border-[#FFD7C5] dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16 max-w-5xl mx-auto">
      {/* View Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[#ff5722] text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Protocolo de transferencias</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          Guía de Derivaciones
        </h1>
        <p className="text-xs sm:text-sm text-[#697386] mt-0.5">
          Horarios de atención, flujos de transferencia y criterios operativos por equipo y país (Hora Argentina).
        </p>
      </div>

      {/* General Protocol Rule Banner */}
      <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#F3E7C4] flex items-center gap-2.5 shadow-2xs">
        <Clock className="w-4 h-4 text-amber-800 shrink-0" />
        <p className="text-xs text-[#8A6A1C]">
          <strong className="text-[#6B4F0E] font-bold">Fines de semana y fuera de horario:</strong> No se transfieren chats en vivo. Se crea folio para que el área correspondiente lo responda en su horario hábil.
        </p>
      </div>

      {/* Main Teams Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#697386]">
            Equipos de soporte y técnicos ({teamList.length})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamList.map((team) => {
            const typeBadgeStyle = badgeStyles[team.typeColor] || badgeStyles.orange;
            return (
              <div
                key={team.id}
                className="bg-white rounded-xl border border-[#e9e5de] p-4 sm:p-5 shadow-2xs hover:border-[#dcd6cc] transition-all space-y-3"
              >
                {/* Top Row: Team Name & Type & Hours */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-base font-extrabold text-[#172033]">
                        {team.name}
                      </h2>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeBadgeStyle}`}
                      >
                        {team.typeLabel}
                      </span>
                    </div>

                    {team.agents && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#697386]">
                        <Users className="w-3 h-3 text-[#ff5722]" />
                        <span>{team.agents}</span>
                      </div>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172033] bg-[#FAF8F3] px-2.5 py-1 rounded-lg border border-[#e9e5de] shadow-2xs shrink-0">
                    <Clock className="w-3.5 h-3.5 text-[#ff5722]" />
                    {team.hours}
                  </span>
                </div>

                {/* Action Box */}
                <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#e9e5de] space-y-1">
                  <span className="text-[10px] font-bold text-[#697386] uppercase tracking-wider block">
                    {team.actionType}:
                  </span>
                  <div className="text-xs font-bold text-[#ff5722] font-mono break-words">
                    {team.actionName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commercial & Chile Squads Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-3">
        {/* Commercial by Country */}
        <div className="bg-white rounded-xl border border-[#e9e5de] p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#ff5722]" />
              <h3 className="text-base font-bold text-[#172033]">
                Ejecutivos Comerciales
              </h3>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeStyles.purple}`}
            >
              Flujo reutilizable
            </span>
          </div>

          <div className="p-2.5 bg-[#FAF8F3] rounded-xl border border-[#e9e5de] space-y-1">
            <span className="text-[10px] font-bold text-[#697386] uppercase tracking-wider block">
              Flujo:
            </span>
            <div className="text-xs font-bold text-[#ff5722] font-mono">
              Asignación Owner Comercial
            </div>
          </div>

          <div className="space-y-2">
            {commercialCountries.map((c) => (
              <div
                key={c.country}
                className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#e9e5de] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white text-[#172033] border border-[#e9e5de] shadow-2xs font-mono">
                    {c.country === "Argentina" ? "AR" : c.country === "Colombia" ? "CO" : c.country === "México" ? "MX" : c.country.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="font-bold text-[#172033]">{c.country}</span>
                  <span className="text-[10px] text-[#697386]">
                    (Local: {c.localHours})
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172033] bg-white px-2.5 py-1 rounded-lg border border-[#e9e5de] shadow-2xs">
                  <Clock className="w-3 h-3 text-[#ff5722]" />
                  {c.argHours} ARG
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chile Squads */}
        <div className="bg-white rounded-xl border border-[#e9e5de] p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white text-[#172033] border border-[#e9e5de] shadow-2xs font-mono">
                CL
              </span>
              <h3 className="text-base font-bold text-[#172033]">
                Comercial Chile (Squads)
              </h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeStyles.emerald}`}
              >
                Cambio de Inbox
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#172033] bg-[#FAF8F3] px-2.5 py-1 rounded-lg border border-[#e9e5de] shadow-2xs">
              <Clock className="w-3 h-3 text-[#ff5722]" />
              {chileCommercialData.hours}
            </span>
          </div>

          <div className="space-y-2.5">
            {chileCommercialData.squads.map((squad) => (
              <div
                key={squad.inbox}
                className="p-3 bg-[#FAF8F3] rounded-xl border border-[#e9e5de] space-y-1"
              >
                <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5 font-mono">
                  <Inbox className="w-3.5 h-3.5 text-[#ff5722]" />
                  {squad.inbox}
                </span>
                <p className="text-[11px] text-[#697386] leading-relaxed">
                  {squad.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900 leading-relaxed shadow-2xs dark:bg-purple-950/30 dark:border-purple-900/50 dark:text-purple-200">
            <strong className="dark:text-white">Fuera de horario:</strong> Crear Folio y cambiar el <strong className="dark:text-white">inbox del folio</strong> según el squad correspondiente.
          </div>
        </div>
      </div>
    </div>
  );
}
