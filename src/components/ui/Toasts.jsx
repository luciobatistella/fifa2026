import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TONES = {
  amber:   'bg-amber-400/15   ring-amber-400/40   text-amber-300',
  emerald: 'bg-emerald-400/15 ring-emerald-400/40 text-emerald-300',
  rose:    'bg-rose-400/15    ring-rose-400/40    text-rose-300',
  indigo:  'bg-indigo-400/15  ring-indigo-400/40  text-indigo-300',
};

export default function Toasts({ toasts }) {
  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.85 }}
            animate={{ opacity: 1, x: 0,  scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`px-3.5 py-2 rounded-lg backdrop-blur-md ring-1 text-xs font-bold shadow-2xl pointer-events-auto ${TONES[t.tone] || TONES.amber}`}
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
