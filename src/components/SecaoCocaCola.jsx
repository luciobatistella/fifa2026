import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Celula from './Celula.jsx';
import { CATEGORIAS_CC, infoCocaCola } from '../data/especiais.js';

export default function SecaoCocaCola({ colecao, prog, onInc, onDec }) {
  const [aberto, setAberto] = useState(true);

  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-red-500/30 bg-gradient-to-br from-red-950/40 via-stone-950 to-stone-950">
      {/* Header */}
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-red-500/5 transition"
      >
        <div className="w-12 h-12 rounded-xl bg-red-500/20 ring-1 ring-red-500/40 flex items-center justify-center text-2xl">
          🥤
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-[0.2em] text-red-400">COCA-COLA</div>
          <div className="text-sm text-stone-300">
            CC-1 a CC-14 · Página especial patrocinada
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-base font-black text-red-400">
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
            <div className="px-4 pb-4 space-y-4">
              {CATEGORIAS_CC.map((cat) => {
                const [a, b] = cat.range;
                const itens = Array.from({ length: b - a + 1 }, (_, k) => a + k);
                const tem = itens.filter((i) => (colecao[`CC-${i + 1}`] || 0) > 0).length;
                return (
                  <div key={cat.id} className={`rounded-xl ring-1 bg-gradient-to-br ${cat.cor} p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl leading-none drop-shadow">{cat.emoji}</span>
                        <div>
                          <div className="text-xs font-bold tracking-wider text-stone-100">{cat.nome.toUpperCase()}</div>
                          <div className="text-[10px] text-stone-400">CC-{a + 1} a CC-{b + 1}</div>
                        </div>
                      </div>
                      <div className="font-mono text-sm font-bold text-stone-200">
                        {tem}<span className="text-stone-500">/{itens.length}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-1.5">
                      {itens.map((i) => {
                        const id = `CC-${i + 1}`;
                        const qtd = colecao[id] || 0;
                        const info = infoCocaCola(i);
                        return (
                          <Celula
                            key={id}
                            numero={i + 1}
                            emoji={info.emoji}
                            titulo={`${info.nome} · CC ${i + 1}`}
                            qtd={qtd}
                            onInc={() => onInc(id)}
                            onDec={() => onDec(id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
