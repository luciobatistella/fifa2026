import React, { useState } from 'react';
import { Mail, LogIn, Loader2, Check, AlertCircle } from 'lucide-react';
import ModalBase from './ModalBase.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { sfx } from '../../lib/sfx.js';

export default function ModalLogin({ aberto, onFechar }) {
  const { enabled, signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(null); // 'email' | 'google' | null
  const [sent, setSent]       = useState(false);
  const [erro, setErro]       = useState('');

  const submitEmail = async (e) => {
    e.preventDefault();
    setErro('');
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErro('E-mail inválido'); sfx.err(); return; }
    setLoading('email');
    try {
      await signInWithEmail(email.trim());
      setSent(true);
      sfx.ding();
    } catch (e) {
      setErro(e?.message || 'Falha ao enviar link');
      sfx.err();
    } finally {
      setLoading(null);
    }
  };

  const loginGoogle = async () => {
    setErro('');
    setLoading('google');
    try {
      await signInWithGoogle(); // redireciona
    } catch (e) {
      setErro(e?.message || 'Falha no login Google');
      sfx.err();
      setLoading(null);
    }
  };

  return (
    <ModalBase
      aberto={aberto}
      onFechar={onFechar}
      icone={LogIn}
      titulo="Entrar na sua conta"
      subtitulo="Salve sua coleção na nuvem e acesse de qualquer lugar"
      maxW="max-w-sm"
    >
      {!enabled ? (
        <div className="text-center py-6 text-sm text-stone-300">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <div className="font-bold mb-2">Supabase não configurado</div>
          <div className="text-xs text-stone-500">
            Defina <code className="font-mono text-amber-400">VITE_SUPABASE_URL</code> e{' '}
            <code className="font-mono text-amber-400">VITE_SUPABASE_ANON_KEY</code> em{' '}
            <code className="font-mono text-amber-400">.env.local</code> e reinicie o dev server.
          </div>
        </div>
      ) : sent ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40 flex items-center justify-center mx-auto mb-3">
            <Check className="w-7 h-7 text-emerald-300" />
          </div>
          <div className="font-bold text-stone-100 mb-1">Verifique seu e-mail</div>
          <div className="text-xs text-stone-400">
            Enviamos um link mágico para <strong className="text-stone-200">{email}</strong>.<br />
            Clique nele para entrar.
          </div>
          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="mt-4 text-xs text-amber-400 hover:underline"
          >
            Usar outro e-mail
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Google */}
          <button
            onClick={loginGoogle}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-stone-900 font-bold text-sm hover:bg-stone-100 transition disabled:opacity-60"
          >
            {loading === 'google'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : (
                <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 7.1 29.5 5 24 5 16.3 5 9.7 9 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.6 4.9l6.2 5.2C40.2 35.6 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z"/>
                </svg>
              )}
            Continuar com Google
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-800" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.25em] text-stone-500">
              <span className="bg-stone-950 px-3">ou</span>
            </div>
          </div>

          {/* Magic link */}
          <form onSubmit={submitEmail} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-900 ring-1 ring-stone-800 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  disabled={loading !== null}
                />
              </div>
            </div>

            {erro && (
              <div className="text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading !== null || !email}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-400 text-stone-950 font-bold text-sm hover:bg-amber-300 transition disabled:opacity-60"
            >
              {loading === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Enviar link mágico
            </button>
            <p className="text-[10px] text-stone-500 text-center">
              Sem senha. Você recebe um link no e-mail e clica para entrar.
            </p>
          </form>
        </div>
      )}
    </ModalBase>
  );
}
