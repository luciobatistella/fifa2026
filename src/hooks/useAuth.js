import { useEffect, useState, useCallback } from 'react';
import { supabase, SUPABASE_ENABLED } from '../lib/supabase.js';

/**
 * Sessão Supabase + helpers de login/logout.
 * Magic link (email) e Google OAuth.
 */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(SUPABASE_ENABLED);

  useEffect(() => {
    if (!SUPABASE_ENABLED) return;
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const signInWithEmail = useCallback(async (email) => {
    if (!SUPABASE_ENABLED) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!SUPABASE_ENABLED) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (!SUPABASE_ENABLED) return;
    await supabase.auth.signOut({ scope: 'global' });
  }, []);

  return {
    enabled: SUPABASE_ENABLED,
    session,
    user: session?.user ?? null,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signOut,
  };
}
