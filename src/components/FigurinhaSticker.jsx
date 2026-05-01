import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import Sparkles from './effects/Sparkles.jsx';
import Bandeira from './ui/Bandeira.jsx';
import { sfx, sfxState } from '../lib/sfx.js';
import fundoFigurinha from '../fundo_figurinha.png';

/**
 * Card no formato de figurinha Panini para a vista em grade.
 * Clique no card = +1. Botões + e − no rodapé controlam a quantidade.
 */
export default function FigurinhaSticker({ numero, rotulo, kind, selecao, qtd, onInc, onDec }) {
  const [burst, setBurst] = useState(0);

  const tem      = qtd > 0;
  const repetida = qtd > 1;

  const handleInc = (e) => {
    e.stopPropagation();
    sfxState.unlock();
    qtd === 0 ? sfx.pop() : sfx.cling();
    setBurst((b) => b + 1);
    onInc();
  };

  const handleDec = (e) => {
    e.stopPropagation();
    if (qtd === 0) return;
    sfxState.unlock();
    sfx.blop();
    onDec();
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.05, y: -3, zIndex: 10 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className={`relative w-full aspect-[2/3] rounded-xl flex flex-col overflow-hidden ring-2 transition-colors select-none
        ${tem
          ? 'ring-emerald-500 shadow-lg shadow-emerald-900/40'
          : 'ring-red-900/60 opacity-60'
        }
      `}
    >
      {/* Fundo */}
      <div
        className={`absolute inset-0 transition-colors ${
          tem
            ? 'bg-gradient-to-b from-emerald-950/60 to-stone-950'
            : 'bg-stone-950'
        }`}
      />

      {/* PNG de fundo para figurinhas faltando */}
      {!tem && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${fundoFigurinha})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.55,
          }}
        />
      )}

      {/* Faixa topo — número (só quando tem) + badge repetidas */}
      <div className="relative z-10 flex items-center justify-between px-1.5 pt-1.5 pb-1">
        {tem && (
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 bg-emerald-400 text-stone-950">
            {numero}
          </span>
        )}

        {repetida && (
          <span className="ml-auto bg-amber-400 text-stone-950 rounded-full px-1 text-[7px] font-black leading-4">
            ×{qtd}
          </span>
        )}
      </div>

      {/* Área central */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleInc}
        className="relative flex-1 flex flex-col items-center justify-center z-10 w-full gap-1 px-1"
      >
        {tem ? (
          <div>
            {kind === 'badge' ? (
              <Bandeira emoji={selecao.bandeira} size={52} className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]" />
            ) : kind === 'extra' ? (
              <div className="flex flex-col items-center gap-0.5">
                <Bandeira emoji={selecao.bandeira} size={40} />
                <span className="text-[7px] text-stone-400 font-bold tracking-wide">EQUIPE</span>
              </div>
            ) : (
              <Bandeira emoji={selecao.bandeira} size={38} className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
            )}
          </div>
        ) : (
          /* Figurinha faltando: número grande + nome em preto */
          <div className="flex flex-col items-center gap-8 px-1">
            <span className="text-5xl font-black text-white leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{numero}</span>
            <span className="text-xs font-bold text-white/90 text-center leading-tight line-clamp-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{rotulo}</span>
          </div>
        )}

        <AnimatePresence>
          {burst > 0 && <Sparkles key={burst} count={10} radius={28} size={3} />}
        </AnimatePresence>
      </motion.button>

      {/* Rodapé — nome (só quando tem) + botões + / − */}
      <div className="relative z-10 px-1 pb-1.5 flex flex-col items-center gap-1">
        {tem && (
          <div className="text-[8px] font-bold leading-tight line-clamp-1 text-center w-full text-emerald-300">
            {rotulo}
          </div>
        )}

        <div className="flex items-center gap-0.5 w-full justify-center">
          <button
            onClick={handleDec}
            disabled={qtd === 0}
            className="w-5 h-5 rounded-full flex items-center justify-center bg-stone-800 text-stone-300 disabled:opacity-20 hover:bg-stone-700 active:scale-90 transition"
          >
            <Minus className="w-2.5 h-2.5" strokeWidth={3} />
          </button>

          <motion.span
            key={qtd}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`w-5 text-center text-[10px] font-black tabular-nums ${
              tem ? 'text-emerald-400' : 'text-stone-600'
            }`}
          >
            {qtd}
          </motion.span>

          <button
            onClick={handleInc}
            className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500 text-stone-950 hover:bg-emerald-400 active:scale-90 transition"
          >
            <Plus className="w-2.5 h-2.5" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Overlay sutil quando coletada */}
      {tem && (
        <div className="absolute inset-0 pointer-events-none rounded-xl ring-inset ring-1 ring-emerald-400/20" />
      )}
    </motion.div>
  );
}
