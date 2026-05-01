import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { sfxState, sfx } from '../../lib/sfx.js';

export default function SFXToggle() {
  const [muted, setMuted] = useState(sfxState.isMuted());
  useEffect(() => { sfxState.unlock(); }, []);
  const toggle = () => { const m = sfxState.toggle(); setMuted(m); if (!m) sfx.tick(); };
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggle}
      title={muted ? 'Ativar sons' : 'Silenciar'}
      className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition ${
        muted ? 'bg-stone-900 ring-stone-800 text-stone-500'
              : 'bg-amber-400/10 ring-amber-400/40 text-amber-400'
      }`}
    >
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </motion.button>
  );
}
