import React from 'react';

const CORES = {
  amber:   'text-amber-400',
  emerald: 'text-emerald-400',
  stone:   'text-stone-200',
  indigo:  'text-indigo-400',
  rose:    'text-rose-400',
};

export default function LinhaStat({ label, valor, cor = 'amber' }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-stone-400">{label}</span>
      <span className={`font-bold font-mono ${CORES[cor]}`}>{valor}</span>
    </div>
  );
}
