import React from 'react';

// MacroRing: pure-SVG ring showing the four macro slots.
// Stays theme-agnostic by reading current/target from props.
export function MacroRing({ kcal, protein, carb, fat, target, size = 220 }) {
  const r = size / 2 - 18;
  const cx = size / 2;
  const cy = size / 2;
  const slots = [
    { label: 'kcal', current: kcal.current, target: kcal.target, color: 'var(--hot)', unit: '' },
    { label: 'P', current: protein.current, target: protein.target, color: 'var(--lava)', unit: 'g' },
    { label: 'C', current: carb.current, target: carb.target, color: 'var(--blue)', unit: 'g' },
    { label: 'F', current: fat.current, target: fat.target, color: 'var(--violet)', unit: 'g' }
  ];
  // Stack four arcs 90° each around the ring
  return (
    <div className="macro-ring" role="img" aria-label={`Tagesmakros: ${kcal.current} von ${kcal.target} kcal`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {slots.map((s) => (
            <linearGradient key={s.label} id={`grad-${s.label}`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.4" />
            </linearGradient>
          ))}
        </defs>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth="14" />
        {/* Foreground arcs */}
        {slots.map((s, i) => {
          const start = -90 + i * 90;
          const sweep = 90;
          const pct = s.target > 0 ? Math.min(100, (s.current / s.target) * 100) : 0;
          const sweepPct = (sweep * pct) / 100;
          return (
            <ArcSegment
              key={s.label}
              cx={cx} cy={cy} r={r}
              startAngle={start}
              sweepAngle={sweepPct}
              fullSweep={sweep}
              color={`url(#grad-${s.label})`}
            />
          );
        })}
        {/* Center label */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="ring-kcal">{kcal.current}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="ring-target">/ {kcal.target} kcal</text>
      </svg>
      <div className="ring-legend">
        {slots.map((s) => (
          <div key={s.label} className="ring-legend-row">
            <span className="ring-legend-dot" style={{ background: s.color }} />
            <span className="ring-legend-label">{s.label === 'kcal' ? 'Energie' : s.label === 'P' ? 'Protein' : s.label === 'C' ? 'Carbs' : 'Fett'}</span>
            <span className="ring-legend-value">{s.current}{s.unit} / {s.target}{s.unit}</span>
            <span className="ring-legend-pct">{Math.round(s.target > 0 ? (s.current / s.target) * 100 : 0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArcSegment({ cx, cy, r, startAngle, sweepAngle, fullSweep, color }) {
  if (sweepAngle <= 0) return null;
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, startAngle + sweepAngle);
  const restEnd = polar(cx, cy, r, startAngle + fullSweep);
  const largeArc = sweepAngle > 180 ? 1 : 0;
  const path = [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
  ].join(' ');
  // Background arc (fullSweep) underneath
  const bgPath = [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc >= 1 ? 1 : 0} 1 ${restEnd.x} ${restEnd.y}`
  ].join(' ');
  return (
    <>
      <path d={bgPath} fill="none" stroke="var(--line-soft)" strokeWidth="14" strokeLinecap="butt" />
      <path d={path} fill="none" stroke={color} strokeWidth="14" strokeLinecap="butt" />
    </>
  );
}

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default MacroRing;
