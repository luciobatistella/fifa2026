import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Trophy, Search, Repeat2, BarChart3 } from 'lucide-react';
import { sfx, sfxState } from '../lib/sfx.js';

const TABS = [
  { id: 'dashboard', label: 'Início',    icon: Layers },
  { id: 'selecoes',  label: 'Álbum',     icon: Trophy },
  { id: 'buscar',    label: 'Buscar',    icon: Search },
  { id: 'repetidas', label: 'Trocas',    icon: Repeat2 },
  { id: 'stats',     label: 'Stats',     icon: BarChart3 },
];

export default function Tabs({ aba, setAba }) {
  return (
    <nav className="sticky top-0 z-30 bg-[#050505]/85 backdrop-blur-xl border-b border-stone-800/80">
      <div className="max-w-5xl mx-auto flex">
        {TABS.map((t) => {
          const Icon = t.icon;
          const ativo = aba === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { sfxState.unlock(); sfx.tick(); setAba(t.id); }}
              className={`relative flex-1 py-3.5 px-2 text-[11px] font-bold tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-colors ${
                ativo ? 'text-amber-400' : 'text-stone-500 hover:text-stone-200'
              }`}
            >
              <motion.div
                animate={{ scale: ativo ? 1.15 : 1, rotate: ativo ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.4 }}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
              <span className="uppercase">{t.label}</span>
              {ativo && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-t-full"
                  style={{
                    background: 'linear-gradient(90deg,#f59e0b,#fbbf24,#10b981)',
                    boxShadow: '0 -2px 14px rgba(245,158,11,0.7)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
