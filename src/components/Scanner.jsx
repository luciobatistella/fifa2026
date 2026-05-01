import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Zap, ZapOff, Loader2, Check, Sparkles } from 'lucide-react';
import { recognize, getOCRWorker, disposeOCR } from '../lib/ocr.js';
import { normalizeId } from '../data/album.js';
import { rotuloFigurinha } from '../lib/figurinhas.js';
import { sfx, sfxState } from '../lib/sfx.js';

/* Regex pra capturar tokens tipo "BRA 5", "BRA-5", "FWC12", "ARG  20" */
const CODE_REGEX = /\b([A-Z]{2,5})\s*[-]?\s*(\d{1,2})\b/g;

function extractIds(text) {
  if (!text) return [];
  const upper = text.toUpperCase().replace(/[^A-Z0-9\s-]/g, ' ');
  const ids = new Set();
  let m;
  while ((m = CODE_REGEX.exec(upper)) !== null) {
    const norm = normalizeId(`${m[1]}-${m[2]}`);
    if (!norm) continue;
    const info = rotuloFigurinha(norm);
    if (info.kind && info.kind !== 'unknown') ids.add(norm);
  }
  return [...ids];
}

export default function Scanner({ aberto, onFechar, onDetectar }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const trackRef   = useRef(null);
  const loopRef    = useRef(null);
  const lastIdsRef = useRef(new Map()); // id -> timestamp (anti-duplicação)
  const busyRef    = useRef(false);

  const [status, setStatus]     = useState('idle');     // idle | loading | scanning | error
  const [erro, setErro]         = useState('');
  const [torchOn, setTorchOn]   = useState(false);
  const [torchOk, setTorchOk]   = useState(false);
  const [historico, setHistorico] = useState([]);       // últimas figurinhas adicionadas {id, info, t}

  const COOLDOWN_MS = 1500;  // mesma figurinha só conta de novo após 1.5s
  const FRAME_MS    = 700;   // intervalo entre OCRs

  /* ---------- Câmera ---------- */
  const iniciarCamera = useCallback(async () => {
    setErro('');
    setStatus('loading');
    try {
      // Pré-aquece o worker em paralelo com a câmera
      getOCRWorker().catch(() => {});

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      // Detecta suporte a torch (lanterna)
      const caps = track.getCapabilities?.() || {};
      setTorchOk(!!caps.torch);

      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        await v.play();
      }
      setStatus('scanning');
      iniciarLoop();
    } catch (e) {
      console.error('[scanner] camera erro', e);
      setErro(e?.message || 'Não foi possível acessar a câmera');
      setStatus('error');
    }
  }, []);

  const pararCamera = useCallback(() => {
    if (loopRef.current) { clearTimeout(loopRef.current); loopRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    trackRef.current = null;
    busyRef.current = false;
  }, []);

  /* ---------- Loop OCR ---------- */
  const iniciarLoop = useCallback(() => {
    const tick = async () => {
      if (!streamRef.current) return;
      if (!busyRef.current) {
        busyRef.current = true;
        try { await processarFrame(); } catch (_) {}
        busyRef.current = false;
      }
      loopRef.current = setTimeout(tick, FRAME_MS);
    };
    loopRef.current = setTimeout(tick, 400);
  }, []);

  const processarFrame = useCallback(async () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) return;

    // Crop central (60% largura x 30% altura) — onde fica a mira
    const vw = v.videoWidth, vh = v.videoHeight;
    if (!vw || !vh) return;
    const cw = Math.floor(vw * 0.6);
    const ch = Math.floor(vh * 0.30);
    const sx = Math.floor((vw - cw) / 2);
    const sy = Math.floor((vh - ch) / 2);

    c.width  = cw;
    c.height = ch;
    const ctx = c.getContext('2d', { willReadFrequently: true });

    // Desenha + aumenta contraste em grayscale (ajuda Tesseract muito)
    ctx.drawImage(v, sx, sy, cw, ch, 0, 0, cw, ch);
    const img = ctx.getImageData(0, 0, cw, ch);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
      // Threshold suave + boost de contraste
      const v2 = g < 110 ? Math.max(0, g - 40) : Math.min(255, g + 40);
      d[i] = d[i + 1] = d[i + 2] = v2;
    }
    ctx.putImageData(img, 0, 0);

    const text = await recognize(c);
    const ids = extractIds(text);
    if (ids.length === 0) return;

    const now = Date.now();
    const novos = [];
    for (const id of ids) {
      const last = lastIdsRef.current.get(id) || 0;
      if (now - last < COOLDOWN_MS) continue;
      lastIdsRef.current.set(id, now);
      novos.push(id);
    }
    if (novos.length === 0) return;

    // Detectou! Beep + callback
    sfx.beep();
    if (navigator.vibrate) try { navigator.vibrate(40); } catch (_) {}
    onDetectar?.(novos);

    setHistorico((h) => {
      const add = novos.map((id) => ({ id, info: rotuloFigurinha(id), t: now }));
      return [...add, ...h].slice(0, 8);
    });
  }, [onDetectar]);

  /* ---------- Torch ---------- */
  const toggleTorch = useCallback(async () => {
    const t = trackRef.current;
    if (!t || !torchOk) return;
    try {
      const next = !torchOn;
      await t.applyConstraints({ advanced: [{ torch: next }] });
      setTorchOn(next);
      sfx.tick();
    } catch (e) {
      console.warn('[scanner] torch error', e);
    }
  }, [torchOn, torchOk]);

  /* ---------- Lifecycle ---------- */
  useEffect(() => {
    if (!aberto) return;
    sfxState.unlock();
    setHistorico([]);
    lastIdsRef.current.clear();
    iniciarCamera();
    return () => { pararCamera(); };
  }, [aberto, iniciarCamera, pararCamera]);

  // Termina o worker quando o app fecha — não a cada abertura (cara de inicializar).
  useEffect(() => () => { disposeOCR(); }, []);

  const handleFechar = useCallback(() => {
    pararCamera();
    sfx.close();
    onFechar?.();
  }, [pararCamera, onFechar]);

  /* ---------- UI ---------- */
  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black"
        >
          {/* Vídeo */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay escurecedor com mira */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl ring-2 ring-amber-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
              style={{ width: '60vw', maxWidth: 460, aspectRatio: '2 / 1' }}
            >
              {/* cantos */}
              {['tl', 'tr', 'bl', 'br'].map((c) => (
                <div
                  key={c}
                  className={`absolute w-5 h-5 border-amber-400 ${
                    c === 'tl' ? 'top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl' :
                    c === 'tr' ? 'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl' :
                    c === 'bl' ? 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl' :
                                 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl'
                  }`}
                />
              ))}
              {/* linha de scan animada */}
              <motion.div
                className="absolute left-2 right-2 h-[2px] bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.9)]"
                animate={{ top: ['8%', '92%', '8%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 backdrop-blur ring-1 ring-white/10">
              {status === 'loading' && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
              {status === 'scanning' && <Camera className="w-4 h-4 text-amber-400" />}
              {status === 'error' && <X className="w-4 h-4 text-rose-400" />}
              <span className="text-xs font-mono text-stone-200">
                {status === 'loading' && 'Iniciando câmera + OCR...'}
                {status === 'scanning' && 'Aponte para a figurinha'}
                {status === 'error' && 'Erro'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {torchOk && (
                <button
                  onClick={toggleTorch}
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur ring-1 ${
                    torchOn ? 'bg-amber-400 ring-amber-400 text-black' : 'bg-black/60 ring-white/10 text-stone-200'
                  }`}
                >
                  {torchOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={handleFechar}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur ring-1 ring-white/10 flex items-center justify-center text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Erro */}
          {status === 'error' && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-10">
              <div className="bg-rose-950/90 ring-1 ring-rose-500/40 rounded-2xl p-5 text-center">
                <div className="text-rose-300 font-bold mb-1">Câmera indisponível</div>
                <div className="text-xs text-rose-200/80 mb-3">{erro}</div>
                <div className="text-[11px] text-rose-200/60">
                  Verifique permissão de câmera no navegador. Em iOS use Safari.
                </div>
              </div>
            </div>
          )}

          {/* Histórico (últimas adicionadas) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-bold">
                  {historico.length > 0 ? `${historico.length} no scan` : 'Aguardando...'}
                </div>
                {historico.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <Sparkles className="w-3 h-3" /> beep ativo
                  </div>
                )}
              </div>
              <div className="space-y-1.5 max-h-[34vh] overflow-y-auto">
                <AnimatePresence initial={false}>
                  {historico.map((h) => (
                    <motion.div
                      key={`${h.id}-${h.t}`}
                      initial={{ opacity: 0, x: -20, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-emerald-950/80 ring-1 ring-emerald-500/40 backdrop-blur"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 ring-1 ring-emerald-400/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-stone-100 truncate">
                          {h.info?.emoji} {h.info?.titulo}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-300">{h.info?.code || h.id}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {historico.length === 0 && status === 'scanning' && (
                <div className="text-center text-[11px] text-stone-400 px-4">
                  Centralize o código (ex.: <span className="font-mono text-amber-400">BRA-5</span>) na mira.
                  Ele será adicionado automaticamente.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
