import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Vision DB bootstrap: hand the (vision-annotated) food DB to the pipeline
// at boot. After this, recognizeFood() is fully synchronous-ish.
import { setDatabase } from './vision/dbBridge.js';
import { annotateFoodDb } from './vision/foodMapping.js';
import { foodDb } from './nutrition/foodDb.js';
setDatabase(annotateFoodDb(foodDb));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js'));
}

createRoot(document.getElementById('root')).render(<App />);
