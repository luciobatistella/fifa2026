import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Plus, Package, Settings, ScanLine } from 'lucide-react';
import IconBtn from './ui/IconBtn.jsx';
import SFXToggle from './ui/SFXToggle.jsx';
import AnimatedNumber from './effects/AnimatedNumber.jsx';
import { sfx, sfxState } from '../lib/sfx.js';
import { TOTAL_FIGURINHAS } from '../data/selecoes.js';
import { spring } from '../lib/anims.js';

const wrap = (fn, sound = 'tick') => () => { sfxState.unlock(); sfx[sound] && sfx[sound](); fn && fn(); };

export default function Header({ stats, onPacote, onQuick, onConfig, onScan }) {
  return (
    <header className="relative border-b border-amber-500/20 overflow-hidden">
      {/* halos */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/8 via-transparent to-transparent" />
      <div className="absolute -top-32 -left-20 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="absolute -top-32 right-0 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-pitch opacity-40" />

      <div className="relative max-w-5xl mx-auto px-4 py-7">
        <div className="flex items-start justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring}
            className="min-w-0"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 4 }}
              >
                <Trophy className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              </motion.div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-amber-400 font-bold">
                FIFA World Cup 2026 • Panini
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl leading-[0.85] text-stone-100">
              MEU <span className="text-holo">ÁLBUM</span>
            </h1>
            <p className="text-xs text-stone-400 mt-2 font-mono">
              <AnimatedNumber value={stats.distintas} className="text-stone-200 font-bold" /> / {TOTAL_FIGURINHAS} figurinhas •{' '}
              <span className="text-emerald-400 font-bold">
                <AnimatedNumber value={stats.percentual} format={(n) => n.toFixed(1) + '%'} />
              </span>{' '}completo
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={spring}
            className="flex items-center gap-1.5 shrink-0"
          >
            <SFXToggle />
            {onScan && (
              <IconBtn title="Escanear (S)"     onClick={wrap(onScan, 'beep')}><ScanLine className="w-4 h-4" /></IconBtn>
            )}
            <IconBtn title="Adicionar (A)"     onClick={wrap(onQuick, 'swoosh')}><Plus className="w-4 h-4" /></IconBtn>
            <IconBtn title="Abrir pacote (P)"  onClick={wrap(onPacote, 'pack')}><Package className="w-4 h-4" /></IconBtn>
            <IconBtn title="Configurações"     onClick={wrap(onConfig, 'tick')}><Settings className="w-4 h-4" /></IconBtn>
          </motion.div>
        </div>

        {/* barra de progresso premium */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.1 }}
          className="mt-6"
        >
          <div className="relative h-3 bg-stone-900/80 rounded-full overflow-hidden ring-1 ring-stone-800 backdrop-blur">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentual}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 18 }}
              style={{
                background: 'linear-gradient(90deg,#f59e0b 0%,#fbbf24 50%,#10b981 100%)',
                boxShadow: '0 0 22px rgba(245,158,11,0.55), inset 0 0 8px rgba(255,255,255,0.25)',
              }}
            />
            <div className="absolute inset-0 bar-shimmer rounded-full opacity-80" />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] font-mono text-stone-500">
            <span>0</span><span>250</span><span>500</span><span>750</span><span className="text-amber-400">980</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
