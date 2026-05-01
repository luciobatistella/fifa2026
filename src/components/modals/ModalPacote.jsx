import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Sparkles, X, Check } from 'lucide-react';
import Scanner from '../Scanner.jsx';
import { rotuloFigurinha } from '../../lib/figurinhas.js';
import { sfx } from '../../lib/sfx.js';

export default function ModalPacote({ aberto, onFechar, onConfirmar, figurinhasPorPacote = 7 }) {
  const [itens, setItens] = useState([]);

  useEffect(() => {
    if (aberto) setItens([]);
  }, [aberto]);

  const handleDetectar = useCallback((ids) => {
    setItens((prev) => {
      if (prev.length >= figurinhasPorPacote) return prev;
      const novos = [...prev];
      for (const id of ids) {
        if (novos.length >= figurinhasPorPacote) break;
        novos.push({ id, info: rotuloFigurinha(id), key: `${id}-${Date.now()}-${Math.random()}` });
      }
      return novos;
    });
  }, [figurinhasPorPacote]);

  const remover = useCallback((key) => {
    setItens((prev) => prev.filter((it) => it.key !== key));
    sfx.tick();
  }, []);

  const confirmar = useCallback(() => {
    if (itens.length === 0) return;
    onConfirmar(itens.map((it) => it.id));
  }, [itens, onConfirmar]);

  const cheio = itens.length >= figurinhasPorPacote;

  return (
    <>
      <Scanner
        aberto={aberto}
        onFechar={onFechar}
        onDetectar={cheio ? undefined : handleDetectar}
        hideBottom
      />

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[62] pointer-events-none"
          >
            <div className="max-w-md mx-auto px-3 pb-4 space-y-3 pointer-events-auto">

              {/* Progress dots */}
              <div className="bg-black/70 backdrop-blur-md ring-1 ring-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-stone-300">
                      Pacote
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      key={itens.length}
                      initial={{ scale: 1.5, color: '#fbbf24' }}
                      animate={{ scale: 1, color: '#f5f5f4' }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl font-black font-mono leading-none"
                    >
                      {itens.length}
                    </motion.span>
                    <span className="text-sm font-mono text-stone-500">/ {figurinhasPorPacote}</span>
                  </div>
                </div>

                {/* Slots */}
                <div className="flex gap-1.5">
                  {Array.from({ length: figurinhasPorPacote }).map((_, i) => {
                    const filled = i < itens.length;
                    return (
                      <motion.div
                        key={i}
                        className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${
                          filled ? 'bg-amber-400' : 'bg-stone-700'
                        }`}
                        animate={filled ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 0.25 }}
                      />
                    );
                  })}
                </div>

                {cheio ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-center text-[11px] text-amber-400 font-bold tracking-wide"
                  >
                    ✦ Pacote completo!
                  </motion.div>
                ) : (
                  <div className="mt-2 text-center text-[10px] text-stone-500">
                    Aponte para a etiqueta no verso da figurinha
                  </div>
                )}
              </div>

              {/* Badges */}
              <AnimatePresence>
                {itens.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto"
                  >
                    <AnimatePresence>
                      {itens.map((it) => (
                        <motion.div
                          key={it.key}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-stone-900/90 ring-1 ring-amber-400/40 backdrop-blur text-xs font-medium"
                        >
                          <span>{it.info?.emoji}</span>
                          <span className="font-mono text-amber-300">{it.info?.code || it.id}</span>
                          <button
                            onClick={() => remover(it.key)}
                            className="w-4 h-4 rounded-full bg-stone-700 hover:bg-rose-500 flex items-center justify-center transition-colors ml-0.5"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm button */}
              <button
                onClick={confirmar}
                disabled={itens.length === 0}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  itens.length > 0
                    ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 shadow-[0_8px_24px_-4px_rgba(251,191,36,0.5)]'
                    : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                }`}
              >
                {itens.length > 0 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmar {itens.length} figurinha{itens.length !== 1 ? 's' : ''}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Escaneie as figurinhas
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

