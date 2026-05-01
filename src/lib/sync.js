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
 * Busca as repetidas públicas de um usuário pelo username.
 * Retorna { displayName, avatarUrl, repetidas: [{ stickerId, owned, extras }] }
 * ou null se o username não existir.
 */
export async function fetchTrocasPublicas(username) {
  if (!SUPABASE_ENABLED) return null;
  const { data, error } = await supabase
    .from('trocas_publicas')
    .select('username, display_name, avatar_url, sticker_id, owned, extras')
    .eq('username', username.toLowerCase().trim());
  if (error) throw error;
  if (!data || data.length === 0) return null;
  const first = data[0];
  return {
    username: first.username,
    displayName: first.display_name,
    avatarUrl: first.avatar_url,
    repetidas: data.map((r) => ({ stickerId: r.sticker_id, owned: r.owned, extras: r.extras })),
  };
}

/**
 * Salva/atualiza o username do usuário logado.
 */
export async function saveUsername(userId, username) {
  if (!SUPABASE_ENABLED || !userId) return;
  const { error } = await supabase
    .from('profiles')
    .update({ username: username.toLowerCase().trim() })
    .eq('id', userId);
  if (error) throw error;
}

/**
 * Busca o username atual do usuário logado.
 */
export async function getUsername(userId) {
  if (!SUPABASE_ENABLED || !userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data?.username ?? null;
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

// ───────────────────────── AMIGOS ─────────────────────────────────────────────

/**
 * Procura um perfil pelo username (exato, case-insensitive).
 * Retorna { id, username, displayName, avatarUrl } ou null.
 */
export async function searchProfileByUsername(username) {
  if (!SUPABASE_ENABLED || !username) return null;
  const u = username.toLowerCase().trim().replace(/^@/, '');
  if (!u) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .eq('username', u)
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
  };
}

/**
 * Envia um pedido de amizade. Se já existir uma amizade aceita ou pendente,
 * retorna { ok:false, reason }.
 * Se já houver um pedido recebido do outro lado, aceita imediatamente.
 */
export async function sendFriendRequest(myId, friendId) {
  if (!SUPABASE_ENABLED || !myId || !friendId) return { ok: false, reason: 'desabilitado' };
  if (myId === friendId) return { ok: false, reason: 'voce_mesmo' };

  // Já existe relação?
  const { data: existing } = await supabase
    .from('friendships')
    .select('user_id, friend_id, status')
    .or(`and(user_id.eq.${myId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${myId})`);

  if (existing && existing.length > 0) {
    const row = existing[0];
    if (row.status === 'accepted') return { ok: false, reason: 'ja_amigos' };
    // Pedido inverso pendente? Aceita.
    if (row.user_id === friendId && row.friend_id === myId && row.status === 'pending') {
      const { error: errAcc } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('user_id', friendId)
        .eq('friend_id', myId);
      if (errAcc) return { ok: false, reason: 'erro' };
      return { ok: true, status: 'accepted' };
    }
    return { ok: false, reason: 'pendente' };
  }

  const { error } = await supabase
    .from('friendships')
    .insert({ user_id: myId, friend_id: friendId, status: 'pending' });
  if (error) return { ok: false, reason: 'erro' };
  return { ok: true, status: 'pending' };
}

export async function acceptFriendRequest(requesterId, myId) {
  if (!SUPABASE_ENABLED) return false;
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('user_id', requesterId)
    .eq('friend_id', myId);
  return !error;
}

/**
 * Remove a relação (cancelar pedido enviado, recusar pedido recebido,
 * ou desfazer amizade). Tenta apagar nas duas direções.
 */
export async function removeFriendship(myId, otherId) {
  if (!SUPABASE_ENABLED) return false;
  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(`and(user_id.eq.${myId},friend_id.eq.${otherId}),and(user_id.eq.${otherId},friend_id.eq.${myId})`);
  return !error;
}

/**
 * Lista amizades do usuário em três grupos: aceitas, recebidas (pending),
 * enviadas (pending). Cada item inclui o perfil do "outro lado".
 */
export async function listFriendships(myId) {
  if (!SUPABASE_ENABLED || !myId) return { aceitas: [], recebidas: [], enviadas: [] };
  const { data, error } = await supabase
    .from('friendships')
    .select('user_id, friend_id, status, created_at');
  if (error) return { aceitas: [], recebidas: [], enviadas: [] };

  const otherIds = new Set();
  (data || []).forEach((r) => {
    otherIds.add(r.user_id === myId ? r.friend_id : r.user_id);
  });
  if (otherIds.size === 0) return { aceitas: [], recebidas: [], enviadas: [] };

  const { data: profs } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', Array.from(otherIds));
  const profMap = new Map((profs || []).map((p) => [p.id, p]));

  const aceitas = [];
  const recebidas = [];
  const enviadas = [];
  for (const row of data || []) {
    const otherId = row.user_id === myId ? row.friend_id : row.user_id;
    const prof = profMap.get(otherId);
    if (!prof) continue;
    const item = {
      id: otherId,
      username: prof.username,
      displayName: prof.display_name,
      avatarUrl: prof.avatar_url,
      createdAt: row.created_at,
    };
    if (row.status === 'accepted') aceitas.push(item);
    else if (row.user_id === myId) enviadas.push(item);
    else recebidas.push(item);
  }
  return { aceitas, recebidas, enviadas };
}

/**
 * Baixa a coleção completa de um amigo (já aceito).
 * Retorna mapa { stickerId: owned }.
 */
export async function fetchFriendCollection(friendId) {
  if (!SUPABASE_ENABLED || !friendId) return {};
  const { data, error } = await supabase
    .from('collections')
    .select('sticker_id, owned')
    .eq('user_id', friendId);
  if (error) return {};
  const map = {};
  for (const row of data || []) if (row.owned > 0) map[row.sticker_id] = row.owned;
  return map;
}
