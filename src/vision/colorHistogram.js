// Stage 2: ColorHistogram (HSV 6x3x3 = 54 bins)
// ------------------------------------------------------------------
// RGB → HSV in 0..1. Hue is wrapped to 6 buckets (red/orange/yellow/
// green/blue/purple) so "tomato red" and "bell pepper red" both land
// in bucket 0. Saturation and Value are split into 3 buckets each
// (low/med/high) to distinguish vibrant fresh food from beige grains.
//
// We also keep the raw 1-D histograms in three compact forms:
//   - perHue   : [6]  share of non-grey pixels per hue bucket
//   - perSat   : [3]  share of non-grey pixels per saturation bucket
//   - perVal   : [3]  share of pixels per value bucket
//   - grey     : share of near-grey pixels (low S)
//
// This module is the most important signal because humans judge food
// primarily by color. Calibration: the same meal photographed under
// daylight vs. tungsten shifts the hue/sat modestly; that's why
// downstream scoring uses relative ratios, not absolute bins.

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
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, v];
}

export const ColorHistogram = {
  /**
   * @param {Uint8ClampedArray} pixels
   * @param {number} width
   * @param {number} height
   * @returns {{ perHue: number[6], perSat: number[3], perVal: number[3], grey: number,
   *             hueEntropy: number, satMean: number, valMean: number,
   *             warmth: number, coolness: number, greenness: number, redness: number }}
   */
  compute(pixels, width, height) {
    const perHue = new Float64Array(6);
    const perSat = new Float64Array(3);
    const perVal = new Float64Array(3);
    let grey = 0;
    let hueAcc = 0;
    let satAcc = 0;
    let valAcc = 0;
    let nonGrey = 0;

    const N = width * height;
    for (let i = 0; i < N; i++) {
      const r = pixels[i * 4];
      const g = pixels[i * 4 + 1];
      const b = pixels[i * 4 + 2];
      const [h, s, v] = rgbToHsv(r, g, b);

      satAcc += s;
      valAcc += v;

      if (s < 0.15) {
        grey++;
        continue;
      }
      nonGrey++;
      const hi = Math.min(5, Math.floor(h / 60));
      const si = Math.min(2, Math.floor(s * 3));
      const vi = Math.min(2, Math.floor(v * 3));
      perHue[hi]++;
      perSat[si]++;
      perVal[vi]++;
      hueAcc += h;
    }

    const total = N;
    const norm = (a) => a.map((v) => v / Math.max(1, nonGrey || 1));
    const perH = norm(Array.from(perHue));
    const perS = norm(Array.from(perSat));
    const perV = norm(Array.from(perVal));

    // Entropy over hue: high entropy = multi-colored dish (salad bowl)
    // low entropy = monochromatic (bowl of rice).
    let hueEntropy = 0;
    for (const p of perH) {
      if (p > 0) hueEntropy -= p * Math.log2(p);
    }

    return {
      perHue: perH,
      perSat: perS,
      perVal: perV,
      grey: grey / total,
      hueEntropy,
      satMean: satAcc / total,
      valMean: valAcc / total,
      // Hue buckets in this histogram are HSV-standard:
      //   0 = red (0..60)   |  1 = orange/yellow (60..120)
      //   2 = yellow-green (120..180)  |  3 = cyan/green (180..240)
      //   4 = blue (240..300)  |  5 = magenta (300..360)
      // "greenness" in the human sense lands mostly in bucket 2 (yellow-green)
      // and partially in bucket 3. We combine them.
      warmth: perH[0] + perH[1],
      coolness: perH[3] + perH[4] + perH[5],
      greenness: perH[2] + perH[3] * 0.4,   // yellow-green + some cyan
      redness: perH[0],                      // pure red
      orangeness: perH[1],                   // orange/yellow
      blueness: perH[4],
    };
  },
};
