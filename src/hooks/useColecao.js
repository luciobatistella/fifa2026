import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { storage } from '../lib/storage.js';
import {
  SELECOES, FIGURINHAS_POR_SELECAO, TOTAL_FIGURINHAS, FIGURINHAS_POR_PACOTE, STORAGE_KEY,
} from '../data/selecoes.js';
import { progressoSelecao, progressoEspeciais, progressoCocaCola, rotuloFigurinha } from '../lib/figurinhas.js';
import { parseId } from '../data/album.js';
import { pullCollection, pushCollection } from '../lib/sync.js';
import { SUPABASE_ENABLED } from '../lib/supabase.js';

export function useColecao(userId) {
  const storageKey = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;

  const [colecao, setColecao]       = useState({});
  const [meta, setMeta]             = useState({ precoPacote: 5, criadoEm: null });
  const [carregando, setCarregando] = useState(true);
  // 'idle' | 'syncing' | 'error' | 'offline'
  const [syncStatus, setSyncStatus] = useState(SUPABASE_ENABLED && userId ? 'syncing' : 'idle');

  const colecaoRef        = useRef(colecao);
  const initialSyncDoneRef = useRef(false);
  const pushTimerRef      = useRef(null);
  useEffect(() => { colecaoRef.current = colecao; }, [colecao]);

  // Load — recarrega sempre que o usuário muda
  useEffect(() => {
    setColecao({});
    setMeta({ precoPacote: 5, criadoEm: null });
    setCarregando(true);
    initialSyncDoneRef.current = false;
    setSyncStatus(SUPABASE_ENABLED && userId ? 'syncing' : 'idle');
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
  }, [storageKey, userId]);

  // Save local
  useEffect(() => {
    if (carregando) return;
    storage.set(storageKey, JSON.stringify({ colecao, meta, savedAt: new Date().toISOString() }));
  }, [colecao, meta, carregando, storageKey]);

  // Sync inicial: pull remoto + merge (max) ao logar
  useEffect(() => {
    if (carregando) return;
    if (!SUPABASE_ENABLED || !userId) {
      initialSyncDoneRef.current = true;
      setSyncStatus('idle');
      return;
    }
    if (initialSyncDoneRef.current) return;
    let cancelled = false;
    setSyncStatus('syncing');
    (async () => {
      try {
        const remote = await pullCollection(userId);
        if (cancelled) return;
        const local = colecaoRef.current || {};
        const merged = { ...(remote || {}) };
        for (const [id, q] of Object.entries(local)) {
          merged[id] = Math.max(merged[id] || 0, q);
        }
        const localStr  = JSON.stringify(local);
        const mergedStr = JSON.stringify(merged);
        const remoteStr = JSON.stringify(remote || {});
        if (mergedStr !== localStr) setColecao(merged);
        if (mergedStr !== remoteStr) await pushCollection(userId, merged);
        if (cancelled) return;
        initialSyncDoneRef.current = true;
        setSyncStatus('idle');
      } catch (_) {
        if (!cancelled) setSyncStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [carregando, userId]);

  // Push automático (debounce) quando a coleção muda
  useEffect(() => {
    if (!SUPABASE_ENABLED || !userId) return;
    if (carregando) return;
    if (!initialSyncDoneRef.current) return;
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    setSyncStatus('syncing');
    pushTimerRef.current = setTimeout(async () => {
      try {
        await pushCollection(userId, colecaoRef.current);
        setSyncStatus('idle');
      } catch (_) {
        setSyncStatus('error');
      }
    }, 1500);
    return () => { if (pushTimerRef.current) clearTimeout(pushTimerRef.current); };
  }, [colecao, userId, carregando]);

  // Retry manual de sincronização
  const sincronizarAgora = useCallback(async () => {
    if (!SUPABASE_ENABLED || !userId) return;
    setSyncStatus('syncing');
    try {
      await pushCollection(userId, colecaoRef.current);
      setSyncStatus('idle');
    } catch (_) {
      setSyncStatus('error');
    }
  }, [userId]);

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
  const cocaCola  = useMemo(() => progressoCocaCola(colecao), [colecao]);

  return {
    // state
    colecao, meta, carregando, syncStatus,
    // setters
    setMeta,
    // mutations
    setQtd, inc, dec, adicionarMuitos, resetar, substituirColecao,
    sincronizarAgora,
    // derived
    stats, repetidasLista, progressoSelecoes, especiais, cocaCola,
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
