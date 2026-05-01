/**
 * Variants/transitions reutilizáveis para framer-motion.
 */
export const spring = { type: 'spring', stiffness: 380, damping: 26, mass: 0.6 };
export const springSoft = { type: 'spring', stiffness: 220, damping: 24, mass: 0.7 };
export const ease = { duration: 0.35, ease: [0.22, 1, 0.36, 1] };

export const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0,  transition: ease },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: ease },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

export const popIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1, transition: spring },
  exit:    { opacity: 0, scale: 0.92, transition: { duration: 0.18 } },
};

export const slideUpModal = {
  initial: { opacity: 0, y: 60, scale: 0.96 },
  animate: { opacity: 1, y: 0,  scale: 1, transition: spring },
  exit:    { opacity: 0, y: 24, scale: 0.97, transition: { duration: 0.2 } },
};

export const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

export const stagger = (delay = 0.04) => ({
  animate: { transition: { staggerChildren: delay } },
});
