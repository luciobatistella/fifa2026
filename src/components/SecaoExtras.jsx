import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Celula from './Celula.jsx';
import { CATEGORIAS_EXTRAS } from '../data/especiais.js';

export default function SecaoExtras({ colecao, prog, onInc, onDec, filtro = 'todas' }) {
  const [aberto, setAberto] = useState(true);

  const matchFiltro = (qtd) => {
    if (filtro === 'completas')    return qtd >= 1;
    if (filtro === 'incompletas')  return qtd === 0;
    if (filtro === 'comRepetidas') return qtd > 1;
    return true;
  };

  const catsFiltradas = CATEGORIAS_EXTRAS.filter((cat) => matchFiltro(colecao[`${cat.prefix}-1`] || 0));

  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-yellow-500/30 bg-gradient-to-br from-yellow-950/40 via-stone-950 to-stone-950">
      {/* Header */}
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-yellow-500/5 transition"
      >
        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 ring-1 ring-yellow-500/40 flex items-center justify-center text-2xl">
          ✨
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-[0.2em] text-yellow-400">EXTRAS</div>
          <div className="text-sm text-stone-300">
            REGU · BRONZE · PRATA · OURO — figurinhas raras
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-base font-black text-yellow-400">
            {prog.tem}<span className="text-stone-600">/{prog.total}</span>
          </div>
          <div className="text-[10px] text-stone-500">{prog.perc.toFixed(0)}%</div>
        </div>
        <ChevronRight className={`w-5 h-5 text-stone-500 transition-transform ${aberto ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {aberto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {catsFiltradas.length === 0 ? (
                <div className="text-center text-stone-500 text-xs py-6">
                  Nenhuma figurinha neste filtro.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {catsFiltradas.map((cat) => {
                    const id = `${cat.prefix}-1`;
                    const qtd = colecao[id] || 0;
                    return (
                      <div
                        key={cat.id}
                        className={`rounded-xl ring-1 bg-gradient-to-br ${cat.cor} p-3 flex flex-col items-center gap-2`}
                      >
                        <div className="text-[10px] font-bold tracking-[0.2em] text-stone-300">
                          {cat.nome.toUpperCase()}
                        </div>
                        <Celula
                          numero={1}
                          emoji={cat.emoji}
                          titulo={`Extra ${cat.nome} · ${cat.prefix} 1`}
                          qtd={qtd}
                          onInc={() => onInc(id)}
                          onDec={() => onDec(id)}
                        />
                        <div className={`text-[10px] font-mono ${cat.badgeCor}`}>
                          {cat.prefix}-1
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-4 pb-4 text-[10px] text-stone-500 flex items-center gap-3">
              <span><b className="text-stone-300">Toque</b> para adicionar</span>
              <span><b className="text-stone-300">Pressione e segure</b> (ou botão direito) para remover</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
