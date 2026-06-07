// Stage 5: SpatialAnalyzer
// ------------------------------------------------------------------
// Splits the plate area (or whole image if no plate) into 4 quadrants
// and computes a small color signature per quadrant. Also finds the
// single most "saturated" pixel cluster (a heuristic for "this is the
// garnish / the colorful thing on the plate").
//
// Outputs:
//   - quadrants : { tl, tr, bl, br } each with { hueShare: [6], sat, val }
//   - focus     : 0..1, how concentrated the color is in one quadrant
//   - centerVs  : saturation at the image center vs. periphery
//   - dominantQuadrant : 'tl' | 'tr' | 'bl' | 'br' | 'center'
//
// Why this matters for food: rice-with-curry has color concentrated
// in the top half. Soup has it everywhere. Steak with side salad has
// greenness concentrated to the right or left. Plate of pasta with
// tomato sauce has high red in the lower-right.

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return [h, s, v];
}

function quadrantStats(pixels, width, height, x0, y0, x1, y1) {
  const hue = new Float64Array(6);
  let sat = 0, val = 0, n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      const [h, s, v] = rgbToHsv(r, g, b);
      if (s > 0.15) hue[Math.min(5, Math.floor(h / 60))]++;
      sat += s; val += v; n++;
    }
  }
  const total = Math.max(1, hue.reduce((a, b) => a + b, 0));
  return {
    hueShare: Array.from(hue, (v) => v / total),
    sat: sat / n,
    val: val / n,
  };
}

export const SpatialAnalyzer = {
  compute(pixels, width, height, color) {
    const halfW = Math.floor(width / 2);
    const halfH = Math.floor(height / 2);

    const tl = quadrantStats(pixels, width, height, 0, 0, halfW, halfH);
    const tr = quadrantStats(pixels, width, height, halfW, 0, width, halfH);
    const bl = quadrantStats(pixels, width, height, 0, halfH, halfW, height);
    const br = quadrantStats(pixels, width, height, halfW, halfH, width, height);

    // Center vs. periphery saturation: dessert / fruit bowls are often
    // very saturated at the center (mound of food), and grey at the rim.
    let centerSat = 0, centerN = 0, periSat = 0, periN = 0;
    const cx = width / 2, cy = height / 2;
    const r2 = (Math.min(width, height) / 2.5) ** 2;
    const rOut = (Math.min(width, height) / 1.8) ** 2;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
        const [, s] = rgbToHsv(r, g, b);
        const dx = x - cx, dy = y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2) { centerSat += s; centerN++; }
        else if (d2 > rOut) { periSat += s; periN++; }
      }
    }

    // Dominant quadrant: which quadrant has the highest non-grey share?
    const shares = {
      tl: tl.hueShare.reduce((a, b) => a + b, 0),
      tr: tr.hueShare.reduce((a, b) => a + b, 0),
      bl: bl.hueShare.reduce((a, b) => a + b, 0),
      br: br.hueShare.reduce((a, b) => a + b, 0),
    };
    const dominantQuadrant = Object.entries(shares).sort((a, b) => b[1] - a[1])[0][0];

    // Focus: max share / mean share
    const vals = Object.values(shares);
    const maxS = Math.max(...vals);
    const meanS = vals.reduce((a, b) => a + b, 0) / vals.length;
    const focus = meanS > 0 ? Math.min(1, (maxS - meanS) / (1 - meanS + 1e-6)) : 0;

    return {
      quadrants: { tl, tr, bl, br },
      focus,
      centerVs: centerN > 0 ? centerSat / centerN : 0,
      peripheryVs: periN > 0 ? periSat / periN : 0,
      dominantQuadrant,
    };
  },
};
