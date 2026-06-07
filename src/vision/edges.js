// Stage 3: EdgeDetector (Sobel-lite)
// ------------------------------------------------------------------
// Single-pass 3x3 Sobel on the green channel (the most luminance-
// carrying channel in a Bayer pattern). Outputs:
//   - density    : fraction of pixels above the edge threshold
//   - direction  : 4-bin histogram of dominant edge orientation
//                  (0°, 45°, 90°, 135°)
//   - mean       : mean gradient magnitude
//   - p90        : 90th-percentile gradient
//
// Why this matters for food: cooked grains, sauces, purées have very
// few strong edges. Salads with leafy greens, chopped vegetables, or
// a fried egg with crispy edges have many. Bread crusts have very
// directional (mostly horizontal) edges.

const THRESHOLD = 28; // 0..255

export const EdgeDetector = {
  compute(pixels, width, height) {
    const N = width * height;
    const grad = new Uint8ClampedArray(N);
    let density = 0;
    let sum = 0;
    const dirHist = new Uint32Array(4);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        const tl = pixels[i - width * 4 - 4] + pixels[i - width * 4 - 3] + pixels[i - width * 4 - 2];
        const t  = pixels[i - width * 4]     + pixels[i - width * 4 + 1] + pixels[i - width * 4 + 2];
        const tr = pixels[i - width * 4 + 4] + pixels[i - width * 4 + 5] + pixels[i - width * 4 + 6];
        const l  = pixels[i - 4]              + pixels[i - 3]              + pixels[i - 2];
        const r  = pixels[i + 4]              + pixels[i + 5]              + pixels[i + 6];
        const bl = pixels[i + width * 4 - 4] + pixels[i + width * 4 - 3] + pixels[i + width * 4 - 2];
        const b  = pixels[i + width * 4]     + pixels[i + width * 4 + 1] + pixels[i + width * 4 + 2];
        const br = pixels[i + width * 4 + 4] + pixels[i + width * 4 + 5] + pixels[i + width * 4 + 6];

        // Sobel X / Y on the green channel only.
        const gx = (tr + 2 * r + br) - (tl + 2 * l + bl);
        const gy = (bl + 2 * b + br) - (tl + 2 * t + tr);
        const mag = Math.min(255, Math.abs(gx) + Math.abs(gy));
        grad[y * width + x] = mag;
        sum += mag;
        if (mag > THRESHOLD) {
          density++;
          const angle = (Math.atan2(gy, gx) * 180) / Math.PI;
          const a = ((angle + 180) % 180) / 45; // 0..3.99
          dirHist[Math.min(3, Math.floor(a))]++;
        }
      }
    }

    // p90 approximation: 1 pass over the gradient array.
    const sorted = Array.from(grad).sort((a, b) => a - b);
    const p90 = sorted[Math.floor(N * 0.9)] || 0;

    const edgesTotal = dirHist.reduce((a, b) => a + b, 0) || 1;
    return {
      density: density / N,
      mean: sum / N,
      p90,
      direction: Array.from(dirHist, (v) => v / edgesTotal),
    };
  },
};
