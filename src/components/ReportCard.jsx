import React, { useState } from 'react';
import { listDayKeys, loadDay } from '../engine/storage.js';
import { sumMacros } from '../nutrition/estimator.js';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Weekly report — the "specimen card" idea applied to nutrition.
// 7 days, kcal per day, simple stats, one observation.
export function ReportCard({ target }) {
  const [open, setOpen] = useState(false);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    const day = loadDay(k);
    const macros = sumMacros((day.entries || []).map((e) => e.macros));
    days.push({ key: k, label: d.toLocaleDateString('de-DE', { weekday: 'short' }), kcal: macros.kcal, has: (day.entries || []).length > 0 });
  }
  const loggedDays = days.filter((d) => d.has);
  const total = loggedDays.reduce((s, d) => s + d.kcal, 0);
  const avg = loggedDays.length ? Math.round(total / loggedDays.length) : 0;
  const maxKcal = Math.max(1, ...days.map((d) => d.kcal));

  return (
    <section className="report panel">
      <header>
        <h2>Wochenbericht</h2>
        <button type="button" className="link-button" onClick={() => setOpen(!open)}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {open ? 'Einklappen' : 'Aufklappen'}
        </button>
      </header>
      {open && (
        <div className="report-body">
          <div className="report-stats">
            <div><span>Ø Tag</span><strong>{avg} kcal</strong></div>
            <div><span>Ziel</span><strong>{target.kcal} kcal</strong></div>
            <div><span>Δ</span><strong className={avg > target.kcal ? 'over' : 'under'}>{avg - target.kcal > 0 ? '+' : ''}{avg - target.kcal}</strong></div>
          </div>
          <div className="report-bars">
            {days.map((d) => (
              <div key={d.key} className="report-bar-row" title={`${d.key}: ${d.kcal} kcal`}>
                <span className="report-bar-day">{d.label}</span>
                <div className="report-bar-track">
                  <div className="report-bar-fill" style={{ width: `${(d.kcal / maxKcal) * 100}%` }} />
                  <div className="report-bar-target" style={{ left: `${(target.kcal / maxKcal) * 100}%` }} aria-label="Ziel-Linie" />
                </div>
                <span className="report-bar-kcal">{d.has ? d.kcal : '—'}</span>
              </div>
            ))}
          </div>
          <p className="report-observation">
            {loggedDays.length === 0
              ? 'Noch keine Daten diese Woche. Tracking ist Information, nicht Pflicht.'
              : loggedDays.length < 3
                ? `${loggedDays.length} Tag${loggedDays.length > 1 ? 'e' : ''} erfasst. Mehr Daten, weniger Raten.`
                : avg > target.kcal + 300
                  ? `Im Schnitt ${avg - target.kcal} kcal über dem Ziel. Frage dich: war der Hunger real oder die Gewohnheit?`
                  : avg < target.kcal - 300
                    ? `Im Schnitt ${target.kcal - avg} kcal unter dem Ziel. Wie war dein Energielevel, dein Hunger, deine Stimmung?`
                    : `Im Schnitt auf Kurs. ${avg - target.kcal > 0 ? '+' : ''}${avg - target.kcal} kcal Abweichung. Konstanz ist der seltene Trick.`}
          </p>
        </div>
      )}
    </section>
  );
}

export default ReportCard;
