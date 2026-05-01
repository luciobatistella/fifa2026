// =============================================================================
//  Catálogo das figurinhas FWC (FIFA / Especiais) e Coca-Cola do álbum Panini 2026.
//  FWC: 19 figurinhas (FWC-1 .. FWC-19), indexadas 0-based internamente.
//  CC : 14 figurinhas (CC-1  .. CC-14 ), indexadas 0-based internamente.
// =============================================================================

// Ícones e nomes individuais por número FWC (FWC-00 .. FWC-19).
// FWC-00 = capa; FWC-01, FWC-02 = logo oficial; FWC-03 = mascote; FWC-04 = a confirmar;
// FWC-05 = bola oficial; FWC-06 .. FWC-19 = estádios sede.
const FWC_ICONES = [
  '📕',
  '🏆', '🏆', '🦅', '✨', '⚽',
  '🏟️', '🏟️', '🏟️', '🏟️', '🏟️',
  '🏟️', '🏟️', '🏟️', '🏟️', '🏟️',
  '🏟️', '🏟️', '🏟️', '🏟️',
];

const FWC_NOMES = [
  'Capa do Álbum',
  'Logo Oficial', 'Logo Oficial', 'Mascote Oficial', 'Especial', 'Bola Oficial',
  'Estádio', 'Estádio', 'Estádio', 'Estádio', 'Estádio',
  'Estádio', 'Estádio', 'Estádio', 'Estádio', 'Estádio',
  'Estádio', 'Estádio', 'Estádio', 'Estádio',
];

export const CATEGORIAS_ESPECIAIS = [
  {
    id: 'especiais',
    nome: 'Figurinhas Especiais',
    emoji: '✨',
    cor: 'from-amber-500/20 to-yellow-600/10 ring-amber-400/40',
    range: [0, 19],  // FWC-00 .. FWC-19
    icones: FWC_ICONES,
    nomes: FWC_NOMES,
  },
];

// =============================================================================
//  Catálogo das 14 figurinhas Coca-Cola (CC-1 .. CC-14).
// =============================================================================

// Jogadores oficiais da página Coca-Cola (CC-1 .. CC-14).
const CC_JOGADORES = [
  { sigla: 'ESP', nome: 'Lamine Yamal' },
  { sigla: 'ALE', nome: 'Joshua Kimmich' },
  { sigla: 'ING', nome: 'Harry Kane' },
  { sigla: 'MEX', nome: 'Santiago Giménez' },
  { sigla: 'CRO', nome: 'Joško Gvardiol' },
  { sigla: 'URU', nome: 'Federico Valverde' },
  { sigla: 'COL', nome: 'Jefferson Lerma' },
  { sigla: 'EQU', nome: 'Enner Valencia' },
  { sigla: 'BRA', nome: 'Gabriel Magalhães' },
  { sigla: 'HOL', nome: 'Virgil van Dijk' },
  { sigla: 'CAN', nome: 'Alphonso Davies' },
  { sigla: 'ARG', nome: 'Emiliano Martínez' },
  { sigla: 'MEX', nome: 'Raúl Jiménez' },
  { sigla: 'ARG', nome: 'Lautaro Martínez' },
];

export const CATEGORIAS_CC = [
  {
    id: 'cocacola',
    nome: 'Coca-Cola',
    emoji: '🥤',
    cor: 'from-red-600/20 to-rose-800/10 ring-red-500/40',
    range: [0, 13],  // CC-1 .. CC-14
    icones: Array(14).fill('🥤'),
    nomes: CC_JOGADORES.map((j) => j.nome),
    siglas: CC_JOGADORES.map((j) => j.sigla),
  },
];

// Helper: dado o índice 0-indexed (0..18), retorna { categoria, emoji, nome, numeroLocal }
export function infoEspecial(idx) {
  for (const cat of CATEGORIAS_ESPECIAIS) {
    const [a, b] = cat.range;
    if (idx >= a && idx <= b) {
      const local = idx - a;
      return {
        categoria: cat,
        emoji: cat.icones?.[local] || cat.emoji,
        nome: cat.nomes?.[local] || `${cat.nome} #${local + 1}`,
        numeroLocal: local + 1,
      };
    }
  }
  return { categoria: null, emoji: '⭐', nome: `FWC #${idx + 1}`, numeroLocal: idx + 1 };
}

// =============================================================================
//  Catálogo das 4 figurinhas EXTRAS (raras): REGU, BRONZE, PRATA, OURO.
//  Cada uma tem prefixo próprio e número 1 (REGU-1, BRO-1, PRA-1, OURO-1).
// =============================================================================
export const CATEGORIAS_EXTRAS = [
  {
    id: 'regular',
    prefix: 'REGU',
    nome: 'Regular',
    emoji: '⚪',
    cor: 'from-stone-500/20 to-stone-700/10 ring-stone-400/40',
    badgeCor: 'text-stone-300',
  },
  {
    id: 'bronze',
    prefix: 'BRO',
    nome: 'Bronze',
    emoji: '🥉',
    cor: 'from-amber-700/30 to-orange-900/10 ring-amber-700/40',
    badgeCor: 'text-amber-500',
  },
  {
    id: 'prata',
    prefix: 'PRA',
    nome: 'Prata',
    emoji: '🥈',
    cor: 'from-slate-300/20 to-slate-500/10 ring-slate-300/40',
    badgeCor: 'text-slate-200',
  },
  {
    id: 'ouro',
    prefix: 'OURO',
    nome: 'Ouro',
    emoji: '🥇',
    cor: 'from-yellow-400/30 to-amber-600/10 ring-yellow-400/50',
    badgeCor: 'text-yellow-300',
  },
];

/** Dado um prefix de extra (REGU/BRO/PRA/OURO), retorna { categoria, emoji, nome }. */
export function infoExtra(prefix) {
  const cat = CATEGORIAS_EXTRAS.find((c) => c.prefix === prefix);
  if (!cat) return { categoria: null, emoji: '✨', nome: prefix };
  return { categoria: cat, emoji: cat.emoji, nome: cat.nome };
}

// Helper: dado o índice 0-indexed (0..13), retorna { categoria, emoji, nome, numeroLocal }
export function infoCocaCola(idx) {
  for (const cat of CATEGORIAS_CC) {
    const [a, b] = cat.range;
    if (idx >= a && idx <= b) {
      const local = idx - a;
      return {
        categoria: cat,
        emoji: cat.icones?.[local] || cat.emoji,
        nome: cat.nomes?.[local] || `Coca-Cola #${local + 1}`,
        sigla: cat.siglas?.[local] || '',
        numeroLocal: local + 1,
      };
    }
  }
  return { categoria: null, emoji: '🥤', nome: `CC #${idx + 1}`, sigla: '', numeroLocal: idx + 1 };
}
