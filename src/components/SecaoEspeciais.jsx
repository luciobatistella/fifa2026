import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles as SparklesIcon, ChevronRight } from 'lucide-react';
import Celula from './Celula.jsx';
import { CATEGORIAS_ESPECIAIS, infoEspecial } from '../data/especiais.js';

export default function SecaoEspeciais({ colecao, prog, onInc, onDec }) {
  const [aberto, setAberto] = useState(true);   // ABRE por padrão
  const [catAtiva, setCatAtiva] = useState('todas');

  const cats = catAtiva === 'todas'
    ? CATEGORIAS_ESPECIAIS
    : CATEGORIAS_ESPECIAIS.filter((c) => c.id === catAtiva);

  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-amber-500/30 bg-gradient-to-br from-amber-950/40 via-stone-950 to-stone-950">
      {/* Header */}
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-amber-500/5 transition"
      >
        <div className="w-12 h-12 rounded-xl bg-amber-400/20 ring-1 ring-amber-400/40 flex items-center justify-center">
          <SparklesIcon className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-[0.2em] text-amber-400">FIGURINHAS ESPECIAIS</div>
          <div className="text-sm text-stone-300">
            🏆 Logos · 🦅 Mascotes · 🏟️ Estádios · 🌆 Cidades · ⚽ Lendas · 💎 Edição Limitada
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-base font-black text-amber-400">
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
            {/* Filtro de categorias */}
            <div className="px-4 pt-1 pb-3 flex flex-wrap gap-1.5">
              <FiltroChip ativo={catAtiva === 'todas'} onClick={() => setCatAtiva('todas')}>
                ✨ Todas <span className="text-stone-500">({prog.total})</span>
              </FiltroChip>
              {CATEGORIAS_ESPECIAIS.map((c) => {
                const [a, b] = c.range;
                const tem = Array.from({ length: b - a + 1 }).filter((_, k) => (colecao[`FWC-${a + k + 1}`] || 0) > 0).length;
                const tot = b - a + 1;
                return (
                  <FiltroChip key={c.id} ativo={catAtiva === c.id} onClick={() => setCatAtiva(c.id)}>
                    {c.emoji} {c.nome.split(' ')[0]}
                    <span className={`ml-1 ${tem === tot ? 'text-emerald-400' : 'text-stone-500'}`}>
                      {tem}/{tot}
                    </span>
                  </FiltroChip>
                );
              })}
            </div>

            {/* Grids por categoria */}
            <div className="px-4 pb-4 space-y-4">
              {cats.map((cat) => {
                const [a, b] = cat.range;
                const itens = Array.from({ length: b - a + 1 }, (_, k) => a + k);
                const tem = itens.filter((i) => (colecao[`FWC-${i + 1}`] || 0) > 0).length;
                return (
                  <div key={cat.id} className={`rounded-xl ring-1 bg-gradient-to-br ${cat.cor} p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl leading-none drop-shadow">{cat.emoji}</span>
                        <div>
                          <div className="text-xs font-bold tracking-wider text-stone-100">{cat.nome.toUpperCase()}</div>
                          <div className="text-[10px] text-stone-400">FWC-{a + 1} a FWC-{b + 1}</div>
                        </div>
                      </div>
                      <div className="font-mono text-sm font-bold text-stone-200">
                        {tem}<span className="text-stone-500">/{itens.length}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
                      {itens.map((i) => {
                        const id = `FWC-${i + 1}`;
                        const qtd = colecao[id] || 0;
                        const info = infoEspecial(i);
                        return (
                          <Celula
                            key={id}
                            numero={i + 1}
                            emoji={info.emoji}
                            titulo={`${info.nome} · FWC ${i + 1}`}
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

function FiltroChip({ ativo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2.5 py-1 rounded-full ring-1 transition font-medium ${
        ativo
          ? 'bg-amber-400 text-stone-950 ring-amber-300 shadow-[0_0_0_3px_rgba(251,191,36,0.15)]'
          : 'bg-stone-900/80 text-stone-300 ring-stone-700 hover:ring-amber-400/40 hover:text-amber-300'
      }`}
    >
      {children}
    </button>
  );
}
