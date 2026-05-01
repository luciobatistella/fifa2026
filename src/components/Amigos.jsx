import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, Check, X, Loader2, ArrowLeft, ArrowRight,
  ArrowLeftRight, Send, AlertCircle, Trash2, Inbox, Clock,
  AtSign, Copy, Share2,
} from 'lucide-react';
import { rotuloFigurinha } from '../lib/figurinhas.js';
import { listAllIds } from '../data/album.js';
import {
  searchProfileByUsername, sendFriendRequest, acceptFriendRequest,
  removeFriendship, listFriendships, fetchFriendCollection,
  getUsername, saveUsername,
} from '../lib/sync.js';
import { SUPABASE_ENABLED } from '../lib/supabase.js';
import { sfx } from '../lib/sfx.js';

const TODAS_IDS = listAllIds();

function Avatar({ url, nome, size = 'w-10 h-10' }) {
  const inicial = (nome?.[0] || '?').toUpperCase();
  if (url) return <img src={url} alt={nome} className={`${size} rounded-full object-cover ring-1 ring-amber-400/30`} />;
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-black flex items-center justify-center`}>
      {inicial}
    </div>
  );
}

// ─── Tela de match com um amigo ─────────────────────────────────────────────
function TelaMatch({ amigo, minhaColecao, pushToast, onVoltar, meuUsername }) {
  const [estado, setEstado]   = useState('carregando');
  const [colAmigo, setColAmigo] = useState({});
  const [tab, setTab]         = useState('pedir'); // 'pedir' | 'oferecer'
  const [selPedir, setSelPedir]       = useState(() => new Set());
  const [selOferecer, setSelOferecer] = useState(() => new Set());

  useEffect(() => {
    let vivo = true;
    setEstado('carregando');
    fetchFriendCollection(amigo.id)
      .then((map) => { if (!vivo) return; setColAmigo(map); setEstado('ok'); })
      .catch(() => { if (vivo) setEstado('erro'); });
    return () => { vivo = false; };
  }, [amigo.id]);

  const { posso_pedir, posso_oferecer } = useMemo(() => {
    const pedir = [];     // amigo tem extra, eu não tenho
    const oferecer = [];  // eu tenho extra, amigo não tem
    for (const id of TODAS_IDS) {
      const meu  = minhaColecao[id]   || 0;
      const dele = colAmigo[id] || 0;
      if (dele > 1 && meu === 0) {
        pedir.push({ id, info: rotuloFigurinha(id), extrasDele: dele - 1 });
      }
      if (meu > 1 && dele === 0) {
        oferecer.push({ id, info: rotuloFigurinha(id), extrasMeus: meu - 1 });
      }
    }
    pedir.sort((a, b) => a.info.titulo.localeCompare(b.info.titulo));
    oferecer.sort((a, b) => a.info.titulo.localeCompare(b.info.titulo));
    return { posso_pedir: pedir, posso_oferecer: oferecer };
  }, [minhaColecao, colAmigo]);

  const toggle = (set, setSet) => (id) => {
    const novo = new Set(set);
    if (novo.has(id)) novo.delete(id); else novo.add(id);
    setSet(novo);
  };
  const togglePedir    = toggle(selPedir, setSelPedir);
  const toggleOferecer = toggle(selOferecer, setSelOferecer);

  const selecionarTodos = () => {
    if (tab === 'pedir')    setSelPedir(new Set(posso_pedir.map((x) => x.id)));
    else                    setSelOferecer(new Set(posso_oferecer.map((x) => x.id)));
  };
  const limpar = () => { tab === 'pedir' ? setSelPedir(new Set()) : setSelOferecer(new Set()); };

  const montarTexto = () => {
    const linhas = [`🎽 PROPOSTA DE TROCA — Álbum FIFA World Cup 2026`];
    if (meuUsername) linhas.push(`De: @${meuUsername}`);
    linhas.push(`Para: ${amigo.displayName || amigo.username} (@${amigo.username})`);
    linhas.push('');

    if (selPedir.size > 0) {
      linhas.push(`📥 EU QUERO (${selPedir.size}):`);
      posso_pedir.filter((x) => selPedir.has(x.id)).forEach((x) => {
        linhas.push(`  • ${x.info.code} — ${x.info.emoji} ${x.info.titulo}`);
      });
      linhas.push('');
    }
    if (selOferecer.size > 0) {
      linhas.push(`📤 EU OFEREÇO (${selOferecer.size}):`);
      posso_oferecer.filter((x) => selOferecer.has(x.id)).forEach((x) => {
        linhas.push(`  • ${x.info.code} — ${x.info.emoji} ${x.info.titulo}`);
      });
    }
    return linhas.join('\n');
  };

  const enviarTroca = async () => {
    if (selPedir.size === 0 && selOferecer.size === 0) {
      pushToast('Selecione ao menos uma figurinha', 'rose');
      return;
    }
    const texto = montarTexto();
    try {
      await navigator.clipboard.writeText(texto);
      sfx.ding();
      pushToast('Proposta copiada! Cole no WhatsApp/DM', 'emerald');
    } catch (_) {
      pushToast('Não foi possível copiar', 'rose');
    }
    // tenta abrir WhatsApp também
    const wa = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    try { window.open(wa, '_blank', 'noopener,noreferrer'); } catch (_) {}
  };

  if (estado === 'carregando') {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }
  if (estado === 'erro') {
    return (
      <div className="py-20 text-center text-stone-400">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-400 mb-3" />
        <p>Erro ao carregar a coleção do amigo.</p>
        <button onClick={onVoltar} className="mt-4 text-amber-400 text-sm font-bold">Voltar</button>
      </div>
    );
  }

  const lista     = tab === 'pedir' ? posso_pedir : posso_oferecer;
  const sel       = tab === 'pedir' ? selPedir : selOferecer;
  const onToggle  = tab === 'pedir' ? togglePedir : toggleOferecer;

  return (
    <div className="space-y-4">
      <button onClick={onVoltar} className="flex items-center gap-2 text-stone-400 hover:text-amber-400 text-sm font-bold transition">
        <ArrowLeft className="w-4 h-4" /> Voltar para amigos
      </button>

      {/* Header amigo */}
      <div className="flex items-center gap-3 p-4 rounded-2xl ring-1 ring-amber-500/30 bg-gradient-to-br from-amber-900/20 via-stone-900 to-stone-950">
        <Avatar url={amigo.avatarUrl} nome={amigo.displayName || amigo.username} size="w-14 h-14" />
        <div className="flex-1 min-w-0">
          <div className="font-black text-stone-100 truncate">{amigo.displayName || amigo.username}</div>
          <div className="text-xs text-stone-500">@{amigo.username}</div>
        </div>
        <ArrowLeftRight className="w-7 h-7 text-amber-400/70 shrink-0" />
      </div>

      {/* Resumo do match */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-stone-900 ring-1 ring-emerald-500/30 p-3">
          <div className="text-[10px] text-emerald-400 font-bold tracking-wider mb-1">PEDIR PARA ELE</div>
          <div className="text-3xl font-black text-emerald-400">{posso_pedir.length}</div>
          <div className="text-[11px] text-stone-500">figurinhas que ele tem extra</div>
        </div>
        <div className="rounded-xl bg-stone-900 ring-1 ring-amber-500/30 p-3">
          <div className="text-[10px] text-amber-400 font-bold tracking-wider mb-1">OFERECER A ELE</div>
          <div className="text-3xl font-black text-amber-400">{posso_oferecer.length}</div>
          <div className="text-[11px] text-stone-500">suas extras que ele precisa</div>
        </div>
      </div>

      {/* Tabs pedir / oferecer */}
      <div className="flex items-center gap-1 bg-stone-900 rounded-xl p-1 ring-1 ring-stone-800">
        <button
          onClick={() => setTab('pedir')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            tab === 'pedir' ? 'bg-emerald-400 text-stone-950' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Pedir ({posso_pedir.length})
          {selPedir.size > 0 && <span className="ml-1 px-1.5 rounded-full bg-stone-950/30 text-[10px]">{selPedir.size}</span>}
        </button>
        <button
          onClick={() => setTab('oferecer')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
            tab === 'oferecer' ? 'bg-amber-400 text-stone-950' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Oferecer ({posso_oferecer.length}) <ArrowRight className="w-3.5 h-3.5" />
          {selOferecer.size > 0 && <span className="ml-1 px-1.5 rounded-full bg-stone-950/30 text-[10px]">{selOferecer.size}</span>}
        </button>
      </div>

      {/* Ações de seleção */}
      {lista.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <button onClick={selecionarTodos} className="px-3 py-1.5 rounded-lg bg-stone-900 ring-1 ring-stone-800 text-stone-300 font-bold hover:ring-amber-500/40">
            Selecionar tudo
          </button>
          <button onClick={limpar} className="px-3 py-1.5 rounded-lg bg-stone-900 ring-1 ring-stone-800 text-stone-400 font-bold hover:ring-rose-500/40">
            Limpar
          </button>
          <span className="ml-auto text-stone-500">{sel.size} selecionada{sel.size !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Lista */}
      {lista.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          <ArrowLeftRight className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {tab === 'pedir'
              ? 'Ele não tem figurinhas extras que você precisa'
              : 'Você não tem extras que ele precisa'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {lista.map((x) => {
            const ativo = sel.has(x.id);
            return (
              <button
                key={x.id}
                onClick={() => onToggle(x.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl ring-1 transition text-left ${
                  ativo
                    ? (tab === 'pedir' ? 'bg-emerald-500/10 ring-emerald-500/50' : 'bg-amber-500/10 ring-amber-500/50')
                    : 'bg-stone-900 ring-stone-800 hover:ring-stone-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ring-1 ${
                  ativo
                    ? (tab === 'pedir' ? 'bg-emerald-400 ring-emerald-400 text-stone-950' : 'bg-amber-400 ring-amber-400 text-stone-950')
                    : 'ring-stone-700 bg-stone-950'
                }`}>
                  {ativo && <Check className="w-3 h-3" />}
                </div>
                <span className="text-2xl">{x.info.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{x.info.titulo}</div>
                  <div className="text-[11px] text-stone-500">{x.info.sub}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                  tab === 'pedir' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                }`}>
                  {tab === 'pedir' ? `${x.extrasDele}× extra` : `${x.extrasMeus}× sua`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Botão de envio fixo */}
      {(selPedir.size > 0 || selOferecer.size > 0) && (
        <motion.div
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="sticky bottom-4 z-10"
        >
          <button
            onClick={enviarTroca}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
          >
            <Send className="w-4 h-4" />
            Solicitar troca ({selPedir.size + selOferecer.size})
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Tela principal de Amigos ───────────────────────────────────────────────
export default function Amigos({ userId, minhaColecao, pushToast }) {
  const [carregando, setCarregando] = useState(true);
  const [grupos, setGrupos]         = useState({ aceitas: [], recebidas: [], enviadas: [] });
  const [busca, setBusca]           = useState('');
  const [buscando, setBuscando]     = useState(false);
  const [resultado, setResultado]   = useState(null); // {found:false} | profile
  const [amigoAberto, setAmigoAberto] = useState(null);
  const [meuUsername, setMeuUsername] = useState(null);
  const [editandoApelido, setEditandoApelido] = useState(false);
  const [apelidoInput, setApelidoInput] = useState('');
  const [salvandoApelido, setSalvandoApelido] = useState(false);

  const recarregar = async () => {
    if (!userId) return;
    setCarregando(true);
    const [g, uname] = await Promise.all([
      listFriendships(userId),
      getUsername(userId),
    ]);
    setGrupos(g);
    setMeuUsername(uname || null);
    setCarregando(false);
  };

  useEffect(() => { recarregar(); /* eslint-disable-next-line */ }, [userId]);

  const copiarApelido = async () => {
    if (!meuUsername) return;
    try {
      await navigator.clipboard.writeText(`@${meuUsername}`);
      sfx.ding();
      pushToast(`@${meuUsername} copiado!`, 'emerald');
    } catch (_) {
      pushToast('Não foi possível copiar', 'rose');
    }
  };

  const compartilharLink = async () => {
    if (!meuUsername) return;
    const url = `${window.location.origin}/trocas/${meuUsername}`;
    const texto = `Vem trocar figurinhas comigo no álbum da Copa! Meu apelido: @${meuUsername}\n${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Álbum Copa 2026', text: texto, url }); return; } catch (_) {}
    }
    try {
      await navigator.clipboard.writeText(texto);
      sfx.ding();
      pushToast('Link copiado!', 'emerald');
    } catch (_) {
      pushToast('Não foi possível copiar', 'rose');
    }
  };

  const abrirEditorApelido = () => {
    setApelidoInput(meuUsername || '');
    setEditandoApelido(true);
  };

  const salvarApelido = async () => {
    const val = apelidoInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!val || val.length < 3) {
      pushToast('Apelido precisa ter pelo menos 3 caracteres (a-z, 0-9, _)', 'rose');
      return;
    }
    setSalvandoApelido(true);
    try {
      await saveUsername(userId, val);
      setMeuUsername(val);
      setEditandoApelido(false);
      sfx.ding();
      pushToast(`Apelido @${val} salvo!`, 'emerald');
    } catch (e) {
      const msg = /duplicate|unique/i.test(e?.message || '')
        ? 'Esse apelido já está em uso'
        : `Erro: ${e.message}`;
      pushToast(msg, 'rose');
    } finally {
      setSalvandoApelido(false);
    }
  };

  const handleBuscar = async (e) => {
    e?.preventDefault();
    const q = busca.trim().replace(/^@/, '');
    if (!q) return;
    setBuscando(true);
    setResultado(null);
    const prof = await searchProfileByUsername(q);
    setBuscando(false);
    if (!prof) { setResultado({ found: false }); return; }
    if (prof.id === userId) { setResultado({ found: false, eu: true }); return; }
    setResultado(prof);
  };

  const handleEnviar = async (perfil) => {
    const r = await sendFriendRequest(userId, perfil.id);
    if (!r.ok) {
      const msg = {
        ja_amigos: 'Vocês já são amigos',
        pendente:  'Pedido já está pendente',
        voce_mesmo: 'Não dá para adicionar você mesmo',
        desabilitado: 'Login necessário',
      }[r.reason] || 'Não foi possível enviar';
      // Se já são amigos, abre o match diretamente
      if (r.reason === 'ja_amigos') {
        setBusca(''); setResultado(null);
        setAmigoAberto(perfil);
        return;
      }
      pushToast(msg, 'rose');
      return;
    }
    sfx.ding();
    const aceito = r.status === 'accepted';
    pushToast(aceito ? 'Vocês agora são amigos! Veja o match 👇' : 'Pedido enviado', 'emerald');
    setBusca(''); setResultado(null);
    recarregar();
    // Se virou amizade na hora, já abre o match
    if (aceito) setAmigoAberto(perfil);
  };

  const handleAceitar = async (perfil) => {
    const ok = await acceptFriendRequest(perfil.id, userId);
    if (!ok) { pushToast('Erro ao aceitar', 'rose'); return; }
    sfx.ding();
    pushToast('Amizade aceita! Veja o match 👇', 'emerald');
    recarregar();
    // Abre o match automaticamente
    setAmigoAberto(perfil);
  };

  const handleRemover = async (otherId, msg = 'Removido') => {
    const ok = await removeFriendship(userId, otherId);
    if (!ok) { pushToast('Erro', 'rose'); return; }
    pushToast(msg, 'amber');
    recarregar();
  };

  if (!SUPABASE_ENABLED) {
    return (
      <div className="text-center py-20 text-stone-400">
        <AlertCircle className="w-12 h-12 mx-auto text-amber-400 mb-3" />
        <p className="text-sm">Funcionalidade disponível apenas com Supabase configurado.</p>
      </div>
    );
  }
  if (!userId) {
    return (
      <div className="text-center py-20 text-stone-400">
        <Users className="w-12 h-12 mx-auto text-stone-700 mb-3" />
        <p className="text-sm">Faça login para adicionar amigos e trocar figurinhas.</p>
      </div>
    );
  }

  if (amigoAberto) {
    return (
      <TelaMatch
        amigo={amigoAberto}
        minhaColecao={minhaColecao}
        pushToast={pushToast}
        meuUsername={meuUsername}
        onVoltar={() => setAmigoAberto(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Meu apelido */}
      <div className={`rounded-2xl p-4 ring-1 ${meuUsername ? 'ring-amber-500/30 bg-gradient-to-br from-amber-900/20 via-stone-900 to-stone-950' : 'ring-amber-500/40 bg-amber-950/20'}`}>
        <div className="text-[10px] font-bold tracking-[0.2em] mb-2 flex items-center gap-1.5 text-amber-400">
          <AtSign className="w-3 h-3" /> SEU APELIDO
        </div>

        {editandoApelido ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-stone-500 text-base font-bold">@</span>
              <input
                autoFocus
                value={apelidoInput}
                onChange={(e) => setApelidoInput(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') salvarApelido(); if (e.key === 'Escape') setEditandoApelido(false); }}
                placeholder="seu_apelido"
                maxLength={30}
                className="flex-1 bg-stone-950 ring-1 ring-stone-800 focus:ring-amber-500/60 rounded-lg px-3 py-2 text-sm text-stone-100 outline-none min-w-0"
              />
              <button
                onClick={salvarApelido}
                disabled={salvandoApelido || !apelidoInput.trim()}
                className="h-9 px-3 rounded-lg bg-emerald-400 text-stone-950 text-xs font-bold flex items-center gap-1 hover:bg-emerald-300 disabled:opacity-40 shrink-0"
              >
                {salvandoApelido ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Salvar
              </button>
              <button
                onClick={() => setEditandoApelido(false)}
                className="w-9 h-9 rounded-lg bg-stone-900 ring-1 ring-stone-800 text-stone-400 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[11px] text-stone-500">Use apenas letras minúsculas, números e _ (mín. 3 caracteres).</div>
          </div>
        ) : meuUsername ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-lg font-black text-stone-100 truncate">@{meuUsername}</div>
              <div className="text-[11px] text-stone-500 truncate">Compartilhe com seus amigos para que eles te adicionem.</div>
            </div>
            <button
              onClick={copiarApelido}
              className="w-9 h-9 rounded-lg bg-stone-900 ring-1 ring-stone-800 text-amber-300 flex items-center justify-center hover:ring-amber-500/40 shrink-0"
              title="Copiar @apelido"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={compartilharLink}
              className="h-9 px-3 rounded-lg bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-300 shrink-0"
              title="Compartilhar link"
            >
              <Share2 className="w-3.5 h-3.5" /> Compartilhar
            </button>
            <button
              onClick={abrirEditorApelido}
              className="text-[10px] text-stone-500 hover:text-stone-300 px-1"
              title="Editar apelido"
            >
              editar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
              <div className="text-xs text-stone-300">
                Você ainda não tem um apelido. Defina um para que seus amigos consigam te encontrar pela busca.
              </div>
            </div>
            <button
              onClick={abrirEditorApelido}
              className="w-full h-9 px-3 rounded-lg bg-amber-400 text-stone-950 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-300"
            >
              <UserPlus className="w-3.5 h-3.5" /> Definir meu apelido
            </button>
          </div>
        )}
      </div>

      {/* Buscar */}
      <div className="rounded-2xl ring-1 ring-stone-800 bg-stone-900 p-4">
        <div className="text-[10px] text-amber-400 font-bold tracking-[0.2em] mb-2">ADICIONAR AMIGO</div>
        <form onSubmit={handleBuscar} className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 rounded-lg bg-stone-950 ring-1 ring-stone-800 focus-within:ring-amber-500/50">
            <Search className="w-4 h-4 text-stone-500" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="apelido (@username)"
              className="flex-1 bg-transparent py-2.5 text-sm text-stone-100 placeholder:text-stone-600 outline-none"
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
            />
          </div>
          <button
            type="submit" disabled={buscando}
            className="px-4 rounded-lg bg-amber-400 text-stone-950 text-xs font-bold hover:bg-amber-300 transition disabled:opacity-50"
          >
            {buscando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
          </button>
        </form>

        <AnimatePresence>
          {resultado && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="mt-3"
            >
              {!resultado.found && resultado.eu ? (
                <div className="text-xs text-stone-500 px-1">Esse é você mesmo 🙂</div>
              ) : !resultado.id ? (
                <div className="text-xs text-stone-500 px-1">Nenhum usuário com esse apelido.</div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-950 ring-1 ring-amber-500/30">
                  <Avatar url={resultado.avatarUrl} nome={resultado.displayName || resultado.username} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{resultado.displayName || resultado.username}</div>
                    <div className="text-[11px] text-stone-500">@{resultado.username}</div>
                  </div>
                  <button
                    onClick={() => handleEnviar(resultado)}
                    className="px-3 py-2 rounded-lg bg-emerald-400 text-stone-950 text-xs font-bold flex items-center gap-1 hover:bg-emerald-300"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {carregando ? (
        <div className="py-12 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Recebidas */}
          {grupos.recebidas.length > 0 && (
            <Secao titulo="Pedidos recebidos" icone={Inbox} cor="emerald" qtd={grupos.recebidas.length}>
              {grupos.recebidas.map((p) => (
                <LinhaPerfil key={p.id} perfil={p}
                  acoes={
                    <>
                      <button onClick={() => handleAceitar(p)} className="w-9 h-9 rounded-lg bg-emerald-400 text-stone-950 flex items-center justify-center hover:bg-emerald-300" title="Aceitar">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRemover(p.id, 'Pedido recusado')} className="w-9 h-9 rounded-lg bg-stone-800 text-stone-400 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-300" title="Recusar">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  }
                />
              ))}
            </Secao>
          )}

          {/* Aceitas */}
          <Secao titulo="Meus amigos" icone={Users} cor="amber" qtd={grupos.aceitas.length}>
            {grupos.aceitas.length === 0 ? (
              <div className="text-center py-10 text-stone-500 text-sm">
                Nenhum amigo ainda. Busque por <span className="text-amber-300">@apelido</span> acima.
              </div>
            ) : grupos.aceitas.map((p) => (
              <LinhaPerfil key={p.id} perfil={p}
                onClick={() => setAmigoAberto(p)}
                acoes={
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setAmigoAberto(p); }} className="px-3 h-9 rounded-lg bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1 hover:bg-amber-300">
                      <ArrowLeftRight className="w-3.5 h-3.5" /> Match
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm(`Remover ${p.displayName || '@'+p.username} dos amigos?`)) handleRemover(p.id, 'Amizade removida'); }}
                      className="w-9 h-9 rounded-lg bg-stone-800 text-stone-500 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-300"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                }
              />
            ))}
          </Secao>

          {/* Enviadas */}
          {grupos.enviadas.length > 0 && (
            <Secao titulo="Pedidos enviados" icone={Clock} cor="stone" qtd={grupos.enviadas.length}>
              {grupos.enviadas.map((p) => (
                <LinhaPerfil key={p.id} perfil={p}
                  acoes={
                    <button onClick={() => handleRemover(p.id, 'Pedido cancelado')} className="px-3 h-9 rounded-lg bg-stone-800 text-stone-400 text-xs font-bold flex items-center gap-1 hover:bg-rose-500/20 hover:text-rose-300">
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  }
                />
              ))}
            </Secao>
          )}
        </>
      )}
    </div>
  );
}

function Secao({ titulo, icone: Icone, cor = 'amber', qtd, children }) {
  const corMap = {
    amber:   'text-amber-400',
    emerald: 'text-emerald-400',
    stone:   'text-stone-400',
  };
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Icone className={`w-4 h-4 ${corMap[cor]}`} />
        <h3 className={`text-[11px] font-black tracking-[0.2em] ${corMap[cor]}`}>{titulo.toUpperCase()}</h3>
        <span className="text-[10px] text-stone-600">({qtd})</span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function LinhaPerfil({ perfil, acoes, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 bg-stone-900 ring-1 ring-stone-800 rounded-xl ${onClick ? 'cursor-pointer hover:ring-amber-500/40 transition' : ''}`}
    >
      <Avatar url={perfil.avatarUrl} nome={perfil.displayName || perfil.username} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-stone-100 truncate">{perfil.displayName || perfil.username}</div>
        <div className="text-[11px] text-stone-500 truncate">@{perfil.username}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">{acoes}</div>
    </div>
  );
}
