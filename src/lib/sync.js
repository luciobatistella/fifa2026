import { supabase, SUPABASE_ENABLED } from './supabase.js';

/**
 * Sync helpers para a tabela `collections`.
 * Estrutura local: { [stickerId]: quantidade }
 */

export async function pullCollection(userId) {
  if (!SUPABASE_ENABLED || !userId) return null;
  const { data, error } = await supabase
    .from('collections')
    .select('sticker_id, owned')
    .eq('user_id', userId);
  if (error) throw error;
  const map = {};
  for (const row of data || []) {
    if (row.owned > 0) map[row.sticker_id] = row.owned;
  }
  return map;
}

/**
 * Substitui a coleção remota pela local (full replace).
 * Estratégia simples e previsível para sync manual.
 */
export async function pushCollection(userId, colecao) {
  if (!SUPABASE_ENABLED || !userId) return;
  const rows = Object.entries(colecao || {})
    .filter(([, qtd]) => qtd > 0)
    .map(([sticker_id, owned]) => ({ user_id: userId, sticker_id, owned }));

  // Apaga as figurinhas remotas que não estão mais no local.
  const { data: remoteRows, error: errRemote } = await supabase
    .from('collections')
    .select('sticker_id')
    .eq('user_id', userId);
  if (errRemote) throw errRemote;

  const localIds = new Set(rows.map((r) => r.sticker_id));
  const toDelete = (remoteRows || [])
    .map((r) => r.sticker_id)
    .filter((id) => !localIds.has(id));

  if (toDelete.length > 0) {
    const { error: errDel } = await supabase
      .from('collections')
      .delete()
      .eq('user_id', userId)
      .in('sticker_id', toDelete);
    if (errDel) throw errDel;
  }

  if (rows.length > 0) {
    const { error: errUp } = await supabase
      .from('collections')
      .upsert(rows, { onConflict: 'user_id,sticker_id' });
    if (errUp) throw errUp;
  }
}

/**
 * Conta quantas figurinhas o usuário tem na nuvem (sem baixar tudo).
 */
export async function remoteCount(userId) {
  if (!SUPABASE_ENABLED || !userId) return 0;
  const { count, error } = await supabase
    .from('collections')
    .select('sticker_id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count || 0;
}
