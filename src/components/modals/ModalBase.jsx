import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { sfx, sfxState } from '../../lib/sfx.js';
import { overlay, slideUpModal } from '../../lib/anims.js';

export default function ModalBase({
  aberto, onFechar, titulo, subtitulo, icone: Icone, children, footer, maxW = 'max-w-md',
}) {
  useEffect(() => {
    if (!aberto) return;
    sfxState.unlock();
    const onKey = (e) => { if (e.key === 'Escape') { sfx.close(); onFechar(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aberto, onFechar]);

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          {...overlay}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md"
          onClick={() => { sfx.close(); onFechar(); }}
        >
          <motion.div
            {...slideUpModal}
            onClick={(e) => e.stopPropagation()}
            className={`bg-stone-950 ring-1 ring-amber-500/20 rounded-t-3xl sm:rounded-2xl w-full ${maxW} max-h-[90vh] flex flex-col shadow-[0_30px_80px_-20px_rgba(245,158,11,0.4)]`}
          >
            <div className="flex items-center gap-3 p-4 border-b border-stone-800/80">
              {Icone && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
                  className="w-10 h-10 rounded-xl bg-amber-400/15 ring-1 ring-amber-400/40 flex items-center justify-center glow-amber"
                >
                  <Icone className="w-5 h-5 text-amber-400" />
                </motion.div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{titulo}</div>
                {subtitulo && <div className="text-[11px] text-stone-500">{subtitulo}</div>}
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                onClick={() => { sfx.close(); onFechar(); }}
                className="w-8 h-8 rounded-lg hover:bg-stone-800 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-stone-400" />
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
            {footer && <div className="p-4 border-t border-stone-800/80">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
