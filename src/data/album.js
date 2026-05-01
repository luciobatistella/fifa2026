// =============================================================================
//  Modelo canônico do álbum FIFA World Cup 2026 (Panini).
//  Esquema definido pelo cliente:
//    Sticker = { id, code, prefix, number, group, collection: {owned, duplicates, needed} }
//    Group   = "fifa" | "teams" | "unknown"
//  Convenção de id:    "PREFIX-NUMBER"  (ex.: "IRQ-9", "FWC-19")
//  Convenção de code:  "PREFIX NUMBER"  (ex.: "IRQ 9",  "FWC 19")
// =============================================================================

import { SELECOES } from './selecoes.js';

export const ALBUM_META = {
  name: 'FIFA World Cup 2026',
  publisher: 'Panini',
  year: 2026,
  version: '1.0',
};

// Mapa prefix -> grupo (taxonomia oficial)
export const GROUP_OF_PREFIX = {
  FWC:  'fifa',
  CC:   'cocacola',
  REGU: 'extras',
  BRO:  'extras',
  PRA:  'extras',
  OURO: 'extras',
  ...Object.fromEntries(SELECOES.map((s) => [s.codigo, 'teams'])),
};

// Quantidades-padrão
export const FWC_RANGE       = { start: 0, end: 19 };  // 20 figurinhas FIFA / Especiais (FWC-00 .. FWC-19)
export const CC_RANGE        = { start: 1, end: 14 };  // 14 figurinhas Coca-Cola
export const TEAM_RANGE      = { start: 1, end: 20 };  // 20 figurinhas por seleção
export const STICKERS_PER_TEAM = TEAM_RANGE.end;       // 20
export const FWC_TOTAL         = FWC_RANGE.end - FWC_RANGE.start + 1; // 20
export const CC_TOTAL          = CC_RANGE.end;         // 14
export const EXTRAS_PREFIXES   = ['REGU', 'BRO', 'PRA', 'OURO'];
export const EXTRAS_TOTAL      = EXTRAS_PREFIXES.length; // 4
export const TOTAL_STICKERS    = FWC_TOTAL + CC_TOTAL + EXTRAS_TOTAL + SELECOES.length * STICKERS_PER_TEAM; // 20+14+4+960 = 998

// Definição de grupos (compatível com o JSON enviado pelo cliente)
export const GROUPS = {
  FWC:  { name: 'FIFA / Especiais', range: FWC_RANGE },
  CC:   { name: 'Coca-Cola',        range: CC_RANGE  },
  REGU: { name: 'Extra Regular',    range: { start: 1, end: 1 } },
  BRO:  { name: 'Extra Bronze',     range: { start: 1, end: 1 } },
  PRA:  { name: 'Extra Prata',      range: { start: 1, end: 1 } },
  OURO: { name: 'Extra Ouro',       range: { start: 1, end: 1 } },
  ...Object.fromEntries(SELECOES.map((s) => [s.codigo, { name: s.nome, range: TEAM_RANGE }])),
};

// -----------------------------------------------------------------------------
//  Funções utilitárias do modelo
// -----------------------------------------------------------------------------

/** Normaliza um id para o formato canônico "PREFIX-NUMBER". */
export function normalizeId(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toUpperCase().replace(/\s+/g, '-');
  if (!/^[A-Z]{2,5}-\d{1,3}$/.test(s)) return null;
  return s;
}

/** Decompõe um id em { prefix, number, group }. */
export function parseId(id) {
  const norm = normalizeId(id);
  if (!norm) return null;
  const [prefix, num] = norm.split('-');
  return {
    prefix,
    number: parseInt(num, 10),
    group: GROUP_OF_PREFIX[prefix] || 'unknown',
  };
}

/** Constrói o código humano "FWC 19" a partir do id. */
export function toCode(id) {
  const p = parseId(id);
  return p ? `${p.prefix} ${p.number}` : id;
}

/** Lê o estado de coleção de uma figurinha a partir do storage `colecao`. */
export function getCollectionState(colecao, id) {
  const qtd = (colecao && colecao[id]) || 0;
  return {
    owned:      qtd > 0 ? qtd : 0,   // total em mãos (1 + repetidas)
    duplicates: Math.max(0, qtd - 1),
    needed:     qtd === 0,
  };
}

/** Constrói um Sticker completo no schema oficial. */
export function buildSticker(id, colecao = {}) {
  const p = parseId(id);
  if (!p) return null;
  return {
    id,
    code: `${p.prefix} ${p.number}`,
    prefix: p.prefix,
    number: p.number,
    group: p.group,
    collection: getCollectionState(colecao, id),
  };
}

/** Lista todos os ids do álbum em ordem canônica (FWC, CC, EXTRAS, depois seleções). */
export function listAllIds() {
  const ids = [];
  for (let n = FWC_RANGE.start; n <= FWC_RANGE.end; n++) ids.push(`FWC-${n}`);
  for (let n = CC_RANGE.start;  n <= CC_RANGE.end;  n++) ids.push(`CC-${n}`);
  for (const px of EXTRAS_PREFIXES) ids.push(`${px}-1`);
  for (const s of SELECOES) {
    for (let n = TEAM_RANGE.start; n <= TEAM_RANGE.end; n++) ids.push(`${s.codigo}-${n}`);
  }
  return ids;
}

/** Lista todos os Stickers (com estado) do álbum. */
export function listAllStickers(colecao = {}) {
  return listAllIds().map((id) => buildSticker(id, colecao));
}
