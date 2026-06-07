import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Vision DB bootstrap: hand the (vision-annotated) food DB to the pipeline
// at boot. After this, recognizeFood() is fully synchronous-ish.
//
// CRITICAL: importing the pipeline module here is what makes Vite include
// the vision/* submodules in the production bundle. If we relied solely
// on PhotoLogger's lazy import, Vite's tree-shaker would drop the vision
// submodules because it can't statically prove they're reachable.
import { setDatabase } from './vision/dbBridge.js';
import { annotateFoodDb } from './vision/foodMapping.js';
import { foodDb } from './nutrition/foodDb.js';
import { recognizeFood } from './vision/pipeline.js';
setDatabase(annotateFoodDb(foodDb));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then((reg) => {
        // v6: unregister old v4/v5 service workers immediately, then activate v6.
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      });
    }
  });
}

createRoot(document.getElementById('root')).render(<App />);
