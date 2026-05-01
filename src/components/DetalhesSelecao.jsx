import React, { useMemo, useState } from 'react';
import { ChevronLeft, LayoutList, LayoutGrid } from 'lucide-react';
import FigurinhaCard from './FigurinhaCard.jsx';
import FigurinhaSticker from './FigurinhaSticker.jsx';
import Bandeira from './ui/Bandeira.jsx';
import { FIGURINHAS_POR_SELECAO, BADGE_POS, TEAM_PHOTO_POS, indiceJogador } from '../data/selecoes.js';
import { nomeJogador } from '../data/jogadores.js';

const FILTROS = [
  { id: 'todas',     label: 'Todas' },
  { id: 'tenho',     label: 'Tenho' },
  { id: 'faltam',    label: 'Faltam' },
  { id: 'repetidas', label: 'Repetidas' },
];

export default function DetalhesSelecao({ selecao, colecao, filtro, setFiltro, onInc, onDec, onVoltar }) {
  const [vista, setVista] = useState('grade');
  let tem = 0, rep = 0;
  for (let i = 1; i <= FIGURINHAS_POR_SELECAO; i++) {
    const q = colecao[`${selecao.codigo}-${i}`] || 0;
    if (q > 0) tem++;
    if (q > 1) rep += q - 1;
  }
  const perc = (tem / FIGURINHAS_POR_SELECAO) * 100;

  const figurinhas = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= FIGURINHAS_POR_SELECAO; i++) {
      const id = `${selecao.codigo}-${i}`;
      const qtd = colecao[id] || 0;
      const isBadge = i === BADGE_POS;
      const isExtra = i === TEAM_PHOTO_POS;
      const idxJog  = indiceJogador(i);
      const rotulo = isBadge ? `Escudo · ${selecao.nome}`
                  : isExtra ? 'Foto da Equipe'
                  : (nomeJogador(selecao.codigo, i) || `Jogador #${(idxJog ?? 0) + 1}`);
      const kind = isBadge ? 'badge' : isExtra ? 'extra' : 'player';
      arr.push({ id, idx: i, qtd, rotulo, kind });
    }
    return arr.filter((f) => {
      if (filtro === 'tenho')     return f.qtd > 0;
      if (filtro === 'faltam')    return f.qtd === 0;
      if (filtro === 'repetidas') return f.qtd > 1;
      return true;
    });
  }, [selecao, colecao, filtro]);

  const contadores = {
    todas: FIGURINHAS_POR_SELECAO,
    tenho: tem,
    faltam: FIGURINHAS_POR_SELECAO - tem,
    repetidas: Object.entries(colecao).filter(([id, q]) => id.startsWith(selecao.codigo + '-') && q > 1).length,
  };

  return (
    <div>
      <button
        onClick={onVoltar}
        className="text-xs text-stone-400 mb-4 flex items-center gap-1 hover:text-amber-400 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar para o álbum
      </button>

      {/* Header da seleção */}
      <div className="relative overflow-hidden rounded-2xl p-6 mb-4 min-h-[180px] bg-stone-950">
        {/* Bandeira como background expandido */}
        <div className="absolute inset-0 select-none pointer-events-none overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 blur-[2px]">
            <Bandeira emoji={selecao.bandeira} size={600} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/70 to-stone-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/30" />
        </div>

        <div className="relative flex items-center gap-5">
          <Bandeira emoji={selecao.bandeira} size={88} title={selecao.nome} className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]" />
          <div className="min-w-0">
            <div className="text-[10px] tracking-[0.25em] text-amber-400 font-bold drop-shadow">GRUPO {selecao.grupo}</div>
            <div className="text-2xl sm:text-3xl font-black leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{selecao.nome}</div>
            <div className="text-[10px] text-stone-300 mt-0.5 drop-shadow">{FIGURINHAS_POR_SELECAO} figurinhas • Escudo + Foto da Equipe + 18 jogadores</div>
          </div>
          <div className="ml-auto text-right shrink-0">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 leading-none tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {tem}<span className="text-stone-400 text-2xl">/{FIGURINHAS_POR_SELECAO}</span>
            </div>
            <div className="text-xs text-stone-300 mt-1 drop-shadow">
              {perc.toFixed(0)}%{rep > 0 && <span className="text-emerald-400"> • +{rep} rep.</span>}
            </div>
          </div>
        </div>
        <div className="relative mt-4 h-2 bg-stone-950/70 rounded-full overflow-hidden ring-1 ring-white/10 backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${perc}%` }}
          />
        </div>
      </div>

      {/* Filtros + Toggle de vista */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1 bg-stone-900 rounded-xl p-1 ring-1 ring-stone-800">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all ${
                filtro === f.id
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {f.label} <span className="opacity-60">{contadores[f.id]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 bg-stone-900 rounded-xl p-1 ring-1 ring-stone-800 ml-auto">
          <button
            onClick={() => setVista('lista')}
            title="Vista em lista"
            className={`p-1.5 rounded-lg transition-all ${
              vista === 'lista'
                ? 'bg-amber-400 text-stone-950'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setVista('grade')}
            title="Vista em grade"
            className={`p-1.5 rounded-lg transition-all ${
              vista === 'grade'
                ? 'bg-amber-400 text-stone-950'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista */}
      {vista === 'lista' && (
        <div className="space-y-1.5">
          {figurinhas.length === 0 && (
            <div className="text-center text-sm text-stone-500 py-10">Nenhuma figurinha neste filtro</div>
          )}
          {figurinhas.map((f) => (
            <FigurinhaCard
              key={f.id}
              id={f.id}
              numero={f.idx}
              rotulo={f.rotulo}
              info={{ selecao, kind: f.kind, sub: f.kind === 'badge' ? 'Escudo da seleção' : `${selecao.nome} · #${f.idx}` }}
              qtd={f.qtd}
              destaque={f.kind === 'badge'}
              onInc={() => onInc(f.id)}
              onDec={() => onDec(f.id)}
            />
          ))}
        </div>
      )}

      {/* Grade */}
      {vista === 'grade' && (
        <div>
          {figurinhas.length === 0 && (
            <div className="text-center text-sm text-stone-500 py-10">Nenhuma figurinha neste filtro</div>
          )}
          <div className="grid grid-cols-4 gap-3">
            {figurinhas.map((f) => (
              <FigurinhaSticker
                key={f.id}
                numero={f.idx}
                rotulo={f.rotulo}
                kind={f.kind}
                selecao={selecao}
                qtd={f.qtd}
                onInc={() => onInc(f.id)}
                onDec={() => onDec(f.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
