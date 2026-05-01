import { useEffect } from 'react';

/**
 * Atalhos globais (ignora se foco está em INPUT/TEXTAREA).
 * map = { '1': () => ..., 'P': () => ... }
 */
export function useAtalhos(map) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const k = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      const fn = map[k] || map[e.key];
      if (fn) fn(e);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [map]);
}
