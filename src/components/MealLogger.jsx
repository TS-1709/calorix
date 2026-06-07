import React, { useMemo, useState } from 'react';
import { foodDb, searchFoods } from '../nutrition/foodDb.js';
import { resolvePortionGrams } from '../nutrition/portions.js';
import { estimateFromGrams, sumMacros } from '../nutrition/estimator.js';
import { Search, Plus, Trash2 } from 'lucide-react';

// MealLogger: search → pick food → describe portion → add to today's log.
export function MealLogger({ day, onAdd, onRemove }) {
  const [query, setQuery] = useState('');
  const [portionText, setPortionText] = useState('');
  const [active, setActive] = useState(null);

  const matches = useMemo(() => searchFoods(query, 8), [query]);

  const preview = useMemo(() => {
    if (!active) return null;
    const grams = resolvePortionGrams(portionText, active);
    return { grams, macros: estimateFromGrams(active, grams) };
  }, [active, portionText]);

  const totalMacros = useMemo(() => sumMacros((day.entries || []).map((e) => e.macros)), [day.entries]);

  const handleAdd = () => {
    if (!active || !preview) return;
    onAdd({
      id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      foodId: active.id,
      foodName: active.name,
      category: active.category,
      grams: preview.grams,
      portion: portionText || 'Standardportion',
      macros: preview.macros,
      ts: Date.now()
    });
    setQuery('');
    setPortionText('');
    setActive(null);
  };

  return (
    <section className="meal-logger panel">
      <header>
        <h2>Was hast du gegessen?</h2>
        <p>Suche, beschreibe die Portion, füge hinzu. Alles lokal, keine Cloud.</p>
      </header>

      <div className="meal-search">
        <label>
          <Search size={16} />
          <input
            type="search"
            placeholder="Lebensmittel suchen (z.B. Hähnchen, Reis, Apfel)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(null); }}
            aria-label="Lebensmittel suchen"
          />
        </label>
        {matches.length > 0 && !active && (
          <ul className="meal-suggestions" role="listbox">
            {matches.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => setActive(m)}>
                  <span className="suggestion-name">{m.name}</span>
                  <span className="suggestion-meta">{m.kcal} kcal · {Math.round(m.protein)}P · {Math.round(m.carb)}C · {Math.round(m.fat)}F pro 100g</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query.length > 0 && matches.length === 0 && (
          <p className="meal-empty">Nichts gefunden. Aktuell sind {foodDb.length} Lebensmittel gebündelt.</p>
        )}
      </div>

      {active && (
        <div className="portion-entry" role="group" aria-label="Portion wählen">
          <div className="portion-active">
            <span>{active.name}</span>
            <button type="button" onClick={() => setActive(null)} aria-label="Auswahl entfernen">×</button>
          </div>
          <label>
            <span>Portion</span>
            <input
              type="text"
              placeholder='z.B. "150g", "eine Hand voll", "⅓ Teller"'
              value={portionText}
              onChange={(e) => setPortionText(e.target.value)}
            />
          </label>
          {preview && (
            <div className="portion-preview" aria-live="polite">
              <strong>{preview.grams} g</strong>
              <span>· {preview.macros.kcal} kcal</span>
              <span>· {preview.macros.protein}g P</span>
              <span>· {preview.macros.carb}g C</span>
              <span>· {preview.macros.fat}g F</span>
            </div>
          )}
          <button type="button" className="button primary" onClick={handleAdd} disabled={!preview}>
            <Plus size={16} /> Hinzufügen
          </button>
        </div>
      )}

      {day.entries && day.entries.length > 0 && (
        <div className="meal-list">
          <h3>Heute erfasst</h3>
          <ul>
            {day.entries.map((e) => (
              <li key={e.id}>
                <div>
                  <strong>{e.foodName}</strong>
                  <span>{e.grams} g · {e.macros.kcal} kcal</span>
                </div>
                <button type="button" onClick={() => onRemove(e.id)} aria-label={`${e.foodName} entfernen`}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
          <div className="meal-list-total">
            <span>Heute gesamt</span>
            <strong>{totalMacros.kcal} kcal</strong>
            <span>{totalMacros.protein.toFixed(1)}g P</span>
            <span>{totalMacros.carb.toFixed(1)}g C</span>
            <span>{totalMacros.fat.toFixed(1)}g F</span>
          </div>
        </div>
      )}
    </section>
  );
}

export default MealLogger;
