import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Star } from 'lucide-react';
import Sparkles from './effects/Sparkles.jsx';
import Bandeira from './ui/Bandeira.jsx';
import { sfx, sfxState } from '../lib/sfx.js';

/**
 * Card grande de figurinha (com nome, número, contador).
 * `info`: objeto opcional retornado por rotuloFigurinha (sub, kind, selecao, emoji)
 */
export default function FigurinhaCard({ id, numero, rotulo, info, qtd, onInc, onDec, destaque }) {
  const [burst, setBurst] = useState(0);
  const tem      = qtd > 0;
  const repetida = qtd > 1;
  const stateClass = tem
    ? repetida ? 'bg-amber-950/30 ring-amber-500/40'
               : 'bg-emerald-950/30 ring-emerald-500/40'
    : 'bg-stone-900/70 ring-stone-800';

  const handleInc = () => {
    sfxState.unlock();
    if (qtd === 0) sfx.pop(); else sfx.cling();
    setBurst((b) => b + 1);
    onInc();
  };
  const handleDec = () => { sfxState.unlock(); sfx.blop(); onDec(); };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      className={`relative flex items-center gap-3 p-3 rounded-xl ring-1 transition-colors ${stateClass}`}
    >
      <motion.div
        animate={burst ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.45 }}
        className={`relative w-12 h-14 rounded-md flex flex-col items-center justify-center shrink-0 ${
          tem ? 'bg-stone-950 ring-1 ring-amber-400/40' : 'bg-stone-800'
        } ${destaque ? 'ring-2 ring-amber-400' : ''}`}
      >
        <span className={`text-[8px] font-bold tracking-wider ${tem ? 'text-amber-400' : 'text-stone-600'}`}>
          {info?.code ? info.code.split(' ')[0] : 'Nº'}
        </span>
        <span className={`text-base font-black leading-none ${tem ? 'text-amber-400' : 'text-stone-600'}`}>{numero}</span>
        {destaque && <Star className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 fill-amber-400" />}
        <AnimatePresence>
          {burst > 0 && <Sparkles key={burst} count={10} />}
        </AnimatePresence>
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {info?.selecao && (
            <Bandeira emoji={info.selecao.bandeira} size={18} className="rounded-sm shrink-0" />
          )}
          {info?.kind === 'special' && info?.emoji && (
            <span className="text-base leading-none shrink-0">{info.emoji}</span>
          )}
          <div className="text-sm font-bold truncate">{rotulo}</div>
        </div>
        {info?.sub && (
          <div className="text-[10px] text-stone-500 truncate">{info.sub}</div>
        )}
        <div className="text-xs text-stone-400">
          {qtd === 0 && <span>Não tenho</span>}
          {qtd === 1 && <span className="text-emerald-400 font-semibold">Tenho ✓</span>}
          {qtd > 1  && <span className="text-amber-400 font-semibold">Tenho • {qtd - 1} repetida{qtd - 1 > 1 ? 's' : ''}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1 bg-stone-950 rounded-full p-0.5 ring-1 ring-stone-800">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleDec}
          disabled={qtd === 0}
          className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-stone-800"
        >
          <Minus className="w-4 h-4" />
        </motion.button>
        <motion.span
          key={qtd}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-8 text-center font-bold text-sm tabular-nums"
        >
          {qtd}
        </motion.span>
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.85 }}
          onClick={handleInc}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-400 text-stone-950 hover:bg-amber-300"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
        </motion.button>
      </div>
    </motion.div>
  );
}
