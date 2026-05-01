import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Sparkles from './effects/Sparkles.jsx';
import { sfx, sfxState } from '../lib/sfx.js';
import { CATEGORIAS_EXTRAS } from '../data/especiais.js';

function CardExtra({ cat, qtd, onInc, onDec }) {
  const timer = useRef(null);
  const [burst, setBurst] = useState(0);

  const inc = () => { sfxState.unlock(); qtd === 0 ? sfx.pop() : sfx.cling(); setBurst((b) => b + 1); onInc(); };
  const dec = () => { sfxState.unlock(); sfx.blop(); onDec(); };

  const handleDown = () => { timer.current = setTimeout(() => { dec(); timer.current = null; }, 500); };
  const handleUp   = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; inc(); } };
  const handleLeave = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };

  const tem = qtd > 0;
  const corBadge = qtd > 1 ? 'bg-amber-400 text-stone-950 ring-amber-300'
                   : tem    ? 'bg-emerald-500 text-stone-950 ring-emerald-400'
                            : 'bg-stone-800/80 text-stone-500 ring-stone-700';

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleLeave}
      onTouchStart={handleDown} onTouchEnd={handleUp}
      onContextMenu={(e) => { e.preventDefault(); dec(); }}
      title={`Extra ${cat.nome} · ${cat.prefix} 1`}
      className={`relative rounded-xl ring-1 bg-gradient-to-br ${cat.cor} p-3 flex flex-col items-center gap-2 text-left select-none`}
    >
      <div className="text-[10px] font-bold tracking-[0.2em] text-stone-300">
        {cat.nome.toUpperCase()}
      </div>
      <div className={`relative aspect-square w-full max-w-[72px] rounded-md flex items-center justify-center font-bold ring-1 ${corBadge} text-3xl leading-none`}>
        <span className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">{cat.emoji}</span>
        <span className="absolute bottom-0 right-0.5 text-[8px] font-mono text-stone-950/80">1</span>
        {qtd > 1 && (
          <span className="absolute -top-1 -right-1 text-[8px] bg-stone-950 text-amber-400 rounded-full px-1 ring-1 ring-amber-400">
            ×{qtd}
          </span>
        )}
        <AnimatePresence>
          {burst > 0 && <Sparkles key={burst} count={8} radius={22} size={3} />}
        </AnimatePresence>
      </div>
      <div className={`text-[10px] font-mono ${cat.badgeCor}`}>
        {cat.prefix}-1
      </div>
    </motion.button>
  );
}

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
                      <CardExtra
                        key={cat.id}
                        cat={cat}
                        qtd={qtd}
                        onInc={() => onInc(id)}
                        onDec={() => onDec(id)}
                      />
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
