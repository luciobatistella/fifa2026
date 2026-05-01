/* eslint-disable */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import './src/styles/globals.css';

import { useColecao, useToasts } from './src/hooks/useColecao.js';
import { useAtalhos } from './src/hooks/useAtalhos.js';
import { rotuloFigurinha } from './src/lib/figurinhas.js';
import { normalizeId } from './src/data/album.js';
import { sfx, sfxState } from './src/lib/sfx.js';
import { fadeUp } from './src/lib/anims.js';

import Header        from './src/components/Header.jsx';
import Tabs          from './src/components/Tabs.jsx';
import FAB           from './src/components/FAB.jsx';
import Toasts        from './src/components/ui/Toasts.jsx';
import Confetti      from './src/components/effects/Confetti.jsx';
import Dashboard     from './src/components/Dashboard.jsx';
import ListaSelecoes from './src/components/ListaSelecoes.jsx';
import SecaoEspeciais from './src/components/SecaoEspeciais.jsx';
import SecaoCocaCola from './src/components/SecaoCocaCola.jsx';
import DetalhesSelecao from './src/components/DetalhesSelecao.jsx';
import Busca         from './src/components/Busca.jsx';
import Trocas        from './src/components/Trocas.jsx';
import Estatisticas  from './src/components/Estatisticas.jsx';

import ModalPacote   from './src/components/modals/ModalPacote.jsx';
import ModalQuickAdd from './src/components/modals/ModalQuickAdd.jsx';
import ModalConfig   from './src/components/modals/ModalConfig.jsx';
import ModalAtalhos  from './src/components/modals/ModalAtalhos.jsx';
import ModalLogin    from './src/components/modals/ModalLogin.jsx';
import Scanner       from './src/components/Scanner.jsx';
import TelaLogin     from './src/components/TelaLogin.jsx';
import { useAuth }   from './src/hooks/useAuth.js';
import { SUPABASE_ENABLED } from './src/lib/supabase.js';

/* Parser de códigos colados (pacote / quickAdd). Aceita apenas PREFIX-N ou PREFIX N. */
function parseCodigos(texto) {
  const tokens = texto.split(/[,;\n\r\t]+|\s{2,}/).map((t) => t.trim()).filter(Boolean);
  const ids = [];
  for (const tk of tokens) {
    // tenta normalizar "BRA 5" / "bra-5" / "FWC12" -> "BRA-5" / "FWC-12"
    const norm = normalizeId(tk) || normalizeId(tk.replace(/^([A-Za-z]{2,5})\s*(\d+)/, '$1-$2'));
    if (!norm) continue;
    const info = rotuloFigurinha(norm);
    if (info.kind !== 'unknown') ids.push(norm);
  }
  return ids;
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const {
    colecao, meta, carregando,
    setMeta, inc, dec, adicionarMuitos, resetar, substituirColecao,
    stats, repetidasLista, progressoSelecoes, especiais, cocaCola,
  } = useColecao(user?.id);
  const { toasts, push } = useToasts();

  const [aba, setAba]                     = useState('dashboard');
  const [busca, setBusca]                 = useState('');
  const [selecaoAberta, setSelecaoAberta] = useState(null);
  const [filtroSel, setFiltroSel]         = useState('todas');

  const [mPacote, setMPacote]   = useState(false);
  const [mQuick, setMQuick]     = useState(false);
  const [mConfig, setMConfig]   = useState(false);
  const [mAtalhos, setMAtalhos] = useState(false);
  const [mScan, setMScan]       = useState(false);
  const [mLogin, setMLogin]     = useState(false);

  const confettiRef = useRef(null);

  /* ---------- Detecção de conquistas ---------- */
  const completasRef = useRef(new Set());
  const especiaisFullRef = useRef(false);
  const albumFullRef = useRef(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (carregando) return;
    // primeira passada: snapshot inicial (não dispara fanfarra)
    if (!initRef.current) {
      progressoSelecoes.forEach((s) => { if (s.tem === s.total) completasRef.current.add(s.codigo); });
      especiaisFullRef.current = especiais.tem === especiais.total;
      albumFullRef.current     = stats.faltando === 0;
      initRef.current = true;
      return;
    }
    // novas seleções 100%
    progressoSelecoes.forEach((s) => {
      if (s.tem === s.total && !completasRef.current.has(s.codigo)) {
        completasRef.current.add(s.codigo);
        sfxState.unlock(); sfx.fanfare();
        confettiRef.current?.fire({ count: 220 });
        push(`🏆 ${s.bandeira} ${s.nome.toUpperCase()} COMPLETA!`, 'amber');
      } else if (s.tem !== s.total && completasRef.current.has(s.codigo)) {
        completasRef.current.delete(s.codigo);
      }
    });
    // especiais 100%
    const espFull = especiais.tem === especiais.total;
    if (espFull && !especiaisFullRef.current) {
      sfx.fanfare();
      confettiRef.current?.fire({ count: 260, colors: ['#fde047', '#ffffff', '#fbbf24'] });
      push('✨ TODAS AS ESPECIAIS COMPLETAS!', 'amber');
    }
    especiaisFullRef.current = espFull;
    // álbum inteiro
    const albFull = stats.faltando === 0;
    if (albFull && !albumFullRef.current) {
      sfx.fanfare();
      setTimeout(() => sfx.fanfare(), 400);
      confettiRef.current?.fire({ count: 600 });
      setTimeout(() => confettiRef.current?.fire({ count: 400, x: 0.2 }), 300);
      setTimeout(() => confettiRef.current?.fire({ count: 400, x: 0.8 }), 600);
      push('👑 ÁLBUM COMPLETO! VOCÊ É CAMPEÃO!', 'amber');
    }
    albumFullRef.current = albFull;
  }, [progressoSelecoes, especiais, stats, carregando, push]);

  /* ---------- Mutations com feedback ---------- */
  const handleInc = useCallback((id) => {
    inc(id);
    const info = rotuloFigurinha(id);
    push(`+1 ${info.emoji} ${info.titulo}`, 'emerald');
  }, [inc, push]);

  const handleDec = useCallback((id) => { dec(id); }, [dec]);

  const handlePacote = useCallback((ids) => {
    if (!ids || ids.length === 0) { sfx.err(); push('Nenhum código válido', 'rose'); return; }
    adicionarMuitos(ids);
    setMPacote(false);
    sfx.pack();
    confettiRef.current?.fire({ count: 60, y: 0.7, spread: 100 });
    push(`+${ids.length} figurinhas no pacote!`, 'amber');
  }, [adicionarMuitos, push]);

  const handleQuickAdd = useCallback((texto) => {
    const ids = parseCodigos(texto);
    if (ids.length === 0) { sfx.err(); push('Nenhum código válido encontrado', 'rose'); return; }
    adicionarMuitos(ids);
    setMQuick(false);
    sfx.ding();
    push(`+${ids.length} figurinhas adicionadas`, 'emerald');
  }, [adicionarMuitos, push]);

  const handleScan = useCallback((ids) => {
    if (!ids || ids.length === 0) return;
    adicionarMuitos(ids);
    ids.forEach((id) => {
      const info = rotuloFigurinha(id);
      push(`+1 ${info.emoji} ${info.titulo}`, 'emerald');
    });
  }, [adicionarMuitos, push]);

  const handleSalvarConfig = useCallback((novo) => {
    setMeta((m) => ({ ...m, ...novo }));
    setMConfig(false);
    sfx.tick();
    push('Configurações salvas', 'emerald');
  }, [setMeta, push]);

  const handleExportar = useCallback(() => {
    const blob = new Blob([JSON.stringify({ colecao, meta }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `album-copa-2026-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sfx.ding();
    push('Backup baixado', 'emerald');
  }, [colecao, meta, push]);

  const handleImportar = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.colecao) { sfx.err(); push('Arquivo inválido', 'rose'); return; }
        if (!confirm('Substituir coleção atual pelos dados do arquivo?')) return;
        resetar();
        const ids = [];
        Object.entries(data.colecao).forEach(([id, q]) => { for (let i = 0; i < q; i++) ids.push(id); });
        setTimeout(() => { adicionarMuitos(ids); initRef.current = false; }, 50);
        sfx.ding();
        push('Backup importado!', 'emerald');
      } catch (_) { sfx.err(); push('Arquivo inválido', 'rose'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [adicionarMuitos, resetar, push]);

  const handleResetar = useCallback(() => {
    if (confirm('Tem certeza que quer apagar TODA a coleção? Essa ação não pode ser desfeita.')) {
      resetar();
      initRef.current = false;
      sfx.err();
      push('Coleção zerada', 'rose');
    }
  }, [resetar, push]);

  const atalhos = useMemo(() => ({
    'P': () => setMPacote(true),
    'A': () => setMQuick(true),
    'S': () => setMScan(true),
    '?': () => setMAtalhos(true),
    '/': (e) => { e.preventDefault(); setAba('buscar'); },
    '1': () => setAba('dashboard'),
    '2': () => setAba('selecoes'),
    '3': () => setAba('buscar'),
    '4': () => setAba('repetidas'),
    '5': () => setAba('stats'),
  }), []);
  useAtalhos(atalhos);

  if (carregando || (SUPABASE_ENABLED && authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, ease: 'linear', repeat: Infinity }}
          className="w-12 h-12 rounded-full border-4 border-amber-400/30 border-t-amber-400"
        />
      </div>
    );
  }

  // Gate de autenticação: primeira página é o login.
  // (Se Supabase não estiver configurado, libera o app — modo offline.)
  if (SUPABASE_ENABLED && !user) {
    return (
      <>
        <TelaLogin />
        <Toasts toasts={toasts} />
      </>
    );
  }

  const conteudo = () => {
    if (aba === 'dashboard') return (
      <Dashboard
        stats={stats}
        progresso={progressoSelecoes}
        especiais={especiais}
        repetidas={repetidasLista}
        onAbrirSelecao={(s) => { setAba('selecoes'); setSelecaoAberta(s); }}
        onAbrirPacote={() => setMPacote(true)}
        onQuickAdd={() => setMQuick(true)}
      />
    );
    if (aba === 'selecoes' && !selecaoAberta) return (
      <div className="space-y-6">
        <SecaoEspeciais colecao={colecao} prog={especiais} onInc={handleInc} onDec={handleDec} />
        <SecaoCocaCola colecao={colecao} prog={cocaCola} onInc={handleInc} onDec={handleDec} />
        <ListaSelecoes progresso={progressoSelecoes} onAbrir={(s) => { sfx.tick(); setSelecaoAberta(s); }} />
      </div>
    );
    if (aba === 'selecoes' && selecaoAberta) return (
      <DetalhesSelecao
        selecao={selecaoAberta}
        colecao={colecao}
        filtro={filtroSel}
        setFiltro={setFiltroSel}
        onInc={handleInc}
        onDec={handleDec}
        onVoltar={() => { sfx.close(); setSelecaoAberta(null); }}
      />
    );
    if (aba === 'buscar') return (
      <Busca busca={busca} setBusca={setBusca} colecao={colecao} onInc={handleInc} onDec={handleDec} />
    );
    if (aba === 'repetidas') return (
      <Trocas repetidas={repetidasLista} onInc={handleInc} onDec={handleDec} pushToast={push} />
    );
    if (aba === 'stats') return (
      <Estatisticas
        stats={stats}
        progresso={progressoSelecoes}
        especiais={especiais}
        meta={meta}
        onExportar={handleExportar}
        onImportar={handleImportar}
        onResetar={handleResetar}
      />
    );
    return null;
  };

  return (
    <div className="min-h-screen pb-24">
      <Header
        stats={stats}
        onPacote={() => setMPacote(true)}
        onQuick={() => setMQuick(true)}
        onConfig={() => setMConfig(true)}
        onScan={() => setMScan(true)}
        onLogin={() => setMLogin(true)}
        colecao={colecao}
        onSubstituirColecao={(nova) => { substituirColecao(nova); initRef.current = false; }}
        pushToast={push}
      />
      <Tabs aba={aba} setAba={(a) => { setAba(a); setSelecaoAberta(null); }} />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={aba + (selecaoAberta?.codigo || '')}
            {...fadeUp}
          >
            {conteudo()}
          </motion.div>
        </AnimatePresence>
      </main>

      <FAB onPacote={() => setMPacote(true)} onQuick={() => setMQuick(true)} onScan={() => setMScan(true)} />
      <Toasts toasts={toasts} />
      <Confetti ref={confettiRef} />

      <Scanner
        aberto={mScan}
        onFechar={() => setMScan(false)}
        onDetectar={handleScan}
      />

      <ModalPacote
        aberto={mPacote}
        onFechar={() => setMPacote(false)}
        onConfirmar={handlePacote}
        figurinhasPorPacote={meta.figurinhasPorPacote || 7}
      />
      <ModalQuickAdd aberto={mQuick}    onFechar={() => setMQuick(false)}    onConfirmar={handleQuickAdd} />
      <ModalConfig   aberto={mConfig}   onFechar={() => setMConfig(false)}   meta={meta} onSalvar={handleSalvarConfig} />
      <ModalAtalhos  aberto={mAtalhos}  onFechar={() => setMAtalhos(false)} />
      <ModalLogin    aberto={mLogin}    onFechar={() => setMLogin(false)} />
    </div>
  );
}
