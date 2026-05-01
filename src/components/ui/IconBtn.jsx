import React from 'react';

export default function IconBtn({ children, onClick, title, active }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${
        active
          ? 'bg-amber-400 text-stone-950 border-amber-300'
          : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-500/40 hover:text-amber-400'
      }`}
    >
      {children}
    </button>
  );
}
