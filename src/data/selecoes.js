// Sorteio dos grupos da FIFA World Cup 2026 (12 grupos × 4 = 48 seleções).
// Dados públicos da fase de grupos.

export const SELECOES = [
  // Grupo A
  { codigo: 'KOR', nome: 'Coreia do Sul',     bandeira: '🇰🇷', grupo: 'A' },
  { codigo: 'MEX', nome: 'México',            bandeira: '🇲🇽', grupo: 'A', host: true },
  { codigo: 'CZE', nome: 'Rep. Tcheca',       bandeira: '🇨🇿', grupo: 'A' },
  { codigo: 'RSA', nome: 'África do Sul',     bandeira: '🇿🇦', grupo: 'A' },
  // Grupo B
  { codigo: 'BIH', nome: 'Bósnia',            bandeira: '🇧🇦', grupo: 'B' },
  { codigo: 'CAN', nome: 'Canadá',            bandeira: '🇨🇦', grupo: 'B', host: true },
  { codigo: 'QAT', nome: 'Catar',             bandeira: '🇶🇦', grupo: 'B' },
  { codigo: 'SUI', nome: 'Suíça',             bandeira: '🇨🇭', grupo: 'B' },
  // Grupo C
  { codigo: 'BRA', nome: 'Brasil',            bandeira: '🇧🇷', grupo: 'C' },
  { codigo: 'SCO', nome: 'Escócia',           bandeira: '🏴',   grupo: 'C' },
  { codigo: 'HAI', nome: 'Haiti',             bandeira: '🇭🇹', grupo: 'C' },
  { codigo: 'MAR', nome: 'Marrocos',          bandeira: '🇲🇦', grupo: 'C' },
  // Grupo D
  { codigo: 'AUS', nome: 'Austrália',         bandeira: '🇦🇺', grupo: 'D' },
  { codigo: 'USA', nome: 'Estados Unidos',    bandeira: '🇺🇸', grupo: 'D', host: true },
  { codigo: 'PAR', nome: 'Paraguai',          bandeira: '🇵🇾', grupo: 'D' },
  { codigo: 'TUR', nome: 'Turquia',           bandeira: '🇹🇷', grupo: 'D' },
  // Grupo E
  { codigo: 'GER', nome: 'Alemanha',          bandeira: '🇩🇪', grupo: 'E' },
  { codigo: 'CIV', nome: 'Costa do Marfim',   bandeira: '🇨🇮', grupo: 'E' },
  { codigo: 'CUW', nome: 'Curaçao',           bandeira: '🇨🇼', grupo: 'E' },
  { codigo: 'ECU', nome: 'Equador',           bandeira: '🇪🇨', grupo: 'E' },
  // Grupo F
  { codigo: 'NED', nome: 'Holanda',           bandeira: '🇳🇱', grupo: 'F' },
  { codigo: 'JPN', nome: 'Japão',             bandeira: '🇯🇵', grupo: 'F' },
  { codigo: 'SWE', nome: 'Suécia',            bandeira: '🇸🇪', grupo: 'F' },
  { codigo: 'TUN', nome: 'Tunísia',           bandeira: '🇹🇳', grupo: 'F' },
  // Grupo G
  { codigo: 'BEL', nome: 'Bélgica',           bandeira: '🇧🇪', grupo: 'G' },
  { codigo: 'EGY', nome: 'Egito',             bandeira: '🇪🇬', grupo: 'G' },
  { codigo: 'IRN', nome: 'Irã',               bandeira: '🇮🇷', grupo: 'G' },
  { codigo: 'NZL', nome: 'Nova Zelândia',     bandeira: '🇳🇿', grupo: 'G' },
  // Grupo H
  { codigo: 'KSA', nome: 'Arábia Saudita',    bandeira: '🇸🇦', grupo: 'H' },
  { codigo: 'CPV', nome: 'Cabo Verde',        bandeira: '🇨🇻', grupo: 'H' },
  { codigo: 'ESP', nome: 'Espanha',           bandeira: '🇪🇸', grupo: 'H' },
  { codigo: 'URU', nome: 'Uruguai',           bandeira: '🇺🇾', grupo: 'H' },
  // Grupo I
  { codigo: 'FRA', nome: 'França',            bandeira: '🇫🇷', grupo: 'I' },
  { codigo: 'IRQ', nome: 'Iraque',            bandeira: '🇮🇶', grupo: 'I' },
  { codigo: 'NOR', nome: 'Noruega',           bandeira: '🇳🇴', grupo: 'I' },
  { codigo: 'SEN', nome: 'Senegal',           bandeira: '🇸🇳', grupo: 'I' },
  // Grupo J
  { codigo: 'ARG', nome: 'Argentina',         bandeira: '🇦🇷', grupo: 'J' },
  { codigo: 'ALG', nome: 'Argélia',           bandeira: '🇩🇿', grupo: 'J' },
  { codigo: 'JOR', nome: 'Jordânia',          bandeira: '🇯🇴', grupo: 'J' },
  { codigo: 'AUT', nome: 'Áustria',           bandeira: '🇦🇹', grupo: 'J' },
  // Grupo K
  { codigo: 'COL', nome: 'Colômbia',          bandeira: '🇨🇴', grupo: 'K' },
  { codigo: 'POR', nome: 'Portugal',          bandeira: '🇵🇹', grupo: 'K' },
  { codigo: 'COD', nome: 'RD Congo',          bandeira: '🇨🇩', grupo: 'K' },
  { codigo: 'UZB', nome: 'Uzbequistão',       bandeira: '🇺🇿', grupo: 'K' },
  // Grupo L
  { codigo: 'CRO', nome: 'Croácia',           bandeira: '🇭🇷', grupo: 'L' },
  { codigo: 'GHA', nome: 'Gana',              bandeira: '🇬🇭', grupo: 'L' },
  { codigo: 'ENG', nome: 'Inglaterra',        bandeira: '🏴',   grupo: 'L' },
  { codigo: 'PAN', nome: 'Panamá',            bandeira: '🇵🇦', grupo: 'L' },
];

export const FIGURINHAS_POR_SELECAO = 20;          // padrão oficial Panini 2026 (1 escudo + 1 foto da equipe + 18 jogadores)
export const TOTAL_ESPECIAIS        = 30;          // FWC-1 .. FWC-30
export const TOTAL_FIGURINHAS       = TOTAL_ESPECIAIS + SELECOES.length * FIGURINHAS_POR_SELECAO; // 990
export const FIGURINHAS_POR_PACOTE  = 7;
export const STORAGE_KEY            = 'album-copa-2026.v2';

// ---------------------------------------------------------------------------
// Posições reservadas dentro de cada seleção (1-indexed):
//   slot 1   → ESCUDO da seleção
//   slot 13  → FOTO da equipe
//   demais   → 18 jogadores (slots 2..12 e 14..20)
// ---------------------------------------------------------------------------
export const BADGE_POS      = 1;
export const TEAM_PHOTO_POS = 13;

/** True se a posição corresponde ao escudo. */
export const isBadgePos = (p) => p === BADGE_POS;

/** True se a posição corresponde à foto da equipe. */
export const isTeamPhotoPos = (p) => p === TEAM_PHOTO_POS;

/**
 * Converte uma posição do álbum (1..20) no índice 0-based do array de jogadores.
 * Retorna null para escudo/foto ou posição fora de faixa.
 */
export function indiceJogador(posicao) {
  if (posicao === BADGE_POS || posicao === TEAM_PHOTO_POS) return null;
  if (posicao < 1 || posicao > FIGURINHAS_POR_SELECAO)     return null;
  return posicao < TEAM_PHOTO_POS ? posicao - 2 : posicao - 3;
}
