import React, { useState, useEffect, useRef } from 'react';
import { Wand2, Sparkles } from 'lucide-react';
import ModalBase from './ModalBase.jsx';

export default function ModalQuickAdd({ aberto, onFechar, onConfirmar }) {
  const [texto, setTexto] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (aberto) { setTexto(''); setTimeout(() => ref.current?.focus(), 80); }
  }, [aberto]);

  return (
    <ModalBase
      aberto={aberto}
      onFechar={onFechar}
      icone={Wand2}
      titulo="Adicionar muitas de uma vez"
      subtitulo="Cole vários códigos separados por espaço, vírgula ou linha"
      maxW="max-w-lg"
      footer={
        <button
          onClick={() => { if (texto.trim()) onConfirmar(texto); }}
          className="w-full py-3 rounded-xl bg-emerald-400 text-stone-950 font-bold text-sm hover:bg-emerald-300 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Adicionar tudo
        </button>
      }
    >
      <textarea
        ref={ref}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={"BRA-1 BRA-2 ARG-5\nFWC-3 FWC-12\nFRA-10, GER-2, POR 9"}
        rows={8}
        className="w-full px-3 py-2.5 bg-stone-900 ring-1 ring-stone-800 rounded-lg text-sm focus:outline-none focus:ring-emerald-400 placeholder-stone-600 font-mono"
      />
      <div className="mt-3 text-[11px] text-stone-500">
        Tudo no mesmo input. Códigos repetidos viram repetidas automaticamente.
      </div>
    </ModalBase>
  );
}
