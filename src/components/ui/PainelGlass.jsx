import React from 'react';

export default function PainelGlass({ titulo, icon: Icon, children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-stone-950 ring-1 ring-stone-800 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-3.5 h-3.5 text-amber-400" />}
        <h3 className="text-[10px] font-black tracking-[0.2em] text-stone-400">{titulo}</h3>
      </div>
      {children}
    </div>
  );
}
