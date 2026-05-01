import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CATEGORIAS_CC, infoCocaCola } from '../data/especiais.js';
import { sfx, sfxState } from '../lib/sfx.js';
import Sparkles from './effects/Sparkles.jsx';

function CardCC({ numero, sigla, nome, qtd, onInc, onDec }) {
  const timer = useRef(null);
  const [burst, setBurst] = useState(0);

  const inc = () => { sfxState.unlock(); qtd === 0 ? sfx.pop() : sfx.cling(); setBurst((b) => b + 1); onInc(); };
  const dec = () => { sfxState.unlock(); sfx.blop(); onDec(); };
  const handleDown = () => { timer.current = setTimeout(() => { dec(); timer.current = null; }, 500); };
  const handleUp   = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; inc(); } };
  const handleLeave = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };

  const tem = qtd > 0;
  const cor = qtd > 1
    ? 'bg-amber-400/15 ring-amber-300/60 text-amber-100'
    : tem
      ? 'bg-emerald-500/15 ring-emerald-400/60 text-emerald-50'
      : 'bg-stone-800/60 ring-stone-700 text-stone-400';

  return (
    <motion.button
      layout
      whileHover={{ scale: 1.04, zIndex: 1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleLeave}
      onTouchStart={handleDown} onTouchEnd={handleUp}
      onContextMenu={(e) => { e.preventDefault(); dec(); }}
      title={`${nome} · CC-${numero}`}
      className={`relative rounded-lg ring-1 px-2 py-2 flex flex-col items-start gap-0.5 ${cor}`}
    >
      <div className="flex items-center justify-between w-full">
        <span className="font-mono text-[10px] font-bold tracking-wider opacity-80">CC-{numero}</span>
        <span className="font-mono text-[9px] font-bold opacity-70">{sigla}</span>
      </div>
      <div className="text-[11px] font-bold leading-tight text-left line-clamp-2">{nome}</div>
      {qtd > 1 && (
        <span className="absolute -top-1 -right-1 text-[9px] bg-stone-950 text-amber-400 rounded-full px-1.5 py-0.5 ring-1 ring-amber-400 font-bold">
          ×{qtd}
        </span>
      )}
      <AnimatePresence>
        {burst > 0 && <Sparkles key={burst} count={8} radius={22} size={3} />}
      </AnimatePresence>
    </motion.button>
  );
}

export default function SecaoCocaCola({ colecao, prog, onInc, onDec, filtro = 'todas' }) {
  const [aberto, setAberto] = useState(true);

  const matchFiltro = (qtd) => {
    if (filtro === 'completas')    return qtd >= 1;
    if (filtro === 'incompletas')  return qtd === 0;
    if (filtro === 'comRepetidas') return qtd > 1;
    return true;
  };

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
                const itensTodos = Array.from({ length: b - a + 1 }, (_, k) => a + k);
                const itens = itensTodos.filter((i) => matchFiltro(colecao[`CC-${i + 1}`] || 0));
                const tem = itensTodos.filter((i) => (colecao[`CC-${i + 1}`] || 0) > 0).length;
                if (itens.length === 0) return null;
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
                        {tem}<span className="text-stone-500">/{itensTodos.length}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {itens.map((i) => {
                        const id = `CC-${i + 1}`;
                        const qtd = colecao[id] || 0;
                        const info = infoCocaCola(i);
                        return (
                          <CardCC
                            key={id}
                            numero={i + 1}
                            sigla={info.sigla}
                            nome={info.nome}
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
