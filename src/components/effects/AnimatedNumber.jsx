import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

/**
 * Número que faz "tween" suave (estilo odômetro).
 * Escreve direto no DOM via ref para evitar re-render do React a cada frame
 * (custoso especialmente no Safari quando há várias animações simultâneas).
 */
export default function AnimatedNumber({ value, format = (n) => n.toLocaleString('pt-BR'), className }) {
  const mv  = useMotionValue(value);
  const spr = useSpring(mv, { stiffness: 120, damping: 18, mass: 0.6 });
  const ref = useRef(null);

  useEffect(() => { mv.set(value); }, [value, mv]);

  useEffect(() => {
    if (ref.current) ref.current.textContent = format(value);
    const unsub = spr.on('change', (n) => {
      if (ref.current) ref.current.textContent = format(Math.round(n));
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spr]);

  return <span ref={ref} className={className}>{format(value)}</span>;
}
