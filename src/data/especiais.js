// =============================================================================
//  Catálogo das figurinhas FWC (FIFA / Especiais) e Coca-Cola do álbum Panini 2026.
//  FWC: 19 figurinhas (FWC-1 .. FWC-19), indexadas 0-based internamente.
//  CC : 14 figurinhas (CC-1  .. CC-14 ), indexadas 0-based internamente.
// =============================================================================

export const CATEGORIAS_ESPECIAIS = [
  {
    id: 'logos',
    nome: 'Logos & Identidade',
    emoji: '🏆',
    cor: 'from-amber-500/20 to-yellow-600/10 ring-amber-400/40',
    range: [0, 5],   // FWC-1 .. FWC-6
    icones: ['🏆', '⚽', '🏅', '🎖️', '📛', '🔰'],
    nomes: ['Troféu da Copa', 'Logo Oficial', 'Logo Panini', 'Emblema FIFA', 'Pôster Oficial', 'Bandeira FIFA'],
  },
  {
    id: 'mascotes',
    nome: 'Mascotes Oficiais',
    emoji: '🦅',
    cor: 'from-rose-500/20 to-orange-500/10 ring-rose-400/40',
    range: [6, 8],   // FWC-7 .. FWC-9
    icones: ['🦅', '🦌', '🐆'],
    nomes: ['Maple (Canadá)', 'Zayu (México)', 'Clutch (EUA)'],
  },
  {
    id: 'estadios',
    nome: 'Estádios da Copa',
    emoji: '🏟️',
    cor: 'from-emerald-500/20 to-teal-600/10 ring-emerald-400/40',
    range: [9, 18],  // FWC-10 .. FWC-19 (10 estádios sede)
    icones: Array(10).fill('🏟️'),
    nomes: [
      'MetLife (NJ)', 'SoFi (LA)', 'AT&T (Dallas)', 'NRG (Houston)',
      'Mercedes-Benz (Atlanta)', 'Hard Rock (Miami)', 'Arrowhead (Kansas)',
      'Lincoln Financial (Filadélfia)', 'Lumen (Seattle)', 'Levi\'s (S. Francisco)',
    ],
  },
];

// =============================================================================
//  Catálogo das 14 figurinhas Coca-Cola (CC-1 .. CC-14).
// =============================================================================

export const CATEGORIAS_CC = [
  {
    id: 'cocacola',
    nome: 'Coca-Cola',
    emoji: '🥤',
    cor: 'from-red-600/20 to-rose-800/10 ring-red-500/40',
    range: [0, 13],  // CC-1 .. CC-14
    icones: Array(14).fill('🥤'),
    nomes: Array.from({ length: 14 }, (_, i) => `Coca-Cola #${i + 1}`),
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
        numeroLocal: local + 1,
      };
    }
  }
  return { categoria: null, emoji: '🥤', nome: `CC #${idx + 1}`, numeroLocal: idx + 1 };
}
