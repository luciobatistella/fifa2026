import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sparkles from './effects/Sparkles.jsx';
import { sfx, sfxState } from '../lib/sfx.js';

/**
 * Célula compacta (grids tipo heatmap / especiais).
 * Toque/clique = +1; press-and-hold ou botão direito = -1.
 */
export default function Celula({ numero, qtd, onInc, onDec, emoji, titulo }) {
  const timer = useRef(null);
  const [burst, setBurst] = useState(0);

  const inc = () => { sfxState.unlock(); qtd === 0 ? sfx.pop() : sfx.cling(); setBurst((b) => b + 1); onInc(); };
  const dec = () => { sfxState.unlock(); sfx.blop(); onDec(); };

  const handleDown = () => { timer.current = setTimeout(() => { dec(); timer.current = null; }, 500); };
  const handleUp   = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; inc(); } };
  const handleLeave = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };

  const tem = qtd > 0;
  const cor = qtd > 1 ? 'bg-amber-400 text-stone-950 ring-amber-300'
            : tem      ? 'bg-emerald-500 text-stone-950 ring-emerald-400'
                       : 'bg-stone-800/80 text-stone-500 ring-stone-700';

  return (
    <motion.button
      layout
      whileHover={{ scale: 1.12, zIndex: 1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      onMouseDown={handleDown} onMouseUp={handleUp} onMouseLeave={handleLeave}
      onTouchStart={handleDown} onTouchEnd={handleUp}
      onContextMenu={(e) => { e.preventDefault(); dec(); }}
      title={titulo}
      className={`relative aspect-square rounded-md flex items-center justify-center font-bold ring-1 ${cor} ${emoji ? 'text-2xl leading-none' : 'text-[10px]'}`}
    >
      <span className={emoji ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]' : ''}>{emoji || numero}</span>
      {emoji && (
        <span className="absolute bottom-0 right-0.5 text-[8px] font-mono text-stone-950/80">
          {numero}
        </span>
      )}
      {qtd > 1 && (
        <span className="absolute -top-1 -right-1 text-[8px] bg-stone-950 text-amber-400 rounded-full px-1 ring-1 ring-amber-400">
          ×{qtd}
        </span>
      )}
      <AnimatePresence>
        {burst > 0 && <Sparkles key={burst} count={8} radius={22} size={3} />}
      </AnimatePresence>
    </motion.button>
  );
}
