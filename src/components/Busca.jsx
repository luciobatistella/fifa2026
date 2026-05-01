import React, { useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import FigurinhaCard from './FigurinhaCard.jsx';
import { rotuloFigurinha } from '../lib/figurinhas.js';
import { parseId, normalizeId } from '../data/album.js';
import { SELECOES, TOTAL_ESPECIAIS, TOTAL_FIGURINHAS, FIGURINHAS_POR_SELECAO } from '../data/selecoes.js';

export default function Busca({ busca, setBusca, colecao, onInc, onDec }) {
  const inputRef  = useRef(null);
  const buscaUpper = busca.toUpperCase().trim();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const resultados = useMemo(() => {
    if (!buscaUpper) return [];
    const r = [];

    // Por id direto: "BRA-5", "FWC 12", "IRQ-9"
    const idDir = normalizeId(buscaUpper);
    if (idDir) {
      const info = rotuloFigurinha(idDir);
      if (info.kind !== 'unknown') r.push({ id: idDir, info, numero: parseId(idDir).number });
    }

    // Por seleção
    SELECOES.forEach((s, idxSel) => {
      if (s.nome.toUpperCase().includes(buscaUpper) || s.codigo.includes(buscaUpper)) {
        for (let i = 1; i <= FIGURINHAS_POR_SELECAO; i++) {
          const id = `${s.codigo}-${i}`;
          if (r.some((x) => x.id === id)) continue;
          r.push({ id, info: rotuloFigurinha(id), numero: i });
        }
      }
    });

    // Por "FWC" / "ESP" (alias)
    if ('ESPECIAIS FWC FIFA'.includes(buscaUpper) || buscaUpper === 'ESP' || buscaUpper === 'FWC') {
      for (let i = 1; i <= TOTAL_ESPECIAIS; i++) {
        const id = `FWC-${i}`;
        if (!r.some((x) => x.id === id)) r.push({ id, info: rotuloFigurinha(id), numero: i });
      }
    }

    return r.slice(0, 60);
  }, [buscaUpper]);

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
        <input
          ref={inputRef}
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Número (1–980), nome de seleção ou ESP"
          className="w-full pl-11 pr-11 py-3.5 bg-stone-900 ring-1 ring-stone-800 rounded-xl text-sm focus:outline-none focus:ring-amber-400 placeholder-stone-500"
        />
        {busca && (
          <button
            onClick={() => setBusca('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-stone-800 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-stone-500" />
          </button>
        )}
      </div>

      {!buscaUpper && (
        <div className="text-center py-16 text-stone-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <div className="text-sm">
            Digite <b className="text-stone-300">245</b>, <b className="text-stone-300">Brasil</b> ou <b className="text-stone-300">ESP</b>
          </div>
          <div className="text-[11px] mt-2">{TOTAL_FIGURINHAS} figurinhas • {SELECOES.length} seleções</div>
        </div>
      )}

      {buscaUpper && resultados.length === 0 && (
        <div className="text-center py-12 text-stone-500 text-sm">Nenhum resultado encontrado</div>
      )}

      <div className="space-y-1.5">
        {resultados.map((r) => (
          <FigurinhaCard
            key={r.id}
            id={r.id}
            numero={r.numero}
            rotulo={r.info.titulo}
            info={r.info}
            qtd={colecao[r.id] || 0}
            onInc={() => onInc(r.id)}
            onDec={() => onDec(r.id)}
          />
        ))}
      </div>
    </div>
  );
}
