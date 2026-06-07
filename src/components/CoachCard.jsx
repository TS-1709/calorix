import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

// CoachCard: renders a single coach message with framework citation.
// Reads `coach` (output from engine.generateCoachMessage).
export function CoachCard({ coach, onChangeMood, mood }) {
  if (!coach) return null;
  return (
    <section className="coach-card panel" aria-live="polite">
      <header>
        <div className="coach-framework">
          <Sparkles size={14} />
          <span>{coach.framework.shortName}</span>
        </div>
        <h2>Heute vom Coach</h2>
        <p className="coach-citation">{coach.framework.citation}</p>
      </header>
      <blockquote>{coach.text}</blockquote>
      <footer>
        <p className="coach-framework-desc">{coach.framework.description}</p>
        <div className="coach-mood">
          <span>Wie geht es dir heute?</span>
          <div role="group" aria-label="Stimmung wählen">
            {[
              { id: 'good', label: 'Gut' },
              { id: 'neutral', label: 'Neutral' },
              { id: 'rough', label: 'Rau' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                className={mood === m.id ? 'mood-pill active' : 'mood-pill'}
                onClick={() => onChangeMood(m.id)}
                aria-pressed={mood === m.id}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <p className="coach-disclaimer">
          <BookOpen size={12} /> Coach ist kein Therapeut. Vier psychologische Frameworks (CBT, ACT, SDT, MI) — alle lokal, deterministisch.
        </p>
      </footer>
    </section>
  );
}

export default CoachCard;
