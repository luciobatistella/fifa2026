import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Menu, LogIn } from 'lucide-react';
import AnimatedNumber from './effects/AnimatedNumber.jsx';
import SideMenu from './SideMenu.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { sfx, sfxState } from '../lib/sfx.js';
import { TOTAL_FIGURINHAS } from '../data/selecoes.js';
import { spring } from '../lib/anims.js';

function Avatar({ user, size = 36 }) {
  const meta = user?.user_metadata || {};
  const url  = meta.avatar_url || meta.picture;
  const nome = meta.full_name || meta.name || user?.email?.split('@')[0] || '?';
  const initials = nome
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map((p) => p[0]).join('').toUpperCase() || '?';
  const [erro, setErro] = useState(false);
  const px = `${size}px`;

  if (url && !erro) {
    return (
      <img
        src={url}
        alt={nome}
        referrerPolicy="no-referrer"
        onError={() => setErro(true)}
        className="rounded-full object-cover ring-1 ring-amber-400/50"
        style={{ width: px, height: px }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-black flex items-center justify-center ring-1 ring-amber-400/50"
      style={{ width: px, height: px, fontSize: Math.round(size * 0.38) }}
      aria-label={nome}
    >
      {initials}
    </div>
  );
}

export default function Header({ stats, onPacote, onQuick, onConfig, onScan, onLogin, colecao, onSubstituirColecao, pushToast }) {
  const { user, enabled } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const abrirMenu = () => {
    sfxState.unlock();
    sfx.tick && sfx.tick();
    setMenuOpen(true);
  };

  const handleEntrar = () => {
    sfxState.unlock();
    sfx.swoosh && sfx.swoosh();
    onLogin?.();
  };

  return (
    <header className="relative border-b border-amber-500/20 overflow-hidden">
      {/* halos */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/8 via-transparent to-transparent" />
      <div className="absolute -top-32 -left-20 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="absolute -top-32 right-0 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-pitch opacity-40" />

      <div className="relative max-w-5xl mx-auto px-4 py-7">
        <div className="flex items-start justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring}
            className="min-w-0"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 4 }}
              >
                <Trophy className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              </motion.div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-amber-400 font-bold">
                FIFA World Cup 2026 • Panini
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl leading-[0.85] text-stone-100">
              MEU <span className="text-holo">ÁLBUM</span>
            </h1>
            <p className="text-xs text-stone-400 mt-2 font-mono">
              <AnimatedNumber value={stats.distintas} className="text-stone-200 font-bold" /> / {TOTAL_FIGURINHAS} figurinhas •{' '}
              <span className="text-emerald-400 font-bold">
                <AnimatedNumber value={stats.percentual} format={(n) => n.toFixed(1) + '%'} />
              </span>{' '}completo
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={spring}
            className="shrink-0 flex items-center gap-2"
          >
            {enabled && !user && (
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleEntrar}
                title="Entrar na conta"
                aria-label="Entrar"
                className="flex items-center gap-1.5 px-3 h-11 rounded-full bg-amber-400/15 ring-1 ring-amber-400/40 text-amber-300 hover:bg-amber-400/25 hover:text-amber-200 transition text-xs font-bold uppercase tracking-[0.2em]"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={abrirMenu}
              title="Abrir menu"
              aria-label="Abrir menu"
              className="relative flex items-center gap-2 pl-1.5 pr-3 h-11 rounded-full bg-stone-900/80 ring-1 ring-amber-400/30 hover:ring-amber-400/60 text-amber-300 hover:text-amber-200 transition shadow-[0_0_20px_-8px_rgba(251,191,36,0.6)]"
            >
              {user
                ? <Avatar user={user} size={32} />
                : <span className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center"><Menu className="w-4 h-4" /></span>
              }
              <span className="text-xs font-bold uppercase tracking-[0.2em] hidden sm:block">Menu</span>
            </motion.button>
          </motion.div>
        </div>

        {/* barra de progresso premium */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.1 }}
          className="mt-6"
        >
          <div className="relative h-3 bg-stone-900/80 rounded-full overflow-hidden ring-1 ring-stone-800 backdrop-blur">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentual}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 18 }}
              style={{
                background: 'linear-gradient(90deg,#f59e0b 0%,#fbbf24 50%,#10b981 100%)',
                boxShadow: '0 0 22px rgba(245,158,11,0.55), inset 0 0 8px rgba(255,255,255,0.25)',
              }}
            />
            <div className="absolute inset-0 bar-shimmer rounded-full opacity-80" />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] font-mono text-stone-500">
            <span>0</span><span>250</span><span>500</span><span>750</span><span className="text-amber-400">980</span>
          </div>
        </motion.div>
      </div>

      <SideMenu
        open={menuOpen}
        setOpen={setMenuOpen}
        onPacote={onPacote}
        onQuick={onQuick}
        onConfig={onConfig}
        onScan={onScan}
        onLogin={onLogin}
        colecao={colecao}
        onSubstituirColecao={onSubstituirColecao}
        pushToast={pushToast}
      />
    </header>
  );
}
