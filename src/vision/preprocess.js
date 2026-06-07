// Stage 1: PreProcessor
// ------------------------------------------------------------------
// Downscales the image to a small fixed-size canvas (160x120) and
// returns a flat Uint8ClampedArray of RGBA pixels + a stable hash.
// Keeping the working size small (≈19k pixels) keeps the rest of
// the pipeline in single-digit ms.

const W = 160;
const H = 120;

async function toImageBitmap(source) {
  if (typeof createImageBitmap === 'function' && source instanceof ImageBitmap) return source;
  if (typeof createImageBitmap === 'function' && (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement)) {
    return createImageBitmap(source);
  }
  return source; // fall through; we only need a canvas below
}

export const PreProcessor = {
  W, H,

  /**
   * @param {HTMLImageElement | ImageBitmap | HTMLCanvasElement} source
   * @returns {{ pixels: Uint8ClampedArray, width: number, height: number, imageHash: string }}
   */
  async process(source) {
    const bitmap = await toImageBitmap(source);

    const canvas = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(W, H)
      : Object.assign(document.createElement('canvas'), { width: W, height: H });

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0, W, H);

    const imgData = ctx.getImageData(0, 0, W, H);
    const pixels = imgData.data;

    // Cheap FNV-1a-ish hash on the pixels. Not cryptographic, just
    // a stable cache key so users can re-detect the same plate.
    const imageHash = PreProcessor.hash(pixels);

    return { pixels, width: W, height: H, imageHash };
  },

  hash(pixels) {
    // Sample every 47th pixel (≈408 samples for 19,200 px) and roll them
    // through a simple 64-bit FNV-1a variant. Output is a 16-char hex.
    let h1 = 0x811c9dc5 >>> 0;
    let h2 = 0xcbf29ce4 >>> 0;
    for (let i = 0; i < pixels.length; i += 47 * 4) {
      h1 = Math.imul(h1 ^ pixels[i], 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ pixels[i + 1], 0x100000001b3) >>> 0;
    }
    return (h2.toString(16).padStart(8, '0') + h1.toString(16).padStart(8, '0')).slice(0, 16);
  },
};
