// PhotoLogger: snap or upload a meal photo, get top-3 candidates
// with macros pre-filled, then refine portion size and add to log.
//
// This is the user-facing entry point into the vision pipeline.
// All processing is local — no network call.

import React, { useRef, useState } from 'react';
import { Camera, Loader2, Sparkles, RefreshCcw, X, ImagePlus, Lock } from 'lucide-react';
import { recognizeFood } from '../vision/pipeline.js';

export function PhotoLogger({ db, onPickFood, onClose }) {
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [autoAdded, setAutoAdded] = useState(null);
  const fileInput = useRef(null);
  const cameraInput = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setStatus('loading');
    setError(null);
    setResult(null);
    setAutoAdded(null);
    setImageUrl(URL.createObjectURL(file));

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl || URL.createObjectURL(file);
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const out = await recognizeFood(img, { db });
      setResult(out);

      // Auto-fill the top match with its default portion so the user
      // only has to confirm or adjust. This is the wow-moment:
      // "took a photo, kcal is already there, just say 'yes'".
      if (out.top.length > 0) {
        const winner = out.top[0];
        const foodMeta = db.find((f) => f.id === winner.id) || {};
        onPickFood({
          food: foodMeta,
          grams: foodMeta.defaultPortion || 100,
          source: 'vision',
          confidence: winner.confidence,
          reasons: winner.reasons,
        });
        setAutoAdded(winner);
      }

      setStatus('ready');
    } catch (e) {
      console.error('PhotoLogger error', e);
      setError(e?.message || 'Bild konnte nicht analysiert werden.');
      setStatus('error');
    }
  };

  const pickAnother = (food) => {
    onPickFood({
      food,
      grams: food.defaultPortion || 100,
      source: 'vision',
      confidence: result?.all.find((c) => c.id === food.id)?.confidence ?? 0,
      reasons: result?.all.find((c) => c.id === food.id)?.reasons ?? [],
    });
    setAutoAdded(result?.all.find((c) => c.id === food.id) || null);
  };

  return (
    <section className="panel photo-logger" aria-label="Foto-Erkennung">
      <header className="photo-header">
        <div>
          <h2><Camera size={16} /> Foto erkennen</h2>
          <p>
            Foto hochladen oder aufnehmen — die Pipeline läuft komplett lokal.
            <span className="photo-privacy"><Lock size={11} /> 0 Network-Calls</span>
          </p>
        </div>
        {onClose && (
          <button type="button" className="icon-button" onClick={onClose} aria-label="Schließen">
            <X size={16} />
          </button>
        )}
      </header>

      {status === 'idle' && (
        <div className="photo-cta">
          <button
            type="button"
            className="button primary"
            onClick={() => cameraInput.current?.click()}
          >
            <Camera size={16} /> Foto aufnehmen
          </button>
          <button
            type="button"
            className="button ghost"
            onClick={() => fileInput.current?.click()}
          >
            <ImagePlus size={16} /> Datei wählen
          </button>
          <input
            ref={cameraInput}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {status === 'loading' && (
        <div className="photo-loading">
          <Loader2 size={20} className="spin" />
          <p>Bild wird analysiert — Color-Histogramm, Kanten, Teller, Spatial…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="photo-error" role="alert">
          <p>Fehler: {error}</p>
          <button type="button" className="button ghost" onClick={() => setStatus('idle')}>
            <RefreshCcw size={14} /> Erneut versuchen
          </button>
        </div>
      )}

      {status === 'ready' && result && (
        <div className="photo-result">
          {imageUrl && (
            <div className="photo-preview">
              <img src={imageUrl} alt="Mahlzeit" />
              <span className="photo-timing">
                {result.durationMs.toFixed(0)} ms · Hash {result.imageHash}
              </span>
            </div>
          )}

          <div className="photo-candidates">
            <h3>Top-Kandidaten</h3>
            <ol>
              {result.top.map((c) => {
                const food = db.find((f) => f.id === c.id) || { name: c.name };
                return (
                  <li
                    key={c.id}
                    className={autoAdded?.id === c.id ? 'selected' : ''}
                  >
                    <button type="button" onClick={() => pickAnother(food)}>
                      <div className="candidate-row">
                        <span className="candidate-name">{food.name}</span>
                        <span className="candidate-confidence">
                          {(c.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="candidate-bar">
                        <div
                          className="candidate-bar-fill"
                          style={{ width: `${Math.min(100, c.confidence * 100)}%` }}
                        />
                      </div>
                      <ul className="candidate-reasons">
                        {c.reasons.slice(0, 2).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="photo-footer">
            <button
              type="button"
              className="button ghost"
              onClick={() => {
                setStatus('idle');
                setResult(null);
                setImageUrl(null);
                setAutoAdded(null);
              }}
            >
              <RefreshCcw size={14} /> Neues Foto
            </button>
            <span className="photo-meta">
              5 Stages · 19.200 Pixel · 0 KB extern
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default PhotoLogger;
