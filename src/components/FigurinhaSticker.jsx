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

  const ringClass = repetida
    ? 'ring-amber-400 shadow-lg shadow-amber-900/40'
    : tem
      ? 'ring-emerald-500 shadow-lg shadow-emerald-900/40'
      : 'ring-red-900/60 opacity-60';

  const bgClass = repetida
    ? 'bg-gradient-to-b from-amber-950/60 to-stone-950'
    : tem
      ? 'bg-gradient-to-b from-emerald-950/60 to-stone-950'
      : 'bg-stone-950';

  const numColor = repetida ? 'text-amber-300' : tem ? 'text-emerald-200' : 'text-white';
  const nomeColor = repetida ? 'text-amber-200' : tem ? 'text-emerald-100' : 'text-white/90';
  const extras = qtd > 1 ? qtd - 1 : 0;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.05, y: -3, zIndex: 10 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className={`relative w-full aspect-[2/3] rounded-xl flex flex-col overflow-hidden ring-2 transition-colors select-none ${ringClass}`}
    >
      {/* Fundo */}
      <div className={`absolute inset-0 transition-colors ${bgClass}`} />

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

      {/* Bandeira marca d'água (quando coletada) */}
      {tem && selecao?.bandeira && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <Bandeira emoji={selecao.bandeira} size={120} />
        </div>
      )}

      {/* Faixa topo — bandeirinha + badge repetidas */}
      <div className="relative z-10 flex items-start justify-between px-1.5 pt-1.5 pb-1 min-h-[20px]">
        {tem && selecao?.bandeira ? (
          <Bandeira emoji={selecao.bandeira} size={16} className="rounded-sm shrink-0 opacity-90" />
        ) : <span />}

        {extras > 0 && (
          <span className="ml-auto bg-amber-400 text-stone-950 rounded-full px-1.5 py-0.5 text-[8px] font-black leading-none shadow-md">
            +{extras} REP
          </span>
        )}
      </div>

      {/* Área central — número e nome SEMPRE grandes */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleInc}
        className="relative flex-1 flex flex-col items-center justify-center z-10 w-full gap-2 px-1"
      >
        <span className={`text-5xl font-black leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] ${numColor}`}>
          {numero}
        </span>
        <span className={`text-xs font-bold text-center leading-tight line-clamp-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] px-1 ${nomeColor}`}>
          {rotulo}
        </span>

        <AnimatePresence>
          {burst > 0 && <Sparkles key={burst} count={10} radius={28} size={3} />}
        </AnimatePresence>
      </motion.button>

      {/* Rodapé — botões + / − */}
      <div className="relative z-10 px-1 pb-1.5 flex flex-col items-center gap-1">
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
              repetida ? 'text-amber-400' : tem ? 'text-emerald-400' : 'text-stone-600'
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
