import React from 'react';
import { listDayKeys, loadDay, streakFromKeys } from '../engine/storage.js';
import { sumMacros } from '../nutrition/estimator.js';

// StreakCalendar: shows last 14 days, marks days with entries.
// Pure SVG, no chart library.
export function StreakCalendar({ dayKeys = null }) {
  const keys = dayKeys || listDayKeys();
  const streak = streakFromKeys(keys);

  // Build 14-day window
  const days = [];
  const set = new Set(keys);
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    const day = loadDay(k);
    const macros = sumMacros((day.entries || []).map((e) => e.macros));
    days.push({
      key: k,
      label: d.toLocaleDateString('de-DE', { weekday: 'short' }),
      day: d.getDate(),
      has: set.has(k) && (day.entries || []).length > 0,
      kcal: macros.kcal
    });
  }

  return (
    <section className="streak panel">
      <header>
        <h2>Konstanz</h2>
        <p>14 Tage zurück, kein Tag wiegt mehr als ein anderer.</p>
      </header>
      <div className="streak-row">
        {days.map((d) => (
          <div key={d.key} className={`streak-cell ${d.has ? 'has' : ''}`} title={`${d.key}${d.has ? ' · ' + d.kcal + ' kcal' : ''}`}>
            <span className="streak-day-label">{d.label}</span>
            <span className="streak-day-num">{d.day}</span>
            <span className="streak-day-dot" />
          </div>
        ))}
      </div>
      <div className="streak-meta">
        <span><strong>{streak}</strong> Tag{ein && streak !== 1 ? 'e' : ''} in Folge</span>
        <span><strong>{keys.length}</strong> erfasste Tage gesamt</span>
      </div>
    </section>
  );
}

export default StreakCalendar;
