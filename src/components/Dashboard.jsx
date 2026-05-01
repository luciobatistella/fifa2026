import React, { useState } from 'react';
import {
  CheckCircle2, Circle, Repeat2, Package, Wand2, Shuffle,
  TrendingUp, Target, Flame, ArrowUpRight,
} from 'lucide-react';
import KpiCard from './ui/KpiCard.jsx';
import QuickAction from './ui/QuickAction.jsx';
import PainelGlass from './ui/PainelGlass.jsx';
import LinhaStat from './ui/LinhaStat.jsx';
import Bandeira from './ui/Bandeira.jsx';
import { TOTAL_FIGURINHAS } from '../data/selecoes.js';
import { fmtNum } from '../lib/figurinhas.js';

export default function Dashboard({
  stats, progresso, especiais, repetidas, onAbrirSelecao, onAbrirPacote, onQuickAdd,
}) {
  const [ordemHeatmap, setOrdemHeatmap] = useState('grupo'); // 'grupo' | 'az' | 'perc'
  const completas    = progresso.filter((s) => s.tem === s.total).length;
  const naoIniciadas = progresso.filter((s) => s.tem === 0).length;
  const proximas     = [...progresso]
    .filter((s) => s.tem > 0 && s.tem < s.total)
    .sort((a, b) => (b.tem / b.total) - (a.tem / a.total))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard tone="amber"   icon={CheckCircle2} label="DISTINTAS"  valor={stats.distintas}   sub={`de ${TOTAL_FIGURINHAS}`} />
        <KpiCard tone="rose"    icon={Circle}       label="FALTANDO"   valor={stats.faltando}    sub="para completar" />
        <KpiCard tone="emerald" icon={Repeat2}      label="REPETIDAS"  valor={stats.repetidas}   sub="para trocar" />
        <KpiCard tone="indigo"  icon={Package}      label="PACOTES"    valor={stats.pacotesEstimados} sub={`~ R$ ${fmtNum(stats.investido)}`} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <QuickAction tone="amber"   icon={Package} titulo="Abrir Pacote" desc="Registre 7 figurinhas de uma vez" onClick={onAbrirPacote} kbd="P" />
        <QuickAction tone="emerald" icon={Wand2}   titulo="Adicionar"    desc="Cole vários códigos de uma vez"   onClick={onQuickAdd} kbd="A" />
        <QuickAction tone="indigo"  icon={Shuffle} titulo="Modo Troca"   desc={`${repetidas.length} tipos disponíveis`} onClick={() => {}} disabled />
      </div>

      {/* Painéis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <PainelGlass titulo="VISÃO GERAL" icon={TrendingUp}>
          <div className="space-y-3">
            <LinhaStat label="Seleções 100%"  valor={`${completas} / 48`} cor="emerald" />
            <LinhaStat label="Não iniciadas"  valor={naoIniciadas} cor="stone" />
            <LinhaStat label="Especiais"      valor={`${especiais.tem} / ${especiais.total}`} cor="amber" />
            <LinhaStat label="Total colado"   valor={fmtNum(stats.totalColadas)} cor="indigo" />
            <div className="pt-3 border-t border-stone-800">
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
                <span>Progresso geral</span>
                <span className="font-mono font-bold text-amber-400">{stats.percentual.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-stone-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${stats.percentual}%` }}
                />
              </div>
            </div>
          </div>
        </PainelGlass>

        <PainelGlass titulo="PRÓXIMAS DE COMPLETAR" icon={Target}>
          {proximas.length === 0 ? (
            <div className="text-sm text-stone-500 py-6 text-center">
              Comece a colar para ver seu ranking
            </div>
          ) : (
            <div className="space-y-2.5">
              {proximas.map((s) => (
                <button
                  key={s.codigo}
                  onClick={() => onAbrirSelecao(s)}
                  className="w-full flex items-center gap-3 group"
                >
                  <Bandeira emoji={s.bandeira} size={40} title={s.nome} className="rounded drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold truncate">{s.nome}</span>
                      <span className="font-mono text-stone-400">{s.tem}/{s.total}</span>
                    </div>
                    <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 group-hover:bg-emerald-400 transition-all"
                        style={{ width: `${s.perc}%` }}
                      />
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-600 group-hover:text-amber-400 transition" />
                </button>
              ))}
            </div>
          )}
        </PainelGlass>
      </div>

      {/* Heatmap */}
      <PainelGlass titulo="HEATMAP DAS SELEÇÕES" icon={Flame}>
        {/* Controles de ordenação */}
        <div className="flex gap-1 mb-3">
          {[{ v: 'grupo', l: 'Por Grupo' }, { v: 'az', l: 'A – Z' }, { v: 'perc', l: 'Progresso' }].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setOrdemHeatmap(v)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-colors ${
                ordemHeatmap === v
                  ? 'bg-amber-400/20 text-amber-400 ring-1 ring-amber-400/40'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5">
          {[...progresso]
            .sort(
              ordemHeatmap === 'az'   ? (a, b) => a.nome.localeCompare(b.nome, 'pt') :
              ordemHeatmap === 'perc' ? (a, b) => b.perc - a.perc || b.tem - a.tem :
              (a, b) => a.grupo.localeCompare(b.grupo) || a.nome.localeCompare(b.nome, 'pt')
            )
            .map((s) => {
            const cor = s.perc === 100 ? 'bg-emerald-400'
                     : s.perc >= 75   ? 'bg-amber-400'
                     : s.perc >= 50   ? 'bg-amber-500/70'
                     : s.perc >= 25   ? 'bg-amber-600/50'
                     : s.perc > 0     ? 'bg-amber-700/40'
                                      : 'bg-stone-800';
            return (
              <button
                key={s.codigo}
                onClick={() => onAbrirSelecao(s)}
                className={`relative aspect-square rounded-md ${cor} hover:scale-110 hover:ring-2 hover:ring-amber-400/50 transition-all flex flex-col items-center justify-center gap-0.5 p-1`}
                title={`${s.codigo} · ${s.nome} · ${s.tem}/${s.total}`}
              >
                <Bandeira emoji={s.bandeira} size={22} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                <span className={`text-[11px] font-black font-mono leading-none tracking-wider ${
                  s.perc === 0
                    ? 'text-stone-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]'
                    : 'text-stone-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'
                }`}>
                  {s.codigo}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-[10px] text-stone-500">
          <span>0%</span>
          <div
            className="flex-1 h-1.5 rounded-full"
            style={{ background: 'linear-gradient(90deg,#1c1917,#a16207,#f59e0b,#10b981)' }}
          />
          <span>100%</span>
        </div>
      </PainelGlass>
    </div>
  );
}
