import React, { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Bandeira from './ui/Bandeira.jsx';

export default function ListaSelecoes({ progresso, onAbrir }) {
  const grupos = useMemo(() => {
    const m = {};
    progresso.forEach((s) => { (m[s.grupo] ||= []).push(s); });
    return m;
  }, [progresso]);

  return (
    <div className="space-y-6">
      {Object.keys(grupos).sort().map((grp) => {
        const lista = grupos[grp];
        const totalTem = lista.reduce((a, s) => a + s.tem, 0);
        const totalMax = lista.reduce((a, s) => a + s.total, 0);
        return (
          <section key={grp}>
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 ring-1 ring-amber-400/30 flex items-center justify-center">
                <span className="text-sm font-black text-amber-400">{grp}</span>
              </div>
              <div className="flex-1">
                <div className="text-[10px] tracking-[0.2em] text-stone-500 font-bold">GRUPO {grp}</div>
                <div className="text-xs text-stone-400 font-mono">{totalTem}/{totalMax}</div>
              </div>
              <div className="flex-1 max-w-[120px] h-1 bg-stone-900 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${(totalTem / totalMax) * 100}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {lista.map((s) => {
                const completa = s.tem === s.total;
                return (
                  <button
                    key={s.codigo}
                    onClick={() => onAbrir(s)}
                    className={`group relative p-3.5 rounded-xl text-left transition-all active:scale-[0.98] overflow-hidden ${
                      completa
                        ? 'bg-emerald-950/40 ring-1 ring-emerald-500/40'
                        : 'bg-stone-900 ring-1 ring-stone-800 hover:ring-amber-500/40'
                    }`}
                  >
                    {s.host && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        Host
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <Bandeira emoji={s.bandeira} size={56} title={s.nome} className="rounded-md drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
                      {completa && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      {s.rep > 0 && !completa && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-400">
                          +{s.rep}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold leading-tight mb-2 truncate">{s.nome}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-stone-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${completa ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${s.perc}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 tabular-nums">{s.tem}/{s.total}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
