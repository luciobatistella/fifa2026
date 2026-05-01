import React from 'react';
import { motion } from 'framer-motion';

/**
 * Burst de partículas leve em torno de um ponto (relativo ao container pai).
 * Use position:relative no pai. Renderiza N partículas que voam radialmente.
 */
export default function Sparkles({ count = 14, color = '#fbbf24', size = 4, radius = 38, duration = 0.7 }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const dx = Math.cos(a) * radius * (0.6 + Math.random() * 0.8);
        const dy = Math.sin(a) * radius * (0.6 + Math.random() * 0.8);
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0.2 }}
            transition={{ duration, ease: [0.2, 0.8, 0.4, 1] }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: size, height: size, background: color, boxShadow: `0 0 ${size * 2}px ${color}` }}
          />
        );
      })}
    </div>
  );
}
