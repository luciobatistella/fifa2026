import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Card 3D holográfico — tilt no mouse + glare gradient brilhante seguindo o cursor.
 * Use como wrapper de qualquer KPI / painel premium.
 */
export default function HoloCard({ children, className = '', intensity = 12, glare = true, glow = 'rgba(245,158,11,0.35)' }) {
  const ref = useRef(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [intensity, -intensity]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-intensity, intensity]), { stiffness: 200, damping: 20 });
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);

  const handleMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', perspective: 1000, boxShadow: `0 20px 60px -25px ${glow}` }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`relative overflow-hidden ${className}`}
    >
      <div style={{ transform: 'translateZ(20px)' }} className="relative z-10">
        {children}
      </div>
      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            background: useTransform(
              [gx, gy],
              ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.35), rgba(255,255,255,0) 45%)`
            ),
          }}
        />
      )}
    </motion.div>
  );
}
