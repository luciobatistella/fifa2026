import React, { useState, useRef, useEffect } from 'react';
import { Package, Sparkles } from 'lucide-react';
import ModalBase from './ModalBase.jsx';

export default function ModalPacote({ aberto, onFechar, onConfirmar, figurinhasPorPacote = 7 }) {
  const [codigos, setCodigos] = useState(Array(figurinhasPorPacote).fill(''));
  const refs = useRef([]);

  useEffect(() => {
    if (aberto) {
      setCodigos(Array(figurinhasPorPacote).fill(''));
      setTimeout(() => refs.current[0]?.focus(), 80);
    }
  }, [aberto, figurinhasPorPacote]);

  const setVal = (i, v) => {
    const novo = [...codigos];
    novo[i] = v;
    setCodigos(novo);
    if (v && v.length >= 3 && i < figurinhasPorPacote - 1) refs.current[i + 1]?.focus();
  };

  const confirmar = () => {
    const validos = codigos.map((c) => c.trim().toUpperCase()).filter(Boolean);
    if (validos.length === 0) return;
    onConfirmar(validos);
  };

  return (
    <ModalBase
      aberto={aberto}
      onFechar={onFechar}
      icone={Package}
      titulo="Abrir Pacote"
      subtitulo={`Registre até ${figurinhasPorPacote} figurinhas`}
      footer={
        <button
          onClick={confirmar}
          className="w-full py-3 rounded-xl bg-amber-400 text-stone-950 font-bold text-sm hover:bg-amber-300 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Adicionar à coleção
        </button>
      }
    >
      <div className="space-y-2">
        {codigos.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 text-center text-[10px] font-mono text-stone-500">#{i + 1}</span>
            <input
              ref={(el) => (refs.current[i] = el)}
              type="text"
              value={c}
              onChange={(e) => setVal(i, e.target.value)}
              placeholder="Ex.: BRA-5  ou  FWC-12  ou  ARG 9"
              className="flex-1 px-3 py-2.5 bg-stone-900 ring-1 ring-stone-800 rounded-lg text-sm focus:outline-none focus:ring-amber-400 placeholder-stone-600"
              onKeyDown={(e) => { if (e.key === 'Enter') confirmar(); }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-stone-500">
        Aceita: <b className="text-stone-300">BRA-5</b>, <b className="text-stone-300">FWC-12</b> ou <b className="text-stone-300">ARG 9</b>.
      </div>
    </ModalBase>
  );
}
