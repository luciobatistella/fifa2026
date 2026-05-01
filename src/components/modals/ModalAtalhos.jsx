import React from 'react';
import { Keyboard } from 'lucide-react';
import ModalBase from './ModalBase.jsx';

const ATALHOS = [
  ['P',   'Abrir pacote'],
  ['A',   'Adicionar (cola múltipla)'],
  ['/',   'Focar buscar'],
  ['1',   'Início'],
  ['2',   'Álbum'],
  ['3',   'Buscar'],
  ['4',   'Trocas'],
  ['5',   'Stats'],
  ['?',   'Mostrar atalhos'],
  ['Esc', 'Fechar modal / voltar'],
];

export default function ModalAtalhos({ aberto, onFechar }) {
  return (
    <ModalBase aberto={aberto} onFechar={onFechar} icone={Keyboard} titulo="Atalhos do teclado" maxW="max-w-sm">
      <div className="space-y-1.5">
        {ATALHOS.map(([k, d]) => (
          <div key={k} className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-stone-300">{d}</span>
            <kbd className="px-2 py-0.5 rounded-md bg-stone-800 ring-1 ring-stone-700 text-[11px] font-mono font-bold text-amber-400">
              {k}
            </kbd>
          </div>
        ))}
      </div>
    </ModalBase>
  );
}
