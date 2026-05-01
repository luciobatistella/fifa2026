import React from 'react';

// Converte qualquer emoji (incluindo bandeiras compostas e 🏴 com tag sequences)
// nos codepoints separados por hífen, no formato exigido pelo Twemoji.
function emojiToCodepoints(emoji) {
  const cps = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    // Twemoji omite o seletor de variação FE0F nos casos comuns,
    // mas mantém em sequências de tag (🏴󠁧󠁢...). Mantemos para compatibilidade.
    if (cp !== 0xfe0f) cps.push(cp.toString(16));
  }
  return cps.join('-');
}

const CDN = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg';

/**
 * Renderiza uma bandeira/emoji como imagem SVG do Twemoji.
 * Funciona em qualquer SO (Windows inclusive, que não desenha bandeiras nativamente).
 *
 * @param {string} emoji  ex.: '🇧🇷'
 * @param {number} size   tamanho em px (altura)
 * @param {string} className  classes extras (border-radius, shadow, etc.)
 */
export default function Bandeira({ emoji, size = 32, className = '', title }) {
  if (!emoji) return null;
  const code = emojiToCodepoints(emoji);
  const src = `${CDN}/${code}.svg`;
  return (
    <img
      src={src}
      alt={title || emoji}
      title={title}
      width={size}
      height={size}
      draggable={false}
      loading="lazy"
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
      onError={(e) => {
        // fallback: mostra o emoji nativo se a CDN falhar
        e.currentTarget.replaceWith(
          Object.assign(document.createElement('span'), {
            textContent: emoji,
            style: `font-size:${size}px;line-height:1;display:inline-block;`,
          })
        );
      }}
    />
  );
}
