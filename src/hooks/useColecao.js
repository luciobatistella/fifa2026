import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { storage } from '../lib/storage.js';
import {
  SELECOES, FIGURINHAS_POR_SELECAO, TOTAL_FIGURINHAS, FIGURINHAS_POR_PACOTE, STORAGE_KEY,
} from '../data/selecoes.js';
import { progressoSelecao, progressoEspeciais, progressoCocaCola, progressoExtras, rotuloFigurinha } from '../lib/figurinhas.js';
import { parseId } from '../data/album.js';
import { pullCollection, pushCollection } from '../lib/sync.js';
import { SUPABASE_ENABLED } from '../lib/supabase.js';

export function useColecao(userId) {
  const storageKey   = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
  const baselineKey  = userId ? `${STORAGE_KEY}:${userId}:baseline` : null;

  const [colecao, setColecao]       = useState({});
  const [meta, setMeta]             = useState({ precoPacote: 7, criadoEm: null, modoColagem: 'completo' });
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
    setMeta({ precoPacote: 7, criadoEm: null, modoColagem: 'completo' });
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

  // Sync inicial: pull remoto + merge 3-vias (baseline) ao logar
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
        const remote = (await pullCollection(userId)) || {};
        if (cancelled) return;
        const local = colecaoRef.current || {};

        // Carrega baseline (último estado conhecido do servidor).
        let baseline = null;
        try {
          const rawBase = baselineKey ? await storage.get(baselineKey) : null;
          if (rawBase) baseline = JSON.parse(rawBase);
        } catch (_) {}

        let merged;
        if (baseline && typeof baseline === 'object') {
          // Merge 3-vias: se local mudou em relação à baseline, vence local
          // (preserva remoções do usuário). Caso contrário, aceita remote.
          merged = {};
          const allIds = new Set([
            ...Object.keys(local),
            ...Object.keys(remote),
            ...Object.keys(baseline),
          ]);
          for (const id of allIds) {
            const l = local[id]     || 0;
            const r = remote[id]    || 0;
            const b = baseline[id]  || 0;
            const v = (l !== b) ? l : r; // edição local prevalece
            if (v > 0) merged[id] = v;
          }
        } else if (Object.keys(local).length === 0) {
          // Device novo / sem dados locais → adota o remoto.
          merged = { ...remote };
        } else {
          // Sem baseline, mas há dados locais: confia no local.
          // (Save local é imediato; remote pode estar atrasado por debounce.)
          // Isso preserva remoções feitas antes desta versão.
          merged = { ...local };
        }

        const localStr  = JSON.stringify(local);
        const mergedStr = JSON.stringify(merged);
        const remoteStr = JSON.stringify(remote);
        if (mergedStr !== localStr) setColecao(merged);
        if (mergedStr !== remoteStr) await pushCollection(userId, merged);
        // Atualiza baseline para refletir o estado agora canônico no servidor.
        if (baselineKey) {
          try { await storage.set(baselineKey, mergedStr); } catch (_) {}
        }
        if (cancelled) return;
        initialSyncDoneRef.current = true;
        setSyncStatus('idle');
      } catch (_) {
        if (!cancelled) setSyncStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [carregando, userId, baselineKey]);

  // Push automático (debounce) quando a coleção muda
  useEffect(() => {
    if (!SUPABASE_ENABLED || !userId) return;
    if (carregando) return;
    if (!initialSyncDoneRef.current) return;
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    setSyncStatus('syncing');
    pushTimerRef.current = setTimeout(async () => {
      try {
        const snapshot = colecaoRef.current;
        await pushCollection(userId, snapshot);
        // Baseline = o que acabou de ir para o servidor.
        if (baselineKey) {
          try { await storage.set(baselineKey, JSON.stringify(snapshot)); } catch (_) {}
        }
        setSyncStatus('idle');
      } catch (_) {
        setSyncStatus('error');
      }
    }, 1500);
    return () => { if (pushTimerRef.current) clearTimeout(pushTimerRef.current); };
  }, [colecao, userId, carregando, baselineKey]);

  // Retry manual de sincronização
  const sincronizarAgora = useCallback(async () => {
    if (!SUPABASE_ENABLED || !userId) return;
    setSyncStatus('syncing');
    try {
      const snapshot = colecaoRef.current;
      await pushCollection(userId, snapshot);
      if (baselineKey) {
        try { await storage.set(baselineKey, JSON.stringify(snapshot)); } catch (_) {}
      }
      setSyncStatus('idle');
    } catch (_) {
      setSyncStatus('error');
    }
  }, [userId, baselineKey]);

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
  const extras    = useMemo(() => progressoExtras(colecao), [colecao]);

  return {
    // state
    colecao, meta, carregando, syncStatus,
    // setters
    setMeta,
    // mutations
    setQtd, inc, dec, adicionarMuitos, resetar, substituirColecao,
    sincronizarAgora,
    // derived
    stats, repetidasLista, progressoSelecoes, especiais, cocaCola, extras,
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
