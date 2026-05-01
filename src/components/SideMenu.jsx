import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Package, Settings, ScanLine, Volume2, VolumeX,
  LogIn, LogOut, Cloud, CloudOff, Loader2, RefreshCw, Check,
  Layers, Repeat,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { sfx, sfxState } from '../lib/sfx.js';
import { MODO_LABELS, MODO_HINTS } from '../contexts/ModoColagem.jsx';

const wrap = (fn, sound = 'tick', closeAfter, setOpen) => () => {
  sfxState.unlock();
  sfx[sound] && sfx[sound]();
  fn && fn();
  if (closeAfter) setOpen(false);
};

function Item({ icon: Icon, label, hint, onClick, disabled, tone = 'stone' }) {
  const tones = {
    stone:   'hover:bg-stone-900 text-stone-100',
    amber:   'hover:bg-amber-500/10 text-amber-200',
    emerald: 'hover:bg-emerald-500/10 text-emerald-200',
    sky:     'hover:bg-sky-500/10 text-sky-200',
    rose:    'hover:bg-rose-500/10 text-rose-200',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition disabled:opacity-50 disabled:cursor-not-allowed ${tones[tone] || tones.stone}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold leading-tight">{label}</div>
        {hint && <div className="text-[10px] text-stone-500 truncate">{hint}</div>}
      </div>
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="px-2 py-2">
      {title && (
        <div className="px-3 pb-1.5 text-[10px] uppercase tracking-[0.25em] font-bold text-stone-500">
          {title}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export default function SideMenu({
  open, setOpen,
  onPacote, onQuick, onConfig, onScan, onLogin,
  colecao, syncStatus = 'idle', onSincronizar, pushToast,
  modoColagem = 'completo', onChangeModo,
}) {
  const { enabled, user, signOut, loading, signInWithGoogle } = useAuth();
  const [muted, setMuted] = useState(() => sfxState.isMuted());
  const [busy, setBusy] = useState(null);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  // Trava scroll do body
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const toggleSfx = useCallback(() => {
    sfxState.unlock();
    const m = sfxState.toggle();
    setMuted(m);
    if (!m) sfx.tick && sfx.tick();
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut();
    setOpen(false);
    sfx.close();
    pushToast?.('Você saiu da conta', 'amber');
  }, [signOut, setOpen, pushToast]);

  const meta = user?.user_metadata || {};
  const nome = meta.full_name || meta.name || user?.email?.split('@')[0] || 'Você';
  const avatar = meta.avatar_url || meta.picture;
  const initials = nome
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map((p) => p[0]).join('').toUpperCase() || '?';
  const [avatarErr, setAvatarErr] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* drawer */}
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 w-[88%] max-w-sm bg-stone-950 border-l border-amber-500/20 shadow-[0_0_60px_rgba(0,0,0,0.7)] z-50 flex flex-col"
          >
            {/* header */}
            <div className="relative px-4 py-4 border-b border-stone-800/80 flex items-center justify-between bg-gradient-to-b from-amber-500/10 to-transparent">
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-amber-400">Menu</div>
              <button
                onClick={() => { sfxState.unlock(); sfx.close && sfx.close(); setOpen(false); }}
                className="w-8 h-8 rounded-lg bg-stone-900/80 ring-1 ring-stone-800 hover:ring-amber-400/40 flex items-center justify-center text-stone-300 hover:text-amber-300 transition"
                title="Fechar (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* conta */}
            {enabled && (
              <div className="px-3 py-3 border-b border-stone-800/80">
                {user ? (
                  <div className="flex items-center gap-3">
                    {avatar && !avatarErr ? (
                      <img
                        src={avatar}
                        alt={nome}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarErr(true)}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-amber-400/40"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 text-sm font-black flex items-center justify-center ring-1 ring-amber-400/40">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-stone-100 truncate">{nome}</div>
                      <div className="text-[10px] text-stone-500 truncate flex items-center gap-1">
                        {syncStatus === 'syncing' && (
                          <><Loader2 className="w-3 h-3 text-sky-400 animate-spin" /> <span className="text-sky-300">Sincronizando…</span></>
                        )}
                        {syncStatus === 'idle' && (
                          <><Check className="w-3 h-3 text-emerald-400" /> <span className="text-emerald-300">Sincronizado</span></>
                        )}
                        {syncStatus === 'error' && (
                          <><CloudOff className="w-3 h-3 text-rose-400" /> <span className="text-rose-300">Erro de sync</span></>
                        )}
                        <span className="text-stone-600">•</span>
                        <Cloud className="w-3 h-3 text-stone-500" />
                        <strong className="text-stone-300">{Object.keys(colecao || {}).length}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { sfxState.unlock(); sfx.swoosh && sfx.swoosh(); onLogin?.(); setOpen(false); }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-400/15 ring-1 ring-amber-400/40 text-amber-300 hover:bg-amber-400/25 transition text-sm font-bold"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    Entrar na conta
                  </button>
                )}
              </div>
            )}

            {/* corpo scroll */}
            <div className="flex-1 overflow-y-auto py-2">
              <Section title="Ações">
                <Item icon={Plus}    label="Adicionar"    hint="Atalho: A" tone="amber"
                  onClick={wrap(onQuick,  'swoosh', true, setOpen)} />
                <Item icon={Package} label="Abrir pacote" hint="Atalho: P" tone="amber"
                  onClick={wrap(onPacote, 'pack',   true, setOpen)} />
                {onScan && (
                  <Item icon={ScanLine} label="Escanear figurinha" hint="Atalho: S" tone="amber"
                    onClick={wrap(onScan, 'beep', true, setOpen)} />
                )}
              </Section>

              {enabled && user && syncStatus === 'error' && (
                <Section title="Nuvem">
                  <Item
                    icon={RefreshCw}
                    label="Tentar sincronizar de novo"
                    hint="A última sincronização falhou"
                    tone="rose"
                    onClick={() => { sfxState.unlock(); sfx.tick && sfx.tick(); onSincronizar?.(); }}
                  />
                </Section>
              )}

              <Section title="Preferências">
                <Item
                  icon={modoColagem === 'repetidas' ? Repeat : Layers}
                  label={`Modo: ${MODO_LABELS[modoColagem] || MODO_LABELS.completo}`}
                  hint={`Toque para alternar — ${MODO_HINTS[modoColagem === 'repetidas' ? 'completo' : 'repetidas']}`}
                  tone={modoColagem === 'repetidas' ? 'amber' : 'stone'}
                  onClick={() => {
                    sfxState.unlock();
                    sfx.tick && sfx.tick();
                    const novo = modoColagem === 'repetidas' ? 'completo' : 'repetidas';
                    onChangeModo?.(novo);
                  }}
                />
                <Item
                  icon={muted ? VolumeX : Volume2}
                  label={muted ? 'Som desligado' : 'Som ligado'}
                  hint="Toque para alternar"
                  onClick={toggleSfx}
                />
                <Item
                  icon={Settings}
                  label="Configurações"
                  hint="Preferências do álbum"
                  onClick={wrap(onConfig, 'tick', true, setOpen)}
                />
              </Section>

              {!user && (
                <Section title="Conta">
                  <Item
                    icon={busy === 'google' ? Loader2 : LogIn}
                    label="Entrar com Google"
                    hint="Login rápido com sua conta Google"
                    tone="sky"
                    disabled={loading || busy === 'google'}
                    onClick={async () => {
                      sfxState.unlock();
                      sfx.swoosh && sfx.swoosh();
                      if (!enabled) {
                        pushToast?.('Configure o Supabase no .env.local para usar o login', 'amber');
                        return;
                      }
                      setBusy('google');
                      try { await signInWithGoogle(); } catch (e) {
                        pushToast?.(`Erro no login: ${e?.message}`, 'rose');
                      } finally { setBusy(null); }
                    }}
                  />
                  <Item
                    icon={LogIn}
                    label="Entrar com e-mail"
                    hint="Link mágico sem senha"
                    tone="amber"
                    disabled={loading}
                    onClick={() => { sfxState.unlock(); sfx.swoosh && sfx.swoosh(); onLogin?.(); setOpen(false); }}
                  />
                </Section>
              )}
              {enabled && user && (
                <Section title="Conta">
                  <Item icon={LogOut} label="Sair da conta" tone="rose" onClick={handleLogout} />
                </Section>
              )}
            </div>

            <div className="px-4 py-3 border-t border-stone-800/80 text-[10px] text-stone-600 font-mono text-center">
              FIFA World Cup 2026 • Panini
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
