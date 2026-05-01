// =============================================================================
//  Catálogo das 30 figurinhas FWC (FIFA / Especiais) do álbum Panini 2026.
//  Numeração 0-indexed internamente; FWC-1 .. FWC-30 no schema.
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
    range: [9, 24],  // FWC-10 .. FWC-25 (16 estádios sede)
    icones: Array(16).fill('🏟️'),
    nomes: [
      'MetLife (NJ)', 'SoFi (LA)', 'AT&T (Dallas)', 'NRG (Houston)',
      'Mercedes-Benz (Atlanta)', 'Hard Rock (Miami)', 'Arrowhead (Kansas)',
      'Lincoln Financial (Filadélfia)', 'Lumen (Seattle)', 'Levi\'s (S. Francisco)',
      'Gillette (Boston)', 'BMO (Toronto)', 'BC Place (Vancouver)',
      'Azteca (CDMX)', 'Akron (Guadalajara)', 'BBVA (Monterrey)',
    ],
  },
  {
    id: 'bola',
    nome: 'Bola & Equipamento',
    emoji: '⚽',
    cor: 'from-violet-500/20 to-fuchsia-600/10 ring-violet-400/40',
    range: [25, 27], // FWC-26 .. FWC-28
    icones: ['⚽', '🥅', '👟'],
    nomes: ['Bola Oficial', 'Troféu Adams', 'Chuteira de Ouro'],
  },
  {
    id: 'colecionavel',
    nome: 'Edição Limitada',
    emoji: '💎',
    cor: 'from-cyan-500/20 to-blue-600/10 ring-cyan-400/40',
    range: [28, 29], // FWC-29 .. FWC-30
    icones: ['💎', '✨'],
    nomes: ['Foil Especial', 'Refractor Premium'],
  },
];

// Helper: dado o índice 0-indexed (0..29), retorna { categoria, emoji, nome, numeroLocal }
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
