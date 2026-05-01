// =============================================================================
//  Helpers de figurinhas — adotam o esquema canônico do álbum:
//    id     = "PREFIX-NUMBER"   (1-indexed)
//    code   = "PREFIX NUMBER"
//    group  = "fifa" | "teams" | "unknown"
// =============================================================================

import {
  SELECOES, FIGURINHAS_POR_SELECAO, TOTAL_ESPECIAIS, TOTAL_FIGURINHAS,
  BADGE_POS, TEAM_PHOTO_POS, indiceJogador,
} from '../data/selecoes.js';
import { nomeJogador } from '../data/jogadores.js';
import { infoEspecial } from '../data/especiais.js';
import { parseId, toCode, getCollectionState, buildSticker } from '../data/album.js';

export const fmtNum = (n) => new Intl.NumberFormat('pt-BR').format(n);
export const clamp  = (v, a, b) => Math.max(a, Math.min(b, v));

// Re-exporta utilitários do schema para manter um único ponto de import.
export { parseId, toCode, getCollectionState, buildSticker };

/**
 * Decifra um id de figurinha em metadados de exibição (UI).
 * Retorna { titulo, sub, emoji, kind, code, selecao? }
 *   kind: 'special' | 'badge' | 'player' | 'extra' | 'unknown'
 */
export function rotuloFigurinha(id) {
  const p = parseId(id);
  if (!p) return { titulo: id, sub: '', emoji: '❓', kind: 'unknown', code: id };

  // ---- FWC / Especiais ----
  if (p.group === 'fifa') {
    const ie = infoEspecial(p.number - 1);          // catálogo 0-indexed
    return {
      titulo: ie.nome,
      sub: `${ie.categoria?.nome || 'FIFA'} · ${toCode(id)}`,
      emoji: ie.emoji,
      kind: 'special',
      code: toCode(id),
    };
  }

  // ---- Seleções ----
  const sel = SELECOES.find((s) => s.codigo === p.prefix);
  if (!sel) return { titulo: id, sub: '', emoji: '❓', kind: 'unknown', code: toCode(id) };

  // Convenção do álbum: 1=escudo, 13=foto da equipe, demais=jogadores
  if (p.number === BADGE_POS) {
    return {
      titulo: sel.nome,
      sub: `Escudo · ${toCode(id)}`,
      emoji: sel.bandeira,
      kind: 'badge',
      code: toCode(id),
      selecao: sel,
    };
  }
  if (p.number === TEAM_PHOTO_POS) {
    return {
      titulo: 'Foto da Equipe',
      sub: `${sel.nome} · ${toCode(id)}`,
      emoji: '📸',
      kind: 'extra',
      code: toCode(id),
      selecao: sel,
    };
  }
  const idxJog = indiceJogador(p.number);
  const nome = nomeJogador(sel.codigo, p.number) || `Jogador #${(idxJog ?? 0) + 1}`;
  return {
    titulo: nome,
    sub: `${sel.nome} · ${toCode(id)}`,
    emoji: sel.bandeira,
    kind: 'player',
    code: toCode(id),
    selecao: sel,
  };
}

/** ⚠️ DEPRECATED — numeração global não existe no schema oficial.
 *  Mantido apenas como utilitário para enumerar todas as figurinhas (índice 1..990). */
export function _indexParaId(idx) {
  if (idx < 1 || idx > TOTAL_FIGURINHAS) return null;
  if (idx <= TOTAL_ESPECIAIS) return `FWC-${idx}`;
  const offset = idx - TOTAL_ESPECIAIS - 1;
  const idxSel = Math.floor(offset / FIGURINHAS_POR_SELECAO);
  const idxFig = offset % FIGURINHAS_POR_SELECAO;
  const sel = SELECOES[idxSel];
  return sel ? `${sel.codigo}-${idxFig + 1}` : null;
}

/** Progresso (tem/total/rep/perc) de uma seleção. */
export function progressoSelecao(colecao, codigo) {
  let tem = 0, rep = 0;
  for (let i = 1; i <= FIGURINHAS_POR_SELECAO; i++) {
    const q = colecao[`${codigo}-${i}`] || 0;
    if (q > 0) tem++;
    if (q > 1) rep += q - 1;
  }
  return { tem, total: FIGURINHAS_POR_SELECAO, rep, perc: (tem / FIGURINHAS_POR_SELECAO) * 100 };
}

/** Progresso global das figurinhas FWC (especiais). */
export function progressoEspeciais(colecao) {
  let tem = 0, rep = 0;
  for (let i = 1; i <= TOTAL_ESPECIAIS; i++) {
    const q = colecao[`FWC-${i}`] || 0;
    if (q > 0) tem++;
    if (q > 1) rep += q - 1;
  }
  return { tem, total: TOTAL_ESPECIAIS, rep, perc: (tem / TOTAL_ESPECIAIS) * 100 };
}
