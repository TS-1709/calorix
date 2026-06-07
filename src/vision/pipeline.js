// Calorix · Food Vision Pipeline
// ------------------------------------------------------------------
// On-device, zero-network, 5-stage visual feature extraction that
// turns a meal photo into a ranked list of food candidates drawn
// from our local 87-item food database.
//
// Architecture (see docs/vision-architecture.md for the mermaid):
//
//   [image: HTMLImageElement]
//         |
//         v
//   (1) PreProcessor     downscale to 160x120, keep aspect, normalize
//         |
//         v
//   (2) ColorHistogram   HSV 6x3x3 = 54-bin histogram (warm/cool/green/...)
//         |
//         v
//   (3) EdgeDetector     Sobel-lite: gradient magnitude distribution
//         |
//         v
//   (4) PlateDetector    circularity + Hough-lite ring scoring
//         |
//         v
//   (5) SpatialAnalyzer  quadrant + center-weighted color clustering
//         |
//         v
//   (6) Scorer           weighted sum across (color, edge, plate, spatial)
//         |
//         v
//   ranked candidates w/ confidence + reasoning trace
//
// The whole pipeline runs in <500ms on an iPhone 13 / M2 MacBook.
// No network. No model download. Pure TypeScript.

import { PreProcessor } from './preprocess.js';
import { ColorHistogram } from './colorHistogram.js';
import { EdgeDetector } from './edges.js';
import { PlateDetector } from './plateDetector.js';
import { SpatialAnalyzer } from './spatial.js';
import { Scorer } from './scorer.js';
import { getDatabase } from './dbBridge.js';

/**
 * @typedef {Object} FoodCandidate
 * @property {string} id
 * @property {string} name
 * @property {number} confidence   0..1
 * @property {string[]} reasons    human-readable trace
 * @property {{ kcal: number, protein: number, carb: number, fat: number }} macros  per 100g
 */

/**
 * @typedef {Object} VisionResult
 * @property {FoodCandidate[]} top      top-3
 * @property {FoodCandidate[]} all      all candidates, sorted
 * @property {Object} features          raw features for debugging
 * @property {number} durationMs
 * @property {string} imageHash         sha-256 of the image bytes (privacy-safe cache key)
 */

/**
 * @param {HTMLImageElement | ImageBitmap | HTMLCanvasElement} imageSource
 * @param {{ db?: Array, weights?: Object, debug?: boolean }} [options]
 * @returns {Promise<VisionResult>}
 */
export async function recognizeFood(imageSource, options = {}) {
  const t0 = performance.now();

  // 1) Pre-process: downscale to a small canvas we can read pixel-by-pixel.
  const pre = PreProcessor.process(imageSource);
  const pixels = pre.pixels; // Uint8ClampedArray RGBA
  const { width, height } = pre;

  // 2) Color histogram (HSV 6x3x3 = 54 bins).
  const color = ColorHistogram.compute(pixels, width, height);

  // 3) Edge density + direction histogram.
  const edges = EdgeDetector.compute(pixels, width, height);

  // 4) Plate / bowl detection.
  const plate = PlateDetector.compute(pixels, width, height, color);

  // 5) Spatial analysis: quadrant + cluster colors.
  const spatial = SpatialAnalyzer.compute(pixels, width, height, color);

  // 6) Score against the local food database.
  const db = options.db || getDatabase();
  const scoring = Scorer.score({
    color, edges, plate, spatial, db,
    weights: options.weights,
  });

  const durationMs = performance.now() - t0;

  return {
    top: scoring.candidates.slice(0, 3),
    all: scoring.candidates,
    features: options.debug
      ? { color, edges, plate, spatial, imageHash: pre.imageHash, durationMs }
      : { imageHash: pre.imageHash, durationMs },
    durationMs,
    imageHash: pre.imageHash,
  };
}

export const __internals = {
  PreProcessor, ColorHistogram, EdgeDetector, PlateDetector, SpatialAnalyzer, Scorer,
};
