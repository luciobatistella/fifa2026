import React from 'react';
import { motion } from 'framer-motion';
import HoloCard from '../effects/HoloCard.jsx';
import AnimatedNumber from '../effects/AnimatedNumber.jsx';

const TONES = {
  amber:   { ring: 'ring-amber-500/40',   text: 'text-amber-400',   glow: 'rgba(245,158,11,0.35)',  bg: 'from-amber-950/40' },
  emerald: { ring: 'ring-emerald-500/40', text: 'text-emerald-400', glow: 'rgba(16,185,129,0.30)',  bg: 'from-emerald-950/40' },
  rose:    { ring: 'ring-rose-500/40',    text: 'text-rose-400',    glow: 'rgba(244,63,94,0.30)',   bg: 'from-rose-950/40' },
  indigo:  { ring: 'ring-indigo-500/40',  text: 'text-indigo-400',  glow: 'rgba(99,102,241,0.30)',  bg: 'from-indigo-950/40' },
  stone:   { ring: 'ring-stone-700',      text: 'text-stone-300',   glow: 'rgba(120,113,108,0.20)', bg: 'from-stone-900/40' },
};

export default function KpiCard({ tone = 'amber', icon: Icon, label, valor, sub }) {
  const t = TONES[tone] || TONES.amber;
  const isNumber = typeof valor === 'number';

  return (
    <HoloCard className={`rounded-2xl ring-1 ${t.ring} bg-gradient-to-br ${t.bg} via-stone-950 to-stone-950 p-4`} glow={t.glow}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <motion.div
            initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          >
            <Icon className={`w-3.5 h-3.5 ${t.text}`} />
          </motion.div>
        )}
        <span className="text-[9px] tracking-[0.25em] text-stone-400 font-bold">{label}</span>
      </div>
      <div className={`font-display text-3xl sm:text-4xl ${t.text} leading-none tabular-nums`}>
        {isNumber ? <AnimatedNumber value={valor} /> : valor}
      </div>
      {sub && <div className="text-[10px] text-stone-500 mt-1">{sub}</div>}
    </HoloCard>
  );
}
