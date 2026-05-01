import React, { useMemo, useState } from 'react';
import { CheckCircle2, ArrowUpDown } from 'lucide-react';
import Bandeira from './ui/Bandeira.jsx';

const ORDENS = [
  { id: 'grupo',       label: 'Por grupo' },
  { id: 'completas',   label: 'Completas primeiro' },
  { id: 'faltamMais',  label: 'Faltam mais' },
  { id: 'faltamMenos', label: 'Quase completas' },
  { id: 'repetidas',   label: 'Mais repetidas' },
  { id: 'progresso',   label: 'Maior progresso %' },
  { id: 'alfabetica',  label: 'A → Z' },
];

function CardSelecao({ s, onAbrir }) {
  const completa = s.tem === s.total;
  return (
    <button
      onClick={() => onAbrir(s)}
      className={`group relative p-2 sm:p-3.5 rounded-xl text-left transition-all active:scale-[0.98] overflow-hidden ${
        completa
          ? 'bg-emerald-950/40 ring-1 ring-emerald-500/40'
          : 'bg-stone-900 ring-1 ring-stone-800 hover:ring-amber-500/40'
      }`}
    >
      {s.host && (
        <span className="absolute top-1 right-1 sm:top-2 sm:right-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
          Host
        </span>
      )}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <Bandeira emoji={s.bandeira} size={40} title={s.nome} className="rounded-md drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] sm:!w-14 sm:!h-14" />
        {completa && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
        {s.rep > 0 && !completa && (
          <span className="text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-400">
            +{s.rep}
          </span>
        )}
      </div>
      <div className="text-[11px] sm:text-sm font-bold leading-tight mb-1.5 sm:mb-2 truncate">{s.nome}</div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex-1 h-1 sm:h-1.5 bg-stone-950 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${completa ? 'bg-emerald-400' : 'bg-amber-400'}`}
            style={{ width: `${s.perc}%` }}
          />
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono text-stone-400 tabular-nums">{s.tem}/{s.total}</span>
      </div>
    </button>
  );
}

export default function ListaSelecoes({ progresso, onAbrir, filtro: filtroProp, setFiltro: setFiltroProp }) {
  const [ordem, setOrdem] = useState('grupo');
  const [filtroLocal, setFiltroLocal] = useState('todas'); // todas | completas | incompletas | comRepetidas
  const filtro = filtroProp ?? filtroLocal;
  const setFiltro = setFiltroProp ?? setFiltroLocal;

  const totalCompletas   = useMemo(() => progresso.filter((s) => s.tem === s.total).length, [progresso]);
  const totalIncompletas = progresso.length - totalCompletas;
  const totalComRep      = useMemo(() => progresso.filter((s) => (s.rep ?? 0) > 0).length, [progresso]);

  const filtrado = useMemo(() => progresso.filter((s) => {
    if (filtro === 'completas')    return s.tem === s.total;
    if (filtro === 'incompletas')  return s.tem < s.total;
    if (filtro === 'comRepetidas') return (s.rep ?? 0) > 0;
    return true;
  }), [progresso, filtro]);

  const grupos = useMemo(() => {
    if (ordem !== 'grupo') return null;
    const m = {};
    filtrado.forEach((s) => { (m[s.grupo] ||= []).push(s); });
    return m;
  }, [filtrado, ordem]);

  const ordenado = useMemo(() => {
    if (ordem === 'grupo') return null;
    const arr = [...filtrado];
    const cmp = {
      completas:   (a, b) => (b.tem === b.total) - (a.tem === a.total) || b.perc - a.perc || a.nome.localeCompare(b.nome),
      faltamMais:  (a, b) => (b.total - b.tem) - (a.total - a.tem) || a.nome.localeCompare(b.nome),
      faltamMenos: (a, b) => {
        const fa = a.total - a.tem, fb = b.total - b.tem;
        if ((fa === 0) !== (fb === 0)) return fa === 0 ? 1 : -1; // completas vão pro fim
        return fa - fb || a.nome.localeCompare(b.nome);
      },
      repetidas:   (a, b) => (b.rep ?? 0) - (a.rep ?? 0) || a.nome.localeCompare(b.nome),
      progresso:   (a, b) => b.perc - a.perc || a.nome.localeCompare(b.nome),
      alfabetica:  (a, b) => a.nome.localeCompare(b.nome),
    }[ordem];
    return arr.sort(cmp);
  }, [filtrado, ordem]);

  const FILTROS = [
    { id: 'todas',        label: 'Todas',         count: progresso.length },
    { id: 'completas',    label: 'Completas',     count: totalCompletas },
    { id: 'incompletas',  label: 'Faltando',      count: totalIncompletas },
    { id: 'comRepetidas', label: 'Com repetidas', count: totalComRep },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filtro === f.id
                  ? 'bg-amber-400 text-stone-950'
                  : 'bg-stone-900 text-stone-400 ring-1 ring-stone-800 hover:text-stone-200'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 font-mono tabular-nums ${filtro === f.id ? 'text-stone-700' : 'text-stone-500'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-stone-500 font-bold">
            <ArrowUpDown className="w-3.5 h-3.5" /> ORDENAR
          </label>
          <div className="relative flex-1 max-w-[240px]">
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              className="w-full appearance-none bg-stone-900 ring-1 ring-stone-800 rounded-lg px-3 py-1.5 pr-8 text-xs font-bold text-stone-200 focus:outline-none focus:ring-amber-500/50 cursor-pointer"
            >
              {ORDENS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 text-xs">▾</span>
          </div>
        </div>
      </div>

      {filtrado.length === 0 && (
        <div className="text-center text-stone-500 text-sm py-12 ring-1 ring-stone-900 rounded-xl bg-stone-950/40">
          Nenhuma seleção neste filtro.
        </div>
      )}

      {ordem === 'grupo' && grupos && Object.keys(grupos).sort().map((grp) => {
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
                <div className="h-full bg-amber-400" style={{ width: `${totalMax ? (totalTem / totalMax) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
              {lista.map((s) => <CardSelecao key={s.codigo} s={s} onAbrir={onAbrir} />)}
            </div>
          </section>
        );
      })}

      {ordem !== 'grupo' && ordenado && ordenado.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ordenado.map((s) => <CardSelecao key={s.codigo} s={s} onAbrir={onAbrir} />)}
        </div>
      )}
    </div>
  );
}
