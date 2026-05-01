import React, { useMemo, useState } from 'react';
import { Repeat2, Shuffle, Download, Plus, Minus } from 'lucide-react';
import { fmtNum } from '../lib/figurinhas.js';

const FILTROS = [
  { id: 'todas',     label: 'Todas' },
  { id: 'selecoes',  label: 'Seleções' },
  { id: 'especiais', label: 'Especiais' },
];
const ORDENS = [
  { id: 'extras',  label: 'Mais repetidas' },
  { id: 'numero',  label: 'Número' },
  { id: 'selecao', label: 'Seleção' },
];

export default function Trocas({ repetidas, onInc, onDec, pushToast }) {
  const [filtro, setFiltro]   = useState('todas');
  const [ordenar, setOrdenar] = useState('extras');

  const totalExtras = repetidas.reduce((a, r) => a + r.extras, 0);

  const filtrada = useMemo(() => {
    let arr = [...repetidas];
    if (filtro === 'especiais') arr = arr.filter((r) => r.id.startsWith('FWC-'));
    if (filtro === 'selecoes')  arr = arr.filter((r) => !r.id.startsWith('FWC-'));
    if (ordenar === 'numero')   arr.sort((a, b) => a.numero - b.numero);
    if (ordenar === 'selecao')  arr.sort((a, b) => (a.info.titulo || '').localeCompare(b.info.titulo || ''));
    return arr;
  }, [repetidas, filtro, ordenar]);

  const copiarLista = () => {
    if (filtrada.length === 0) return;
    const texto = ['🎽 LISTA DE TROCA — FIFA WORLD CUP 2026', '']
      .concat(filtrada.map((r) =>
        `${String(r.numero).padStart(3, '0')} • ${r.info.emoji} ${r.info.titulo} (${r.info.sub}) — ${r.extras}x`
      ))
      .join('\n');
    navigator.clipboard?.writeText(texto)
      .then(() => pushToast('Lista copiada!', 'emerald'))
      .catch(() => pushToast('Não foi possível copiar', 'rose'));
  };

  if (repetidas.length === 0) {
    return (
      <div className="text-center py-20">
        <Repeat2 className="w-14 h-14 mx-auto mb-4 text-stone-700" />
        <div className="text-stone-300 font-bold mb-1">Nenhuma repetida ainda</div>
        <div className="text-stone-500 text-sm">
          Quando você marcar a mesma figurinha 2× ou mais ela vai aparecer aqui
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-amber-500/40 p-5 bg-gradient-to-br from-amber-900/30 via-stone-900 to-stone-950">
        <div className="absolute right-4 top-4">
          <Shuffle className="w-8 h-8 text-amber-400/30" />
        </div>
        <div className="text-[10px] text-amber-400 font-bold tracking-[0.2em] mb-1">PARA TROCAR</div>
        <div className="flex items-baseline gap-2">
          <div className="text-5xl font-black text-amber-400">{fmtNum(totalExtras)}</div>
          <div className="text-sm text-stone-400">figurinha{totalExtras !== 1 ? 's' : ''} extras</div>
        </div>
        <div className="text-xs text-stone-400 mt-1">{repetidas.length} tipos diferentes</div>
        <button
          onClick={copiarLista}
          className="mt-4 px-4 py-2 rounded-lg bg-amber-400 text-stone-950 text-xs font-bold hover:bg-amber-300 transition flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" /> Copiar lista para troca
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-stone-900 rounded-xl p-1 ring-1 ring-stone-800">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition ${
                filtro === f.id ? 'bg-amber-400 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-stone-900 rounded-xl p-1 ring-1 ring-stone-800 ml-auto">
          <span className="text-[10px] text-stone-500 px-2">ORDENAR</span>
          {ORDENS.map((o) => (
            <button
              key={o.id}
              onClick={() => setOrdenar(o.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${
                ordenar === o.id ? 'bg-stone-700 text-amber-400' : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-1.5">
        {filtrada.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 p-3 bg-stone-900 ring-1 ring-stone-800 rounded-xl hover:ring-amber-500/30 transition"
          >
            <div className="w-10 h-12 rounded-md bg-stone-950 ring-1 ring-amber-400/40 flex flex-col items-center justify-center shrink-0">
              <span className="text-[8px] text-amber-400 font-bold">Nº</span>
              <span className="text-sm font-black text-amber-400 leading-none">{r.numero}</span>
            </div>
            <span className="text-2xl">{r.info.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{r.info.titulo}</div>
              <div className="text-xs text-stone-400">{r.info.sub}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-amber-400 font-bold mb-1">{r.extras}x troca</div>
              <div className="flex items-center gap-1 bg-stone-950 rounded-full p-0.5">
                <button
                  onClick={() => onDec(r.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-stone-800"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-bold text-xs tabular-nums">{r.qtd}</span>
                <button
                  onClick={() => onInc(r.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-400 text-stone-950"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
