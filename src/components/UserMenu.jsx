import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, CloudUpload, CloudDownload, Cloud, User as UserIcon, Loader2, Link2, Check, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { pullCollection, pushCollection, remoteCount, saveUsername, getUsername } from '../lib/sync.js';
import { sfx, sfxState } from '../lib/sfx.js';

export default function UserMenu({ colecao, onAbrirLogin, onSubstituirColecao, pushToast }) {
  const { enabled, user, signOut, loading } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [busy, setBusy]     = useState(null); // 'push' | 'pull' | 'check'
  const [remoteN, setRemoteN] = useState(null);
  const [username, setUsername]       = useState('');
  const [usernameEdit, setUsernameEdit] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);
  const ref = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!aberto) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [aberto]);

  // Quando logar, checa quantas figurinhas existem na nuvem
  useEffect(() => {
    if (!user) { setRemoteN(null); setUsername(''); return; }
    let alive = true;
    setBusy('check');
    Promise.all([remoteCount(user.id), getUsername(user.id)])
      .then(([n, uname]) => {
        if (!alive) return;
        setRemoteN(n);
        setUsername(uname || '');
        setUsernameInput(uname || '');
      })
      .catch(() => {})
      .finally(() => { if (alive) setBusy(null); });
    return () => { alive = false; };
  }, [user]);

  // Após login, se a nuvem está vazia E há coleção local → oferece importar
  const importedRef = useRef(false);
  useEffect(() => {
    if (!user || importedRef.current || remoteN === null || busy) return;
    const local = Object.keys(colecao || {}).length;
    if (remoteN === 0 && local > 0) {
      importedRef.current = true;
      const ok = window.confirm(
        `Você tem ${local} figurinha(s) salva(s) localmente, mas sua nuvem está vazia.\n\nEnviar sua coleção local para a nuvem agora?`
      );
      if (ok) handlePush();
    }
  }, [user, remoteN, busy, colecao]);

  const handlePush = useCallback(async () => {
    if (!user) return;
    setBusy('push');
    try {
      await pushCollection(user.id, colecao);
      const n = await remoteCount(user.id);
      setRemoteN(n);
      sfx.ding();
      pushToast?.(`☁️ ${n} figurinha(s) salva(s) na nuvem`, 'emerald');
    } catch (e) {
      sfx.err();
      pushToast?.(`Erro ao enviar: ${e.message}`, 'rose');
    } finally {
      setBusy(null);
    }
  }, [user, colecao, pushToast]);

  const handlePull = useCallback(async () => {
    if (!user) return;
    if (!window.confirm('Substituir sua coleção local pelos dados da nuvem? A coleção local atual será perdida.')) return;
    setBusy('pull');
    try {
      const remote = await pullCollection(user.id);
      onSubstituirColecao?.(remote || {});
      sfx.ding();
      pushToast?.(`⬇️ ${Object.keys(remote || {}).length} figurinha(s) baixadas`, 'emerald');
    } catch (e) {
      sfx.err();
      pushToast?.(`Erro ao baixar: ${e.message}`, 'rose');
    } finally {
      setBusy(null);
    }
  }, [user, onSubstituirColecao, pushToast]);

  const handleLogout = useCallback(async () => {
    await signOut();
    setAberto(false);
    importedRef.current = false;
    sfx.close();
    pushToast?.('Você saiu da conta', 'amber');
  }, [signOut, pushToast]);

  const handleSaveUsername = useCallback(async () => {
    if (!user) return;
    const val = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!val) return;
    setUsernameSaving(true);
    try {
      await saveUsername(user.id, val);
      setUsername(val);
      setUsernameEdit(false);
      pushToast?.(`Apelido @${val} salvo!`, 'emerald');
    } catch (e) {
      pushToast?.(`Erro: ${e.message}`, 'rose');
    } finally {
      setUsernameSaving(false);
    }
  }, [user, usernameInput, pushToast]);

  if (!enabled) return null;

  // Não logado → botão "Entrar"
  if (!user) {
    return (
      <button
        onClick={() => { sfxState.unlock(); sfx.swoosh(); onAbrirLogin?.(); }}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 ring-1 ring-amber-400/40 text-amber-300 hover:bg-amber-400/25 transition text-xs font-bold"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
        Entrar
      </button>
    );
  }

  // Logado → avatar + dropdown
  const meta = user.user_metadata || {};
  const nome = meta.full_name || meta.name || user.email?.split('@')[0] || 'Você';
  const avatar = meta.avatar_url || meta.picture;
  const initial = (nome[0] || '?').toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { sfxState.unlock(); sfx.tick(); setAberto((v) => !v); }}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-stone-900/80 ring-1 ring-stone-800 hover:ring-amber-400/40 transition"
      >
        {avatar ? (
          <img src={avatar} alt={nome} className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-400/40" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 text-xs font-black flex items-center justify-center">
            {initial}
          </div>
        )}
        <span className="text-xs text-stone-200 font-bold max-w-[80px] truncate hidden sm:block">{nome}</span>
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-stone-950 ring-1 ring-amber-500/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
          >
            {/* Header do menu */}
            <div className="p-3 border-b border-stone-800/80 flex items-center gap-3">
              {avatar ? (
                <img src={avatar} alt={nome} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 text-sm font-black flex items-center justify-center">
                  {initial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-stone-100 truncate">{nome}</div>
                <div className="text-[10px] text-stone-500 truncate">{user.email}</div>
              </div>
            </div>

            {/* Status da nuvem */}
            <div className="px-3 py-2 border-b border-stone-800/80 flex items-center gap-2 text-xs">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-stone-300">
                Nuvem:{' '}
                {busy === 'check' ? (
                  <Loader2 className="w-3 h-3 inline animate-spin" />
                ) : (
                  <strong className="text-sky-300">{remoteN ?? '?'}</strong>
                )}{' '}
                / Local: <strong className="text-stone-100">{Object.keys(colecao || {}).length}</strong>
              </span>
            </div>

            {/* Ações */}
            <div className="p-2 space-y-1">
              {/* Apelido / link de trocas */}
              <div className="px-3 py-2 rounded-lg bg-stone-900/60">
                <div className="text-[10px] text-stone-500 font-bold tracking-widest mb-1.5 flex items-center gap-1">
                  <Link2 className="w-3 h-3" /> LINK DE TROCAS
                </div>
                {usernameEdit ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500 text-xs">@</span>
                    <input
                      autoFocus
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.replace(/[^a-z0-9_]/gi, ''))}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveUsername(); if (e.key === 'Escape') setUsernameEdit(false); }}
                      placeholder="seu_apelido"
                      maxLength={30}
                      className="flex-1 bg-stone-800 rounded-lg px-2 py-1 text-xs text-stone-100 outline-none ring-1 ring-stone-700 focus:ring-amber-400/60 min-w-0"
                    />
                    <button
                      onClick={handleSaveUsername}
                      disabled={usernameSaving || !usernameInput.trim()}
                      className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center disabled:opacity-40"
                    >
                      {usernameSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    </button>
                    <button onClick={() => setUsernameEdit(false)} className="w-6 h-6 rounded-lg bg-stone-800 text-stone-400 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : username ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`/trocas/${username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-xs text-amber-400 hover:underline truncate font-bold"
                    >
                      {window.location.host}/trocas/{username}
                    </a>
                    <button
                      onClick={() => { setUsernameInput(username); setUsernameEdit(true); }}
                      className="text-[10px] text-stone-500 hover:text-stone-300 shrink-0"
                    >
                      editar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setUsernameEdit(true)}
                    className="text-xs text-amber-400/70 hover:text-amber-300 transition"
                  >
                    + Definir apelido para criar link de trocas
                  </button>
                )}
              </div>

              <div className="border-t border-stone-800/80 my-1" />
              <button
                onClick={handlePush}
                disabled={busy !== null}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-stone-900 text-left text-xs disabled:opacity-50"
              >
                {busy === 'push' ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <CloudUpload className="w-4 h-4 text-emerald-400" />}
                <div className="flex-1">
                  <div className="font-bold text-stone-100">Enviar para nuvem</div>
                  <div className="text-[10px] text-stone-500">Substitui o que está na nuvem pelo local</div>
                </div>
              </button>
              <button
                onClick={handlePull}
                disabled={busy !== null}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-stone-900 text-left text-xs disabled:opacity-50"
              >
                {busy === 'pull' ? <Loader2 className="w-4 h-4 animate-spin text-sky-400" /> : <CloudDownload className="w-4 h-4 text-sky-400" />}
                <div className="flex-1">
                  <div className="font-bold text-stone-100">Baixar da nuvem</div>
                  <div className="text-[10px] text-stone-500">Substitui o local pelo que está na nuvem</div>
                </div>
              </button>
              <div className="border-t border-stone-800/80 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-950/40 text-left text-xs text-rose-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-bold">Sair</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
