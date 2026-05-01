import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, Wand2 } from 'lucide-react';
import { sfx, sfxState } from '../lib/sfx.js';

export default function FAB({ onPacote, onQuick }) {
  const [aberto, setAberto] = useState(false);

  const toggle = () => { sfxState.unlock(); sfx.tick(); setAberto((v) => !v); };
  const fire = (fn, s) => () => { sfxState.unlock(); sfx[s](); setAberto(false); fn(); };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
      <AnimatePresence>
        {aberto && (
          <>
            <motion.button
              key="b1"
              initial={{ opacity: 0, y: 20, scale: 0.7 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.05 }}
              whileHover={{ scale: 1.05, x: -4 }}
              onClick={fire(onPacote, 'pack')}
              className="px-4 py-3 rounded-full bg-stone-900/95 backdrop-blur ring-1 ring-amber-500/50 text-amber-400 text-xs font-bold flex items-center gap-2 shadow-2xl shine"
            >
              <Package className="w-4 h-4" /> Abrir pacote
            </motion.button>
            <motion.button
              key="b2"
              initial={{ opacity: 0, y: 20, scale: 0.7 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              whileHover={{ scale: 1.05, x: -4 }}
              onClick={fire(onQuick, 'swoosh')}
              className="px-4 py-3 rounded-full bg-stone-900/95 backdrop-blur ring-1 ring-emerald-500/50 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-2xl shine"
            >
              <Wand2 className="w-4 h-4" /> Adicionar códigos
            </motion.button>
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: aberto ? 135 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className="relative w-16 h-16 rounded-full text-stone-950 flex items-center justify-center ring-2 ring-amber-300/60 glow-amber"
        style={{ background: 'radial-gradient(circle at 30% 30%, #fde047, #f59e0b 70%)' }}
      >
        <Plus className="w-7 h-7" strokeWidth={3} />
      </motion.button>
    </div>
  );
}
