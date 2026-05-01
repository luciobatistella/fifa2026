import React, { createContext, useContext } from 'react';

/**
 * Modo de operação do álbum:
 *  - 'completo'  : usuário registra TODAS as figurinhas que tem (coladas + repetidas).
 *                  qtd === 1 = colada, qtd > 1 = colada + repetidas.
 *  - 'repetidas' : usuário registra APENAS as figurinhas que tem em mãos para troca.
 *                  qtd = quantas tem disponíveis para trocar (ignora as já coladas).
 */
const ModoColagemContext = createContext('completo');

export function ModoColagemProvider({ value, children }) {
  return (
    <ModoColagemContext.Provider value={value || 'completo'}>
      {children}
    </ModoColagemContext.Provider>
  );
}

export function useModoColagem() {
  return useContext(ModoColagemContext);
}

export const MODO_LABELS = {
  completo:  'Coleção completa',
  repetidas: 'Apenas repetidas',
};

export const MODO_HINTS = {
  completo:  'Marca tudo: coladas e repetidas',
  repetidas: 'Só registra figurinhas para troca',
};
