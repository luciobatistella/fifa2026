import { useState, useEffect, useMemo, useCallback } from 'react';
import { storage } from '../lib/storage.js';
import {
  SELECOES, FIGURINHAS_POR_SELECAO, TOTAL_FIGURINHAS, FIGURINHAS_POR_PACOTE, STORAGE_KEY,
} from '../data/selecoes.js';
import { progressoSelecao, progressoEspeciais, rotuloFigurinha } from '../lib/figurinhas.js';
import { parseId } from '../data/album.js';

export function useColecao(userId) {
  const storageKey = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;

  const [colecao, setColecao]       = useState({});
  const [meta, setMeta]             = useState({ precoPacote: 5, criadoEm: null });
  const [carregando, setCarregando] = useState(true);

  // Load — recarrega sempre que o usuário muda
  useEffect(() => {
    setColecao({});
    setMeta({ precoPacote: 5, criadoEm: null });
    setCarregando(true);
    (async () => {
      const raw = await storage.get(storageKey);
      if (raw) {
        try {
          const d = JSON.parse(raw);
          if (d.colecao) setColecao(d.colecao);
          if (d.meta)    setMeta((m) => ({ ...m, ...d.meta }));
        } catch (_) {}
      } else {
        setMeta((m) => ({ ...m, criadoEm: new Date().toISOString() }));
      }
      setCarregando(false);
    })();
  }, [storageKey]);

  // Save
  useEffect(() => {
    if (carregando) return;
    storage.set(storageKey, JSON.stringify({ colecao, meta, savedAt: new Date().toISOString() }));
  }, [colecao, meta, carregando, storageKey]);

  // Mutations
  const setQtd = useCallback((id, qtd) => {
    setColecao((p) => {
      const novo = { ...p };
      if (qtd <= 0) delete novo[id]; else novo[id] = qtd;
      return novo;
    });
  }, []);
  const inc = useCallback((id, n = 1) => setColecao((p) => ({ ...p, [id]: (p[id] || 0) + n })), []);
  const dec = useCallback((id, n = 1) => setColecao((p) => {
    const v = (p[id] || 0) - n;
    const novo = { ...p };
    if (v <= 0) delete novo[id]; else novo[id] = v;
    return novo;
  }), []);

  const adicionarMuitos = useCallback((ids) => {
    setColecao((p) => {
      const novo = { ...p };
      ids.forEach((id) => { novo[id] = (novo[id] || 0) + 1; });
      return novo;
    });
  }, []);

  const resetar = useCallback(() => setColecao({}), []);

  /** Substitui inteiramente a coleção (usado em sync/import). */
  const substituirColecao = useCallback((nova) => {
    setColecao(nova && typeof nova === 'object' ? { ...nova } : {});
  }, []);

  // Stats globais
  const stats = useMemo(() => {
    const ids = Object.keys(colecao);
    const distintas    = ids.filter((id) => colecao[id] > 0).length;
    const totalColadas = Object.values(colecao).reduce((a, b) => a + b, 0);
    const repetidas    = totalColadas - distintas;
    const faltando     = TOTAL_FIGURINHAS - distintas;
    const percentual   = (distintas / TOTAL_FIGURINHAS) * 100;
    const pacotesEstimados = Math.ceil(totalColadas / FIGURINHAS_POR_PACOTE);
    const investido    = pacotesEstimados * (meta.precoPacote || 0);
    return { distintas, totalColadas, repetidas, faltando, percentual, pacotesEstimados, investido };
  }, [colecao, meta.precoPacote]);

  const repetidasLista = useMemo(() => Object.entries(colecao)
    .filter(([, q]) => q > 1)
    .map(([id, q]) => ({ id, qtd: q, extras: q - 1, info: rotuloFigurinha(id), numero: parseId(id)?.number ?? 0 }))
    .sort((a, b) => b.extras - a.extras || a.numero - b.numero),
    [colecao]);

  const progressoSelecoes = useMemo(() =>
    SELECOES.map((s) => ({ ...s, ...progressoSelecao(colecao, s.codigo) })),
    [colecao]);

  const especiais = useMemo(() => progressoEspeciais(colecao), [colecao]);

  return {
    // state
    colecao, meta, carregando,
    // setters
    setMeta,
    // mutations
    setQtd, inc, dec, adicionarMuitos, resetar, substituirColecao,
    // derived
    stats, repetidasLista, progressoSelecoes, especiais,
  };
}

/**
 * Hook genérico de toasts.
 */
export function useToasts(timeoutMs = 2400) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, tone = 'amber') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeoutMs);
  }, [timeoutMs]);
  return { toasts, push };
}
