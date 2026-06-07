// Stage 4: PlateDetector (Hough-lite ring scoring)
// ------------------------------------------------------------------
// We don't do a full Hough transform (too slow for 19k pixels in JS).
// Instead we do a fast edge -> chamfer-style accumulator on 8 radii
// (0.20..0.48 of the image) and look for consistent gradient votes
// perpendicular to the radial direction.
//
// Outputs:
//   - score       : 0..1, how plate-like the image is
//   - radius      : estimated radius in pixels (0 if no plate found)
//   - cx, cy      : estimated center
//   - bgShare     : share of "background" pixels (outside the plate)
//
// Why this matters for food: most restaurant / home plates present
// food in a roughly circular frame. Detecting that frame is a strong
// signal that the user is documenting a meal, and lets us mask out
// the background so color scoring focuses on the food.

const RADIUS_FACTORS = [0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.48, 0.50];

export const PlateDetector = {
  compute(pixels, width, height, color) {
    const cx = width / 2;
    const cy = height / 2;
    const rMax = Math.min(width, height) / 2;

    // Compute per-pixel radial gradient magnitude using the green channel.
    // This is the radial Sobel: change in luminance as we move from a
    // pixel to its center.
    const radial = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const g = pixels[i + 1];
        const dx = x - cx;
        const dy = y - cy;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        // Sample one step toward and away from center.
        const nx = Math.round(x - dx / d);
        const ny = Math.round(y - dy / d);
        const fx = Math.max(0, Math.min(width - 1, nx));
        const fy = Math.max(0, Math.min(height - 1, ny));
        const gi = ((y * width) + (x)) * 4 + 1;
        const go = ((fy * width) + (fx)) * 4 + 1;
        radial[y * width + x] = Math.abs(g - pixels[go]);
      }
    }

    // For each candidate radius, count the average radial gradient on
    // the ring. Pick the radius with the highest score. We add a small
    // baseline (0.1) so even moderate gradients register.
    let bestScore = 0;
    let bestRadius = 0;
    for (const f of RADIUS_FACTORS) {
      const r = f * rMax;
      let sum = 0;
      let n = 0;
      const steps = 48;
      for (let s = 0; s < steps; s++) {
        const t = (s / steps) * Math.PI * 2;
        const x = Math.round(cx + Math.cos(t) * r);
        const y = Math.round(cy + Math.sin(t) * r);
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        sum += radial[y * width + x];
        n++;
      }
      const avg = n > 0 ? sum / n : 0;
      // Normalize: 0..15 maps to 0..1 (was 30, lowered because radial
      // gradient tends to be more subtle than per-pixel Sobel).
      const score = Math.min(1, avg / 15);
      if (score > bestScore) {
        bestScore = score;
        bestRadius = r;
      }
    }
    // If no ring scored well but the image has a clear background-vs-foreground
    // color split, treat the larger colored region as the plate. Heuristic:
    // if grey share is between 10% and 60%, there's likely a non-grey subject
    // on a contrasting background.
    if (bestScore < 0.15 && color.grey > 0.10 && color.grey < 0.70) {
      bestScore = 0.25;
      bestRadius = Math.min(width, height) * 0.35;
    }

    // Background share: pixels outside the plate that are non-food grey/white.
    // Crude, but it gives a sense of "is this a clean plate photo or
    // a cluttered table snapshot".
    let bg = 0;
    if (bestRadius > 8) {
      const r2 = bestRadius * bestRadius * 1.2; // small margin
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x - cx;
          const dy = y - cy;
          if (dx * dx + dy * dy > r2) {
            const i = (y * width + x) * 4;
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            if (sat < 0.15) bg++;
          }
        }
      }
    }

    const total = width * height;
    return {
      score: bestScore,
      radius: bestRadius,
      cx, cy,
      bgShare: bg / total,
    };
  },
};
