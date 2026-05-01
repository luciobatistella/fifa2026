import React, { useMemo } from 'react';
import {
  CheckCircle2, AlertCircle, Repeat2, Package,
  TrendingUp, BarChart3, Award, Settings,
  Download, Upload, X,
} from 'lucide-react';
import KpiCard from './ui/KpiCard.jsx';
import PainelGlass from './ui/PainelGlass.jsx';
import Bandeira from './ui/Bandeira.jsx';
import LinhaStat from './ui/LinhaStat.jsx';
import { fmtNum } from '../lib/figurinhas.js';
import { TOTAL_FIGURINHAS } from '../data/selecoes.js';

export default function Estatisticas({
  stats, progresso, especiais, meta, onExportar, onImportar, onResetar,
}) {
  const completas    = progresso.filter((s) => s.tem === s.total).length;
  const parciais     = progresso.filter((s) => s.tem > 0 && s.tem < s.total).length;
  const naoIniciadas = progresso.filter((s) => s.tem === 0).length;
  const ranking      = [...progresso].sort((a, b) => b.perc - a.perc || b.tem - a.tem);

  const porGrupo = useMemo(() => {
    const m = {};
    progresso.forEach((s) => {
      m[s.grupo] = m[s.grupo] || { grupo: s.grupo, tem: 0, total: 0 };
      m[s.grupo].tem   += s.tem;
      m[s.grupo].total += s.total;
    });
    return Object.values(m)
      .map((g) => ({ ...g, perc: (g.tem / g.total) * 100 }))
      .sort((a, b) => a.grupo.localeCompare(b.grupo));
  }, [progresso]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <KpiCard tone="amber"   icon={CheckCircle2} label="DISTINTAS"  valor={stats.distintas}  sub={`de ${TOTAL_FIGURINHAS}`} />
        <KpiCard tone="rose"    icon={AlertCircle}  label="FALTANDO"   valor={stats.faltando}   sub="figurinhas" />
        <KpiCard tone="emerald" icon={Repeat2}      label="REPETIDAS"  valor={stats.repetidas}  sub="para trocar" />
        <KpiCard tone="indigo"  icon={Package}      label="INVESTIDO"  valor={`R$ ${fmtNum(stats.investido)}`} sub={`${stats.pacotesEstimados} pacotes`} />
      </div>

      <PainelGlass titulo="RESUMO DA COLEÇÃO" icon={TrendingUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          <LinhaStat label="Seleções 100%"      valor={`${completas} / 48`} cor="emerald" />
          <LinhaStat label="Seleções iniciadas" valor={parciais} cor="amber" />
          <LinhaStat label="Não iniciadas"      valor={naoIniciadas} cor="stone" />
          <LinhaStat label="Especiais"          valor={`${especiais.tem} / ${especiais.total}`} cor="amber" />
          <LinhaStat label="Total colado"       valor={fmtNum(stats.totalColadas)} cor="indigo" />
          <LinhaStat label="Progresso geral"    valor={`${stats.percentual.toFixed(1)}%`} cor="amber" />
        </div>
      </PainelGlass>

      <PainelGlass titulo="PROGRESSO POR GRUPO" icon={BarChart3}>
        <div className="space-y-2.5">
          {porGrupo.map((g) => (
            <div key={g.grupo} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 ring-1 ring-amber-400/30 flex items-center justify-center">
                <span className="text-xs font-black text-amber-400">{g.grupo}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-stone-400">Grupo {g.grupo}</span>
                  <span className="font-mono text-stone-300">{g.tem}/{g.total} • {g.perc.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-stone-900 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${g.perc}%`,
                      background: g.perc === 100 ? '#34d399' : 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </PainelGlass>

      <PainelGlass titulo="RANKING DE SELEÇÕES" icon={Award}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-96 overflow-y-auto pr-1">
          {ranking.map((s, i) => (
            <div
              key={s.codigo}
              className="flex items-center gap-3 p-2.5 bg-stone-900 rounded-lg ring-1 ring-stone-800"
            >
              <span className={`w-6 text-center text-[10px] font-mono font-bold ${
                i === 0 ? 'text-amber-400' : i < 3 ? 'text-amber-300' : 'text-stone-500'
              }`}>{i + 1}º</span>
              <Bandeira emoji={s.bandeira} size={32} title={s.nome} className="rounded drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">{s.nome}</div>
                <div className="h-1 bg-stone-950 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full ${s.perc === 100 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    style={{ width: `${s.perc}%` }}
                  />
                </div>
              </div>
              <div className="text-[10px] font-mono text-stone-400 tabular-nums">{s.tem}/{s.total}</div>
            </div>
          ))}
        </div>
      </PainelGlass>

      <PainelGlass titulo="DADOS / BACKUP" icon={Settings}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onExportar}
            className="px-3 py-2 rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/40 text-emerald-400 text-xs font-bold hover:bg-emerald-400/20 transition flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> Exportar JSON
          </button>
          <label className="cursor-pointer px-3 py-2 rounded-lg bg-amber-400/10 ring-1 ring-amber-400/40 text-amber-400 text-xs font-bold hover:bg-amber-400/20 transition flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" /> Importar JSON
            <input type="file" accept="application/json" className="hidden" onChange={onImportar} />
          </label>
          <button
            onClick={onResetar}
            className="px-3 py-2 rounded-lg bg-rose-400/10 ring-1 ring-rose-400/40 text-rose-400 text-xs font-bold hover:bg-rose-400/20 transition flex items-center gap-2 ml-auto"
          >
            <X className="w-3.5 h-3.5" /> Zerar coleção
          </button>
        </div>
        <div className="mt-3 text-[11px] text-stone-500">
          Iniciado em {meta.criadoEm ? new Date(meta.criadoEm).toLocaleDateString('pt-BR') : '—'} •
          Salvamento automático no navegador
        </div>
      </PainelGlass>
    </div>
  );
}
