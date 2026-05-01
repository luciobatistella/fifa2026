import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Zap, ZapOff, Loader2, Check, Sparkles, Bug } from 'lucide-react';
import { recognize, getOCRWorker, disposeOCR, VALID_PREFIXES } from '../lib/ocr.js';
import { normalizeId } from '../data/album.js';
import { rotuloFigurinha } from '../lib/figurinhas.js';
import { sfx, sfxState } from '../lib/sfx.js';

/* Padrão estrito da pílula: 3 letras + 1-2 dígitos (com ou sem espaço/hífen). */
const CODE_REGEX = /([A-Z0-9]{3})\s*[- ]?\s*(\d{1,2})/g;

/* Conserta confusões OCR no prefixo (alfanumérico parece número). */
function fixPrefix(s) {
  return s
    .replace(/0/g, 'O')
    .replace(/1/g, 'I')
    .replace(/5/g, 'S')
    .replace(/8/g, 'B')
    .replace(/2/g, 'Z');
}

function extractIds(text, debug) {
  if (!text) return [];
  const upper = text.toUpperCase().replace(/[^A-Z0-9\s-]/g, ' ');
  const ids = new Set();
  const debugMatches = [];
  let m;
  CODE_REGEX.lastIndex = 0;
  while ((m = CODE_REGEX.exec(upper)) !== null) {
    const prefix = fixPrefix(m[1]);
    const num = parseInt(m[2], 10);
    const norm = normalizeId(`${prefix}-${num}`);
    const valid = norm && VALID_PREFIXES.has(prefix) && num >= 1 && num <= 30;
    debugMatches.push(`${m[1]}${m[2]}→${prefix}-${num}${valid ? '✓' : '✗'}`);
    if (!valid) continue;
    const info = rotuloFigurinha(norm);
    if (info.kind && info.kind !== 'unknown') ids.add(norm);
  }
  if (debug) debug.matches = debugMatches;
  return [...ids];
}

export default function Scanner({ aberto, onFechar, onDetectar, hideBottom = false }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const trackRef   = useRef(null);
  const loopRef    = useRef(null);
  const lastIdsRef = useRef(new Map());
  const busyRef    = useRef(false);

  const [status, setStatus]     = useState('idle');
  const [erro, setErro]         = useState('');
  const [torchOn, setTorchOn]   = useState(false);
  const [torchOk, setTorchOk]   = useState(false);
  const [historico, setHistorico] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debug, setDebug] = useState({ frames: 0, lastText: '', matches: [], lastFrameMs: 0 });

  const COOLDOWN_MS = 1500;
  const FRAME_MS    = 280;

  /* Região do crop relativa ao vídeo (em fração 0..1).
     A mira na UI é desenhada exatamente sobre essa área. */
  const CROP = { xc: 0.5, yc: 0.5, w: 0.55, h: 0.13 };

  const iniciarCamera = useCallback(async () => {
    setErro('');
    setStatus('loading');
    try {
      getOCRWorker().catch((e) => {
        console.error('[scanner] worker init', e);
        setErro('Falha ao iniciar OCR: ' + (e?.message || 'desconhecido'));
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      const caps = track.getCapabilities?.() || {};
      setTorchOk(!!caps.torch);

      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        v.setAttribute('playsinline', 'true');
        await v.play();
      }
      setStatus('scanning');
      iniciarLoop();
    } catch (e) {
      console.error('[scanner] camera erro', e);
      const msg = e?.name === 'NotAllowedError'
        ? 'Permissão de câmera negada. Verifique configurações do navegador.'
        : (e?.message || 'Não foi possível acessar a câmera');
      setErro(msg);
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

  const tocarParaFocar = useCallback(async () => {
    const t = trackRef.current;
    if (!t) return;
    try {
      const caps = t.getCapabilities?.() || {};
      if (caps.focusMode?.includes('continuous')) {
        await t.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
      } else if (caps.focusMode?.includes('single-shot')) {
        await t.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] });
      }
      sfx.tick();
    } catch (_) {}
  }, []);

  const iniciarLoop = useCallback(() => {
    const tick = async () => {
      if (!streamRef.current) return;
      if (!busyRef.current) {
        busyRef.current = true;
        try { await processarFrame(); } catch (e) { console.warn('[scanner] frame err', e); }
        busyRef.current = false;
      }
      loopRef.current = setTimeout(tick, FRAME_MS);
    };
    loopRef.current = setTimeout(tick, 600);
  }, []);

  const processarFrame = useCallback(async () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) return;

    const t0 = performance.now();
    const vw = v.videoWidth, vh = v.videoHeight;
    if (!vw || !vh) return;

    // Crop pequeno na "pílula" do código (centro da mira), com upscale forte.
    const cw = Math.max(80, Math.floor(vw * CROP.w));
    const ch = Math.max(40, Math.floor(vh * CROP.h));
    const sx = Math.floor(vw * CROP.xc - cw / 2);
    const sy = Math.floor(vh * CROP.yc - ch / 2);

    // Alvo: ~64px de altura para o texto — boa zona pra Tesseract.
    const targetH = 96;
    const scale   = Math.max(1, targetH / ch);
    const dw = Math.floor(cw * scale);
    const dh = Math.floor(ch * scale);

    c.width  = dw;
    c.height = dh;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(v, sx, sy, cw, ch, 0, 0, dw, dh);

    // Pré-processamento: tons de cinza + Otsu + auto-invert se fundo for escuro.
    const img = ctx.getImageData(0, 0, dw, dh);
    const d = img.data;
    const hist = new Array(256).fill(0);
    let mean = 0;
    for (let i = 0; i < d.length; i += 4) {
      const g = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
      hist[g]++;
      mean += g;
    }
    const total = d.length / 4;
    mean /= total;
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * hist[t];
    let sumB = 0, wB = 0, max = 0, threshold = 127;
    for (let t = 0; t < 256; t++) {
      wB += hist[t];
      if (wB === 0) continue;
      const wF = total - wB;
      if (wF === 0) break;
      sumB += t * hist[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const between = wB * wF * (mB - mF) * (mB - mF);
      if (between > max) { max = between; threshold = t; }
    }
    // A pílula no verso é cinza escuro com texto claro → maioria dos pixels
    // é escura. Invertemos para entregar texto preto sobre fundo branco.
    const invert = mean < 128;
    for (let i = 0; i < d.length; i += 4) {
      const g = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
      let v2 = g < threshold ? 0 : 255;
      if (invert) v2 = 255 - v2;
      d[i] = d[i + 1] = d[i + 2] = v2;
    }
    ctx.putImageData(img, 0, 0);

    let text = '';
    try {
      text = await recognize(c);
    } catch (e) {
      console.warn('[scanner] ocr err', e);
      return;
    }

    const dbgInfo = {};
    const ids = extractIds(text, dbgInfo);
    const elapsed = performance.now() - t0;

    setDebug((d2) => ({
      frames: d2.frames + 1,
      lastText: (text || '').trim().replace(/\n+/g, ' ').slice(0, 80),
      matches: dbgInfo.matches || [],
      lastFrameMs: Math.round(elapsed),
    }));

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

    sfx.beep();
    if (navigator.vibrate) try { navigator.vibrate(40); } catch (_) {}
    onDetectar?.(novos);

    setHistorico((h) => {
      const add = novos.map((id) => ({ id, info: rotuloFigurinha(id), t: now }));
      return [...add, ...h].slice(0, 8);
    });
  }, [onDetectar]);

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

  useEffect(() => {
    if (!aberto) return;
    sfxState.unlock();
    setHistorico([]);
    setDebug({ frames: 0, lastText: '', matches: [], lastFrameMs: 0 });
    lastIdsRef.current.clear();
    iniciarCamera();
    return () => { pararCamera(); };
  }, [aberto, iniciarCamera, pararCamera]);

  useEffect(() => () => { disposeOCR(); }, []);

  const handleFechar = useCallback(() => {
    pararCamera();
    sfx.close();
    onFechar?.();
  }, [pararCamera, onFechar]);

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black"
        >
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            onClick={tocarParaFocar}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Mira: formato de "pílula" alinhada com o código no verso da figurinha */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/55" />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-amber-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
              style={{ width: `${CROP.w * 100}vw`, maxWidth: 360, aspectRatio: `${CROP.w / CROP.h} / 1` }}
            >
              {['tl', 'tr', 'bl', 'br'].map((c) => (
                <div
                  key={c}
                  className={`absolute w-4 h-4 border-amber-400 ${
                    c === 'tl' ? '-top-1 -left-1 border-t-4 border-l-4 rounded-tl-full' :
                    c === 'tr' ? '-top-1 -right-1 border-t-4 border-r-4 rounded-tr-full' :
                    c === 'bl' ? '-bottom-1 -left-1 border-b-4 border-l-4 rounded-bl-full' :
                                 '-bottom-1 -right-1 border-b-4 border-r-4 rounded-br-full'
                  }`}
                />
              ))}
              <motion.div
                className="absolute left-3 right-3 h-[2px] bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.9)]"
                animate={{ top: ['12%', '88%', '12%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold whitespace-nowrap">
                código aqui
              </div>
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
                {status === 'scanning' && (debug.frames === 0 ? 'Aguardando OCR...' : `Frame ${debug.frames}`)}
                {status === 'error' && 'Erro'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowDebug((v) => !v); sfx.tick(); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur ring-1 ${
                  showDebug ? 'bg-sky-400 ring-sky-400 text-black' : 'bg-black/60 ring-white/10 text-stone-200'
                }`}
                title="Debug OCR"
              >
                <Bug className="w-5 h-5" />
              </button>
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

          {/* Debug overlay */}
          {showDebug && (
            <div className="absolute top-20 left-3 right-3 z-10">
              <div className="bg-sky-950/90 ring-1 ring-sky-500/40 rounded-xl p-3 backdrop-blur text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-sky-300 font-bold uppercase tracking-wider text-[9px]">
                  <span>OCR DEBUG</span>
                  <span>{debug.lastFrameMs}ms · {debug.frames} frames</span>
                </div>
                <div className="text-stone-200 break-words">
                  <span className="text-sky-400">lendo:</span>{' '}
                  {debug.lastText || <em className="text-stone-500">(nada)</em>}
                </div>
                {debug.matches.length > 0 ? (
                  <div className="text-emerald-300 break-words">
                    matches: {debug.matches.join(' · ')}
                  </div>
                ) : (
                  <div className="text-stone-500">matches: nenhum</div>
                )}
                <div className="text-[9px] text-sky-200/60 pt-1 border-t border-sky-800/50 mt-1">
                  Toque na tela pra focar · Use a 🔦 com pouca luz
                </div>
              </div>
            </div>
          )}

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

          {!hideBottom && <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
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
                  Vire a figurinha e encaixe a etiqueta <span className="font-mono text-amber-400">XXX&nbsp;9</span> dentro da pílula.
                  Toque na tela pra focar.
                </div>
              )}
            </div>
          </div>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
