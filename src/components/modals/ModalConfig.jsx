import React, { useState, useEffect } from 'react';
import { Settings, Layers, Repeat } from 'lucide-react';
import ModalBase from './ModalBase.jsx';
import { MODO_HINTS } from '../../contexts/ModoColagem.jsx';

export default function ModalConfig({ aberto, onFechar, meta, onSalvar }) {
  const [preco, setPreco] = useState(meta.precoPacote ?? 7);
  const [qtd, setQtd]     = useState(meta.figurinhasPorPacote ?? 7);
  const [modo, setModo]   = useState(meta.modoColagem ?? 'completo');

  useEffect(() => {
    if (aberto) {
      setPreco(meta.precoPacote ?? 7);
      setQtd(meta.figurinhasPorPacote ?? 7);
      setModo(meta.modoColagem ?? 'completo');
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
          onClick={() => onSalvar({
            precoPacote: Number(preco) || 0,
            figurinhasPorPacote: Number(qtd) || 7,
            modoColagem: modo,
          })}
          className="w-full py-3 rounded-xl bg-amber-400 text-stone-950 font-bold text-sm hover:bg-amber-300 transition"
        >
          Salvar
        </button>
      }
    >
      <div className="space-y-5">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">Modo de uso</span>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <ModoOpcao
              icone={Layers}
              titulo="Coleção completa"
              hint={MODO_HINTS.completo}
              ativo={modo === 'completo'}
              onClick={() => setModo('completo')}
            />
            <ModoOpcao
              icone={Repeat}
              titulo="Apenas repetidas"
              hint={MODO_HINTS.repetidas}
              ativo={modo === 'repetidas'}
              onClick={() => setModo('repetidas')}
            />
          </div>
          <p className="mt-2 text-[11px] text-stone-500 leading-snug">
            No modo <b className="text-stone-300">Apenas repetidas</b>, cada contador representa quantas
            figurinhas você tem em mãos para troca — você não precisa marcar as que já colou no álbum.
          </p>
        </div>

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

function ModoOpcao({ icone: Icon, titulo, hint, ativo, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ring-1 text-left transition ${
        ativo
          ? 'bg-amber-400/15 ring-amber-400/60 text-amber-100'
          : 'bg-stone-900 ring-stone-800 text-stone-300 hover:ring-stone-700'
      }`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${ativo ? 'text-amber-300' : 'text-stone-500'}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold leading-tight">{titulo}</div>
        <div className={`text-[11px] ${ativo ? 'text-amber-200/80' : 'text-stone-500'}`}>{hint}</div>
      </div>
      <span
        className={`w-4 h-4 rounded-full ring-2 transition ${
          ativo ? 'bg-amber-400 ring-amber-300' : 'ring-stone-600'
        }`}
      />
    </button>
  );
}
