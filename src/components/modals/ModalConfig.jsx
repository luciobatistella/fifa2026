import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import ModalBase from './ModalBase.jsx';

export default function ModalConfig({ aberto, onFechar, meta, onSalvar }) {
  const [preco, setPreco] = useState(meta.precoPacote ?? 5);
  const [qtd, setQtd]     = useState(meta.figurinhasPorPacote ?? 7);

  useEffect(() => {
    if (aberto) {
      setPreco(meta.precoPacote ?? 5);
      setQtd(meta.figurinhasPorPacote ?? 7);
    }
  }, [aberto, meta]);

  return (
    <ModalBase
      aberto={aberto}
      onFechar={onFechar}
      icone={Settings}
      titulo="Configurações"
      footer={
        <button
          onClick={() => onSalvar({ precoPacote: Number(preco) || 0, figurinhasPorPacote: Number(qtd) || 7 })}
          className="w-full py-3 rounded-xl bg-amber-400 text-stone-950 font-bold text-sm hover:bg-amber-300 transition"
        >
          Salvar
        </button>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">Preço do pacote (R$)</span>
          <input
            type="number" step="0.5" min="0"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="mt-1 w-full px-3 py-2.5 bg-stone-900 ring-1 ring-stone-800 rounded-lg text-sm focus:outline-none focus:ring-amber-400"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">Figurinhas por pacote</span>
          <input
            type="number" min="1" max="20"
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
            className="mt-1 w-full px-3 py-2.5 bg-stone-900 ring-1 ring-stone-800 rounded-lg text-sm focus:outline-none focus:ring-amber-400"
          />
        </label>
      </div>
    </ModalBase>
  );
}
