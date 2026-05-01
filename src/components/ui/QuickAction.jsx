import React from 'react';

const TONES = {
  amber:   'from-amber-500/20 ring-amber-500/30 text-amber-400',
  emerald: 'from-emerald-500/20 ring-emerald-500/30 text-emerald-400',
  indigo:  'from-indigo-500/20 ring-indigo-500/30 text-indigo-400',
};

export default function QuickAction({ icon: Icon, titulo, desc, onClick, tone = 'amber', kbd, disabled }) {
  const t = TONES[tone];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden text-left p-4 rounded-2xl ring-1 bg-stone-950 transition-all bg-gradient-to-br ${t} to-transparent ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] hover:ring-2 active:scale-[0.99]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-stone-950 ring-1 ring-current ${t.split(' ')[2]} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-sm tracking-wide">{titulo}</div>
          <div className="text-[11px] text-stone-400 truncate">{desc}</div>
        </div>
        {kbd && (
          <kbd className="hidden sm:block text-[10px] font-mono px-1.5 py-0.5 rounded border border-stone-700 text-stone-500">
            {kbd}
          </kbd>
        )}
      </div>
    </button>
  );
}
