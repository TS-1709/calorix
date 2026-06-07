import React, { useEffect, useMemo, useState } from 'react';
import { Atom, Lock, Settings, X, Save, Info, Sparkles, Calendar, Keyboard } from 'lucide-react';
import { MealLogger } from './components/MealLogger.jsx';
import { MacroRing } from './components/MacroRing.jsx';
import { CoachCard } from './components/CoachCard.jsx';
import { StreakCalendar } from './components/StreakCalendar.jsx';
import { ReportCard } from './components/ReportCard.jsx';
import { SpecimenCard } from './components/SpecimenCard.jsx';
import { generateCoachMessage, macroBadge } from './coach/engine.js';
import { sumMacros, defaultTargetKcal } from './nutrition/estimator.js';
import { listDayKeys, loadDay, saveDay, todayKey, streakFromKeys, readJSON, writeString, writeJSON } from './engine/storage.js';

const DEFAULT_TARGET_KEY = 'target';

function loadTarget() {
  return readJSON(DEFAULT_TARGET_KEY, defaultTargetKcal('unspecified'));
}

function loadMood() {
  return readJSON('mood:' + todayKey(), 'neutral');
}

function saveMood(m) {
  writeJSON('mood:' + todayKey(), m);
}

export default function App() {
  const [day, setDay] = useState(() => loadDay());
  const [target, setTarget] = useState(() => loadTarget());
  const [showSettings, setShowSettings] = useState(false);
  const [showSpecimen, setShowSpecimen] = useState(false);
  const [mood, setMood] = useState(() => loadMood());
  const [dayKeys, setDayKeys] = useState(() => listDayKeys());

  // Refresh today's day on mount (covers midnight transitions)
  useEffect(() => { setDay(loadDay()); setDayKeys(listDayKeys()); }, []);

  const totalMacros = useMemo(() => sumMacros((day.entries || []).map((e) => e.macros)), [day]);
  const badge = useMemo(() => macroBadge(totalMacros, target), [totalMacros, target]);
  const streak = useMemo(() => streakFromKeys(dayKeys), [dayKeys]);
  const coach = useMemo(() => generateCoachMessage({
    macros: totalMacros, target, streak, mood
  }), [totalMacros, target, streak, mood]);

  const handleAdd = (entry) => {
    const next = { ...day, entries: [...(day.entries || []), entry] };
    setDay(next);
    saveDay(todayKey(), next);
    setDayKeys(listDayKeys());
  };
  const handleRemove = (id) => {
    const next = { ...day, entries: (day.entries || []).filter((e) => e.id !== id) };
    setDay(next);
    saveDay(todayKey(), next);
  };
  const handleChangeMood = (m) => {
    setMood(m);
    saveMood(m);
  };
  const handleSaveTarget = (t) => {
    setTarget(t);
    writeJSON(DEFAULT_TARGET_KEY, t);
    setShowSettings(false);
  };

  return (
    <main>
      <nav className="topbar">
        <a className="brand" href="#top"><Atom size={20} /> Calorix</a>
        <span className="topbar-tagline">Privacy-First Meal Coach</span>
        <button type="button" className="icon-button" onClick={() => setShowSettings(true)} aria-label="Einstellungen">
          <Settings size={18} />
        </button>
      </nav>

      <div id="top" className="app-shell">
        <header className="hero">
          <div className="hero-copy">
            <span className="hero-eyebrow">Heute · {todayKey()}</span>
            <h1>Was hast du heute gegessen?</h1>
            <p>Calorix rechnet lokal, der Coach hört zu. Kein Account, keine Cloud, keine Tracker-Skripte.</p>
            <div className="hero-stats">
              <span><strong>{totalMacros.kcal}</strong> kcal heute</span>
              <span><strong>{streak}</strong> {streak === 1 ? 'Tag' : 'Tage'} Konstanz</span>
              <span><strong>{day.entries?.length || 0}</strong> Einträge</span>
            </div>
          </div>
          <MacroRing {...badge} target={target} size={240} />
        </header>

        <CoachCard coach={coach} mood={mood} onChangeMood={handleChangeMood} />

        {day.entries?.length === 0 && (
          <section className="onboarding panel" aria-label="Schnellstart">
            <Sparkles size={16} />
            <div>
              <h2>Erste Mahlzeit in 10 Sekunden</h2>
              <p>Suche nach <code>Hähnchen</code>, <code>Reis</code>, <code>Apfel</code>, <code>Ei</code> oder einem beliebigen anderen Lebensmittel. Beschreibe die Portion in eigenen Worten: <em>150g</em>, <em>eine Hand voll</em>, <em>⅓ Teller</em>. Calorix rechnet lokal.</p>
              <div className="onboarding-tips">
                <span><Keyboard size={12} /> <kbd>Tab</kbd> zum Navigieren · <kbd>Enter</kbd> zum Hinzufügen</span>
                <span><Calendar size={12} /> Macro-Ziel im <button type="button" className="link-inline" onClick={() => setShowSettings(true)}>Einstellungen</button> anpassen</span>
              </div>
            </div>
          </section>
        )}

        <MealLogger day={day} onAdd={handleAdd} onRemove={handleRemove} />

        {day.entries?.length > 0 && (
          <section className="day-close panel">
            <div>
              <h2>Tag abschließen</h2>
              <p>Erzeuge eine teilbare Specimen-Karte für diesen Tag — als SVG, ohne Cloud.</p>
            </div>
            <button type="button" className="button primary" onClick={() => setShowSpecimen(true)}>
              <Sparkles size={16} /> Specimen-Karte
            </button>
          </section>
        )}

        <StreakCalendar dayKeys={dayKeys} />

        <ReportCard target={target} />

        <AboutBlock />

        <footer>
          <Lock size={14} />
          <span>100% lokal. Kein Account, keine Cloud. Quelloffen unter MIT.</span>
        </footer>
      </div>

      {showSettings && (
        <SettingsModal
          target={target}
          onSave={handleSaveTarget}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showSpecimen && (
        <SpecimenCard
          day={day}
          macros={totalMacros}
          target={target}
          streak={streak}
          dayKey={todayKey()}
          coach={coach}
          onClose={() => setShowSpecimen(false)}
        />
      )}
    </main>
  );
}

function SettingsModal({ target, onSave, onClose }) {
  const [kcal, setKcal] = useState(target.kcal);
  const [protein, setProtein] = useState(target.protein);
  const [carb, setCarb] = useState(target.carb);
  const [fat, setFat] = useState(target.fat);
  const [advanced, setAdvanced] = useState(false);
  const [sex, setSex] = useState('unspecified');
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(35);
  const [activity, setActivity] = useState('moderate');

  const applyBmr = () => {
    const t = defaultTargetKcal(sex, weight, height, age, activity);
    setKcal(t.kcal); setProtein(t.protein); setCarb(t.carb); setFat(t.fat);
  };

  const save = () => onSave({ kcal: +kcal, protein: +protein, carb: +carb, fat: +fat });

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Einstellungen">
      <div className="modal">
        <header>
          <h2>Tagesziel</h2>
          <button type="button" onClick={onClose} aria-label="Schließen"><X size={18} /></button>
        </header>
        <div className="modal-body">
          <div className="settings-grid">
            <label><span>Kalorien</span><input type="number" min="800" max="6000" value={kcal} onChange={(e) => setKcal(e.target.value)} /></label>
            <label><span>Protein (g)</span><input type="number" min="0" max="400" value={protein} onChange={(e) => setProtein(e.target.value)} /></label>
            <label><span>Carbs (g)</span><input type="number" min="0" max="600" value={carb} onChange={(e) => setCarb(e.target.value)} /></label>
            <label><span>Fett (g)</span><input type="number" min="0" max="300" value={fat} onChange={(e) => setFat(e.target.value)} /></label>
          </div>
          <button type="button" className="link-button" onClick={() => setAdvanced(!advanced)}>
            {advanced ? 'Einfach' : 'Aus BMR ableiten'}
          </button>
          {advanced && (
            <div className="settings-grid advanced">
              <label><span>Geschlecht</span>
                <select value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="unspecified">Neutral</option>
                  <option value="male">Männlich</option>
                  <option value="female">Weiblich</option>
                </select>
              </label>
              <label><span>Gewicht (kg)</span><input type="number" min="30" max="250" value={weight} onChange={(e) => setWeight(e.target.value)} /></label>
              <label><span>Größe (cm)</span><input type="number" min="100" max="230" value={height} onChange={(e) => setHeight(e.target.value)} /></label>
              <label><span>Alter</span><input type="number" min="14" max="100" value={age} onChange={(e) => setAge(e.target.value)} /></label>
              <label><span>Aktivität</span>
                <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                  <option value="low">Wenig (Bürojob)</option>
                  <option value="moderate">Mittel (1-3× Sport/Woche)</option>
                  <option value="high">Hoch (täglich aktiv)</option>
                </select>
              </label>
              <button type="button" className="button ghost" onClick={applyBmr}>Aus BMR ableiten</button>
            </div>
          )}
        </div>
        <footer>
          <button type="button" onClick={onClose}>Abbrechen</button>
          <button type="button" className="primary" onClick={save}><Save size={16} /> Speichern</button>
        </footer>
      </div>
    </div>
  );
}

function AboutBlock() {
  return (
    <details className="about panel">
      <summary><Info size={14} /> Über Calorix</summary>
      <div>
        <p>
          <strong>100% lokal, open source (MIT).</strong> Keine Anmeldung, keine Tracker, keine Cloud-Calls. Alle Daten leben
          in deinem Browser. Export/Import kommt in einer späteren Version.
        </p>
        <p>
          <strong>Vier psychologische Frameworks</strong> im Coach: CBT, ACT, SDT, MI. Deterministisch, kein LLM-Call, keine
          Überraschungen. Der Coach ist kein Therapeut, nur ein Begleiter.
        </p>
        <p>
          <strong>Lebensmittel-Datenbank</strong> enthält 87 gebräuchliche Items aus dem deutschsprachigen Alltag
          (Protein, Carbs, Gemüse, Obst, Fette, Milchprodukte, Getränke, Snacks, zubereitete Gerichte). Werte aus
          Open Food Facts und USDA FoodData Central.
        </p>
      </div>
    </details>
  );
}
