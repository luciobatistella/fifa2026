import { createWorker, PSM } from 'tesseract.js';

/**
 * Worker singleton de OCR.
 * Carrega o modelo de inglês (rápido, suficiente pra códigos tipo "BRA-5").
 * Restringe vocabulário a A-Z 0-9 e hífen pra acelerar e reduzir falsos positivos.
 */
let workerPromise = null;
let initialized = false;

const ALLOWED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ';

export function getOCRWorker() {
  if (workerPromise) return workerPromise;
  workerPromise = (async () => {
    const w = await createWorker('eng', 1, {
      // logger: (m) => console.log('[ocr]', m),
    });
    await w.setParameters({
      tessedit_char_whitelist: ALLOWED_CHARS,
      // SPARSE_TEXT: encontra texto esparso na imagem (bom pra códigos isolados)
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: '1',
    });
    initialized = true;
    return w;
  })();
  return workerPromise;
}

export async function recognize(canvasOrBlob) {
  const w = await getOCRWorker();
  const { data } = await w.recognize(canvasOrBlob);
  return data?.text || '';
}

export function isOCRReady() { return initialized; }

export async function disposeOCR() {
  if (!workerPromise) return;
  try { const w = await workerPromise; await w.terminate(); } catch (_) {}
  workerPromise = null;
  initialized = false;
}
