import { createWorker, PSM } from 'tesseract.js';
import { SELECOES } from '../data/selecoes.js';

/**
 * Worker singleton de OCR — focado em ler a "pílula" de código no verso da
 * figurinha (ex.: "IRQ 9", "FWC 19").
 *
 * Estratégia:
 *  - Modelo `eng` (rápido, basta para A-Z 0-9).
 *  - Whitelist restrita.
 *  - PSM SINGLE_LINE: assumimos que o crop contém apenas o código.
 */
let workerPromise = null;
let initialized = false;

const ALLOWED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';

/** Conjunto de prefixos válidos do álbum (FWC + códigos das seleções). */
export const VALID_PREFIXES = new Set(['FWC', ...SELECOES.map((s) => s.codigo)]);

export function getOCRWorker() {
  if (workerPromise) return workerPromise;
  workerPromise = (async () => {
    const w = await createWorker('eng', 1);
    await w.setParameters({
      tessedit_char_whitelist: ALLOWED_CHARS,
      // PSM.SPARSE_TEXT tolera texto parcial, rotacionado leve e multi-linha,
      // muito melhor que SINGLE_LINE para figurinhas embaçadas/inclinadas.
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: '1',
    });
    initialized = true;
    return w;
  })();
  return workerPromise;
}

export async function recognize(canvasOrBlob, psm) {
  const w = await getOCRWorker();
  if (psm != null) {
    await w.setParameters({ tessedit_pageseg_mode: psm });
  }
  const { data } = await w.recognize(canvasOrBlob);
  return data?.text || '';
}

export { PSM };

export function isOCRReady() { return initialized; }

export async function disposeOCR() {
  if (!workerPromise) return;
  try { const w = await workerPromise; await w.terminate(); } catch (_) {}
  workerPromise = null;
  initialized = false;
}
