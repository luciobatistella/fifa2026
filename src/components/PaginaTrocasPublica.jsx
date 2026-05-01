import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Repeat2, ArrowLeft, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { fetchTrocasPublicas } from '../lib/sync.js';
import { rotuloFigurinha, fmtNum } from '../lib/figurinhas.js';
import { SUPABASE_ENABLED } from '../lib/supabase.js';

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${className}`}>
      {children}
    </span>
  );
}

function StickerRow({ stickerId, extras }) {
  const info = rotuloFigurinha(stickerId);
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-stone-900/60 ring-1 ring-stone-800/60 hover:ring-amber-400/30 transition">
      <span className="text-xl w-8 text-center shrink-0">{info.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-stone-100 truncate">{info.titulo}</div>
        <div className="text-[11px] text-stone-500">{info.sub || info.code}</div>
      </div>
      <Badge className="bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30 shrink-0">
        {extras}× extra{extras !== 1 ? 's' : ''}
      </Badge>
    </div>
  );
}

export default function PaginaTrocasPublica() {
  const { username } = useParams();
  const [estado, setEstado] = useState('carregando'); // 'carregando' | 'ok' | 'nao_encontrado' | 'erro' | 'desabilitado'
  const [dados, setDados] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    if (!SUPABASE_ENABLED) { setEstado('desabilitado'); return; }
    let vivo = true;
    setEstado('carregando');
    fetchTrocasPublicas(username)
      .then((res) => {
        if (!vivo) return;
        if (!res) { setEstado('nao_encontrado'); return; }
        setDados(res);
        setEstado('ok');
      })
      .catch(() => { if (vivo) setEstado('erro'); });
    return () => { vivo = false; };
  }, [username]);

  const totalExtras = dados?.repetidas.reduce((a, r) => a + r.extras, 0) ?? 0;

  const repetidaFiltrada = dados?.repetidas.filter((r) => {
    if (filtro === 'especiais') return r.stickerId.startsWith('FWC-') || r.stickerId.startsWith('CC-');
    if (filtro === 'selecoes')  return !r.stickerId.startsWith('FWC-') && !r.stickerId.startsWith('CC-');
    return true;
  }) ?? [];

  const copiarLista = () => {
    if (!dados || repetidaFiltrada.length === 0) return;
    const linhas = repetidaFiltrada.map((r) => {
      const info = rotuloFigurinha(r.stickerId);
      return `${info.code} • ${info.emoji} ${info.titulo} — ${r.extras}×`;
    });
    const texto = [
      `🎽 FIGURINHAS PARA TROCA — ${dados.displayName || dados.username}`,
      `👉 ${window.location.href}`,
      '',
      ...linhas,
    ].join('\n');
    navigator.clipboard?.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  // ── Estados ─────────────────────────────────────────────────────────────────

  if (estado === 'carregando') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (estado === 'desabilitado') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-950 text-stone-400 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-400" />
        <p className="text-lg font-bold text-stone-200">Supabase não configurado</p>
        <p className="text-sm max-w-xs">Configure as variáveis <code className="text-amber-300">VITE_SUPABASE_URL</code> e <code className="text-amber-300">VITE_SUPABASE_ANON_KEY</code> para usar esta funcionalidade.</p>
        <Link to="/" className="text-amber-400 text-sm font-bold hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
      </div>
    );
  }

  if (estado === 'nao_encontrado') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-950 text-stone-400 p-8 text-center">
        <Repeat2 className="w-12 h-12 text-stone-700" />
        <p className="text-lg font-bold text-stone-200">Usuário não encontrado</p>
        <p className="text-sm max-w-xs">Nenhum usuário com o apelido <span className="text-amber-300 font-bold">@{username}</span> foi encontrado, ou ele ainda não definiu um apelido.</p>
        <Link to="/" className="text-amber-400 text-sm font-bold hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
      </div>
    );
  }

  if (estado === 'erro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-950 text-stone-400 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <p className="text-lg font-bold text-stone-200">Erro ao carregar</p>
        <p className="text-sm max-w-xs">Não foi possível carregar as figurinhas de <span className="text-amber-300 font-bold">@{username}</span>. Tente novamente.</p>
        <Link to="/" className="text-amber-400 text-sm font-bold hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
      </div>
    );
  }

  // ── Página principal ─────────────────────────────────────────────────────────

  const avatar = dados.avatarUrl;
  const nome   = dados.displayName || dados.username;
  const inicial = (nome[0] || '?').toUpperCase();

  return (
    <div className="min-h-screen bg-stone-950 pb-20">
      {/* Topo */}
      <div className="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-800/60 px-4 py-4 flex items-center gap-3">
        <Link to="/" className="text-stone-400 hover:text-amber-400 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-xs text-stone-500 font-medium">FIFA World Cup 2026 · Trocas</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Perfil */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="flex items-center gap-4"
        >
          {avatar ? (
            <img src={avatar} alt={nome} className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-400/40" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 text-2xl font-black flex items-center justify-center">
              {inicial}
            </div>
          )}
          <div>
            <h1 className="text-xl font-black text-stone-100">{nome}</h1>
            <p className="text-xs text-stone-500">@{dados.username}</p>
          </div>
        </motion.div>

        {/* Hero stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl ring-1 ring-amber-500/40 p-5 bg-gradient-to-br from-amber-900/30 via-stone-900 to-stone-950"
        >
          <div className="absolute right-4 top-4 opacity-20">
            <Repeat2 className="w-10 h-10 text-amber-400" />
          </div>
          <div className="text-[10px] text-amber-400 font-bold tracking-[0.2em] mb-1">DISPONÍVEL PARA TROCA</div>
          <div className="flex items-baseline gap-2">
            <div className="text-5xl font-black text-amber-400">{fmtNum(totalExtras)}</div>
            <div className="text-sm text-stone-400">figurinha{totalExtras !== 1 ? 's' : ''} extras</div>
          </div>
          <div className="text-xs text-stone-400 mt-1">{dados.repetidas.length} tipos diferentes</div>
          <button
            onClick={copiarLista}
            className="mt-4 px-4 py-2 rounded-lg bg-amber-400 text-stone-950 text-xs font-bold hover:bg-amber-300 transition flex items-center gap-2"
          >
            {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiado ? 'Copiado!' : 'Copiar lista'}
          </button>
        </motion.div>

        {/* Filtros */}
        <div className="flex items-center gap-1 bg-stone-900 rounded-xl p-1 ring-1 ring-stone-800 w-fit">
          {[
            { id: 'todas',    label: 'Todas' },
            { id: 'selecoes', label: 'Seleções' },
            { id: 'especiais', label: 'Especiais' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filtro === f.id
                  ? 'bg-amber-400 text-stone-950'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {repetidaFiltrada.length === 0 ? (
          <div className="text-center py-16 text-stone-600">
            <Repeat2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhuma repetida nesta categoria</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-1.5"
          >
            {repetidaFiltrada.map((r) => (
              <StickerRow key={r.stickerId} stickerId={r.stickerId} extras={r.extras} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
