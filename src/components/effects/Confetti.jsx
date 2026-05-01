import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

/**
 * Confetti canvas full-screen, controlado por ref.
 * Uso:
 *   const confetti = useRef(null);
 *   <Confetti ref={confetti} />
 *   confetti.current.fire();        // burst central
 *   confetti.current.fire({ x: 0.5, y: 0.4, count: 220, colors: [...] });
 *
 * Cores padrão: ouro, esmeralda, branco — paleta Copa.
 */
const PALETA_PADRAO = ['#fbbf24', '#f59e0b', '#10b981', '#34d399', '#ffffff', '#facc15'];

const Confetti = forwardRef(function Confetti({ palette = PALETA_PADRAO }, ref) {
  const canvasRef = useRef(null);
  const partsRef  = useRef([]);
  const rafRef    = useRef(0);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      cv.style.width = '100vw';
      cv.style.height = '100vh';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const parts = partsRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += 0.18;          // gravidade
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        if (p.life <= 0 || p.y > window.innerHeight + 40) { parts.splice(i, 1); continue; }
        const a = Math.max(0, Math.min(1, p.life / p.maxLife));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
        else if (p.shape === 'circ') { ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); }
        else { // estrela 5 pontas
          ctx.beginPath();
          for (let k = 0; k < 10; k++) {
            const r = k % 2 === 0 ? p.size : p.size * 0.45;
            const a2 = (k * Math.PI) / 5;
            ctx[k === 0 ? 'moveTo' : 'lineTo'](Math.cos(a2) * r, Math.sin(a2) * r);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      if (parts.length > 0) rafRef.current = requestAnimationFrame(tick);
      else rafRef.current = 0;
    };

    const ensureLoop = () => { if (!rafRef.current) rafRef.current = requestAnimationFrame(tick); };

    Confetti._ensure = ensureLoop;

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    fire({ x = 0.5, y = 0.45, count = 180, spread = 75, colors = palette } = {}) {
      const cx = window.innerWidth * x;
      const cy = window.innerHeight * y;
      const shapes = ['rect', 'circ', 'star'];
      for (let i = 0; i < count; i++) {
        const ang = (-90 + (Math.random() - 0.5) * spread) * (Math.PI / 180);
        const speed = 8 + Math.random() * 14;
        partsRef.current.push({
          x: cx, y: cy,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed - Math.random() * 4,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.4,
          size: 4 + Math.random() * 5,
          color: colors[(Math.random() * colors.length) | 0],
          shape: shapes[(Math.random() * shapes.length) | 0],
          life: 90 + Math.random() * 60,
          maxLife: 150,
        });
      }
      Confetti._ensure && Confetti._ensure();
    },
  }), [palette]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
      aria-hidden="true"
    />
  );
});

export default Confetti;
