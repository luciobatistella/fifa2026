import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wand2, Sparkles, Camera } from 'lucide-react';
import ModalBase from './ModalBase.jsx';
import Scanner from '../Scanner.jsx';

export default function ModalQuickAdd({ aberto, onFechar, onConfirmar }) {
  const [texto, setTexto] = useState('');
  const [scanAberto, setScanAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (aberto) { setTexto(''); setTimeout(() => ref.current?.focus(), 80); }
    if (!aberto) setScanAberto(false);
  }, [aberto]);

  const handleDetectar = useCallback((ids) => {
    setTexto((prev) => {
      const novos = ids.join(' ');
      return prev.trim() ? `${prev.trimEnd()} ${novos}` : novos;
    });
  }, []);

  const fecharScanner = useCallback(() => {
    setScanAberto(false);
    setTimeout(() => ref.current?.focus(), 80);
  }, []);

  return (
    <>
      <Scanner aberto={scanAberto} onFechar={fecharScanner} onDetectar={handleDetectar} />

      <ModalBase
        aberto={aberto}
        onFechar={onFechar}
        icone={Wand2}
        titulo="Adicionar figurinhas"
        subtitulo="Digite, cole ou escaneie os códigos"
        maxW="max-w-lg"
        footer={
          <div className="space-y-2">
            <button
              onClick={() => setScanAberto(true)}
              className="w-full py-3.5 rounded-xl bg-amber-400 text-stone-950 font-bold text-sm hover:bg-amber-300 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Escanear com a câmera
            </button>
            <button
              onClick={() => { if (texto.trim()) onConfirmar(texto); }}
              disabled={!texto.trim()}
              className="w-full py-3 rounded-xl bg-emerald-400/90 text-stone-950 font-bold text-sm hover:bg-emerald-300 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Adicionar tudo
            </button>
          </div>
        }
      >
        <textarea
          ref={ref}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={"BRA-1 BRA-2 ARG-5\nFWC-3 FWC-12\nFRA-10, GER-2, POR 9"}
          rows={6}
          className="w-full px-3 py-2.5 bg-stone-900 ring-1 ring-stone-800 rounded-lg text-sm focus:outline-none focus:ring-emerald-400 placeholder-stone-600 font-mono"
        />
        <div className="mt-2 text-[11px] text-stone-500">
          Códigos escaneados aparecem aqui automaticamente. Repetidos viram repetidas.
        </div>
      </ModalBase>
    </>
  );
}
