import React from 'react';
import { Download, X } from 'lucide-react';

// SpecimenCard: a self-contained, shareable summary of a closed day.
// Pure SVG, no canvas, no network. Deterministic art field per day-key.
//
// Props:
//   day: { entries: Entry[] }
//   macros: { kcal, protein, carb, fat }
//   target: { kcal, protein, carb, fat }
//   streak: number
//   dayKey: 'YYYY-MM-DD'
//   coach: { framework, text }
//   onClose: () => void
export function SpecimenCard({ day, macros, target, streak, dayKey, coach, onClose }) {
  const pct = {
    kcal: target.kcal > 0 ? Math.round((macros.kcal / target.kcal) * 100) : 0,
    protein: target.protein > 0 ? Math.round((macros.protein / target.protein) * 100) : 0,
    carb: target.carb > 0 ? Math.round((macros.carb / target.carb) * 100) : 0,
    fat: target.fat > 0 ? Math.round((macros.fat / target.fat) * 100) : 0
  };
  const kcalDelta = macros.kcal - target.kcal;

  const dataUrl = buildSpecimenSvg({ day, macros, target, pct, streak, dayKey, coach, kcalDelta });
  const download = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `calorix-${dayKey}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div role="dialog" aria-label="Tagesabschluss-Karte" style={{
      position: 'fixed', inset: 0, background: 'rgba(2,1,4,.82)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20
    }}>
      <div style={{
        width: '100%', maxWidth: 460, maxHeight: '92vh', overflow: 'auto',
        background: 'linear-gradient(165deg, #04060f 0%, #0a0814 60%, #03030a 100%)',
        color: '#f7f8f8', borderRadius: 22, padding: 24,
        boxShadow: '0 30px 80px rgba(0,0,0,.55), inset 0 0 0 1px rgba(124,246,200,.08)',
        position: 'relative', fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--hot)' }}>·CALORIX·</span>
          <button onClick={onClose} aria-label="Schließen" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 20, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.01 }}>{dayKey}</h3>
        <p style={{ margin: '4px 0 16px', fontSize: 12, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--mono)' }}>
          {day.entries.length} Eintrag{day.entries.length === 1 ? '' : 'e'} · Streak {streak} {streak === 1 ? 'Tag' : 'Tage'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <SpecStat label="kcal" value={macros.kcal} target={target.kcal} pct={pct.kcal} accent="var(--hot)" />
          <SpecStat label="Protein" value={`${macros.protein.toFixed(0)}g`} target={`${target.protein}g`} pct={pct.protein} accent="var(--lava)" />
          <SpecStat label="Carbs" value={`${macros.carb.toFixed(0)}g`} target={`${target.carb}g`} pct={pct.carb} accent="var(--blue)" />
          <SpecStat label="Fett" value={`${macros.fat.toFixed(0)}g`} target={`${target.fat}g`} pct={pct.fat} accent="var(--violet)" />
        </div>

        {coach && (
          <div style={{ padding: 12, background: 'rgba(124,246,200,.04)', borderLeft: '2px solid var(--hot)', borderRadius: 6, marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 10, letterSpacing: 0.8, color: 'var(--hot)', textTransform: 'uppercase', fontWeight: 600 }}>{coach.framework.shortName} · {coach.framework.citation}</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5 }}>{coach.text}</p>
          </div>
        )}

        {day.entries.length > 0 && (
          <details style={{ marginBottom: 12 }}>
            <summary style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 12 }}>Einträge ansehen ({day.entries.length})</summary>
            <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'grid', gap: 4, maxHeight: 120, overflow: 'auto' }}>
              {day.entries.map((e) => (
                <li key={e.id} style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  <span>{e.foodName}</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>{e.macros.kcal} kcal</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <button type="button" onClick={download} style={{
          width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '10px 16px', background: 'var(--hot)', color: '#04060f',
          border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer'
        }}>
          <Download size={16} /> Als SVG speichern
        </button>
      </div>
    </div>
  );
}

function SpecStat({ label, value, target, pct, accent }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--line-soft)', borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontSize: 18, fontFamily: 'var(--mono)', fontWeight: 600, color: accent }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>/ {target} · {pct}%</div>
    </div>
  );
}

// SVG builder for the shareable card. Self-contained, no external assets.
function buildSpecimenSvg({ day, macros, target, pct, streak, dayKey, coach, kcalDelta }) {
  const W = 720, H = 1040;
  // Deterministic seed for the spark field
  const seed = dayKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const stars = Array.from({ length: 60 }).map((_, i) => {
    const x = ((seed * 31 + i * 73) % W);
    const y = ((seed * 17 + i * 113) % (H * 0.55));
    const r = (i % 7 === 0) ? 2 : 1;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${0.25 + (i % 4) * 0.18}"/>`;
  }).join('');

  const entryList = (day.entries || []).slice(0, 8).map((e, i) =>
    `<text x="48" y="${560 + i * 22}" font-family="Inter, system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,.7)">${escapeXml(e.foodName)}</text>
     <text x="${W - 48}" y="${560 + i * 22}" font-family="JetBrains Mono, monospace" font-size="14" text-anchor="end" fill="rgba(255,255,255,.9)">${e.macros.kcal} kcal</text>`
  ).join('');

  const delta = kcalDelta > 0 ? `+${kcalDelta} über Ziel` : `${kcalDelta} unter Ziel`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#7cf6c8" stop-opacity="0.6"/>
      <stop offset="60%" stop-color="#5da9ff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#04060f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#04060f"/>
      <stop offset="100%" stop-color="#02030a"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H * 0.5}" fill="url(#glow)"/>
  ${stars}
  <text x="48" y="64" font-family="Inter, system-ui, sans-serif" font-size="20" letter-spacing="6" fill="#7cf6c8">·CALORIX·</text>
  <text x="48" y="116" font-family="Inter, system-ui, sans-serif" font-size="48" font-weight="600" fill="#fff">${escapeXml(dayKey)}</text>
  <text x="48" y="148" font-family="JetBrains Mono, monospace" font-size="16" fill="rgba(255,255,255,.55)">${day.entries.length} Eintrag${day.entries.length === 1 ? '' : 'e'} · Streak ${streak} ${streak === 1 ? 'Tag' : 'Tage'}</text>

  <g transform="translate(48, 200)">
    <text font-family="Inter, system-ui, sans-serif" font-size="14" letter-spacing="3" fill="rgba(255,255,255,.5)">ENERGIE</text>
    <text y="44" font-family="JetBrains Mono, monospace" font-size="56" font-weight="600" fill="#7cf6c8">${macros.kcal}</text>
    <text x="220" y="44" font-family="JetBrains Mono, monospace" font-size="20" fill="rgba(255,255,255,.5)">/ ${target.kcal} kcal</text>
    <text x="220" y="68" font-family="JetBrains Mono, monospace" font-size="16" fill="#a47bff">${delta}</text>
  </g>

  <g transform="translate(48, 320)" font-family="Inter, system-ui, sans-serif" font-size="20" fill="#fff">
    <text font-size="12" letter-spacing="3" fill="rgba(255,255,255,.5)">PROTEIN</text>
    <text y="34" font-family="JetBrains Mono, monospace" font-size="28" font-weight="500" fill="#5da9ff">${macros.protein.toFixed(0)}g</text>
    <text x="160" font-size="12" letter-spacing="3" fill="rgba(255,255,255,.5)">CARBS</text>
    <text x="160" y="34" font-family="JetBrains Mono, monospace" font-size="28" font-weight="500" fill="#7ce5ff">${macros.carb.toFixed(0)}g</text>
    <text x="320" font-size="12" letter-spacing="3" fill="rgba(255,255,255,.5)">FETT</text>
    <text x="320" y="34" font-family="JetBrains Mono, monospace" font-size="28" font-weight="500" fill="#a47bff">${macros.fat.toFixed(0)}g</text>
  </g>

  <line x1="48" y1="420" x2="${W - 48}" y2="420" stroke="rgba(255,255,255,.08)" stroke-width="1"/>
  <text x="48" y="450" font-family="Inter, system-ui, sans-serif" font-size="12" letter-spacing="3" fill="rgba(255,255,255,.5)">EINTRÄGE</text>
  ${entryList}

  ${coach ? `
  <line x1="48" y1="${H - 220}" x2="${W - 48}" y2="${H - 220}" stroke="rgba(255,255,255,.08)" stroke-width="1"/>
  <text x="48" y="${H - 184}" font-family="Inter, system-ui, sans-serif" font-size="12" letter-spacing="3" fill="#7cf6c8">COACH · ${escapeXml(coach.framework.shortName)} · ${escapeXml(coach.framework.citation)}</text>
  <foreignObject x="48" y="${H - 168}" width="${W - 96}" height="100">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, system-ui, sans-serif; font-size: 16px; line-height: 1.5; color: rgba(255,255,255,.85); padding: 0; margin: 0;">${escapeXml(coach.text)}</div>
  </foreignObject>
  ` : ''}

  <rect x="0" y="${H - 60}" width="${W}" height="60" fill="rgba(255,255,255,.04)"/>
  <text x="48" y="${H - 24}" font-family="Inter, system-ui, sans-serif" font-size="14" letter-spacing="3" fill="#7cf6c8">CALORIX · PRIVACY-FIRST MEAL COACH</text>
  <text x="${W - 48}" y="${H - 24}" font-family="Inter, system-ui, sans-serif" font-size="14" letter-spacing="2" fill="rgba(255,255,255,.4)" text-anchor="end">MIT · OPENSOURCE</text>
</svg>`;
}

function escapeXml(s) {
  return String(s || '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '\'': '&apos;', '"': '&quot;' }[c]));
}

export default SpecimenCard;
