import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Número que faz "tween" suave (estilo odômetro).
 * Usa motion value + spring; renderiza com Intl.NumberFormat.
 */
export default function AnimatedNumber({ value, format = (n) => n.toLocaleString('pt-BR'), className }) {
  const mv = useMotionValue(value);
  const spr = useSpring(mv, { stiffness: 120, damping: 18, mass: 0.6 });
  const display = useTransform(spr, (n) => format(Math.round(n)));
  const [text, setText] = useState(format(value));

  useEffect(() => { mv.set(value); }, [value, mv]);
  useEffect(() => display.on('change', setText), [display]);

  return <motion.span className={className}>{text}</motion.span>;
}
