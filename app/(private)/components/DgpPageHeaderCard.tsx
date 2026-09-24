"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { TodayDateLine } from "./TodayDateLine";

type MetaPill = {
  icon?: ReactNode;
  label: string;
};

type DgpPageHeaderCardProps = {
  title: string;
  /**
   * Linha de suporte abaixo do título (opcional). Ex: descrição curta.
   */
  description?: ReactNode;
  /**
   * “Pílula” à esquerda (ex: Selected date) + valor ao lado.
   */
  metaPill?: MetaPill;
  metaValue?: ReactNode;
  /**
   * Conteúdo à direita no topo (ex: <UserCard />).
   */
  rightSlot?: ReactNode;
  /**
   * Bloco de controles (fica na faixa de baixo com border-top).
   */
  controlsSlot?: ReactNode;
  className?: string;
};

export function DgpPageHeaderCard({
  title,
  description,
  metaPill,
  metaValue,
  rightSlot,
  controlsSlot,
  className = "",
}: DgpPageHeaderCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.45, ease: "easeOut" }}
      className={`mb-4 md:mb-6 ${className}`}
    >
      <div className="px-0 py-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              <span className="bg-gradient-to-br from-slate-900 to-blue-600 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>

            <TodayDateLine className="mt-1 text-xs font-medium text-slate-500" />

            {(metaPill || metaValue || description) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                {metaPill && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {metaPill.icon ? (
                      <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{metaPill.icon}</span>
                    ) : null}
                    {metaPill.label}
                  </span>
                )}
                {metaValue ? <span className="font-medium text-slate-700">{metaValue}</span> : null}
                {description ? <span className="text-slate-500">{description}</span> : null}
              </div>
            )}
          </div>

          {rightSlot ? <div className="flex-shrink-0">{rightSlot}</div> : null}
        </div>
      </div>

      {controlsSlot ? (
        <div className="mt-3 rounded-xl border border-slate-200/60 bg-white/70 px-4 py-3 md:px-6">
          {controlsSlot}
        </div>
      ) : null}
    </motion.section>
  );
}

