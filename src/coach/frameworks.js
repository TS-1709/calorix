// Psychological frameworks used by the Coach engine.
// Each framework is a real, peer-grounded approach. We use them as lenses
// for the user's current state to pick a tone that fits — not as
// therapy, not as diagnosis. The coach never prescribes treatment.
//
// References (the user is encouraged to read the originals):
//   CBT: Beck, A.T. (1976) Cognitive Therapy and the Emotional Disorders
//   ACT: Hayes, S.C. et al. (1999) Acceptance and Commitment Therapy
//   SDT: Deci, E.L. & Ryan, R.M. (2000) Self-Determination Theory
//   MI:  Miller, W.R. & Rollnick, S. (1991) Motivational Interviewing

export const FRAMEWORKS = {
  cbt: {
    id: 'cbt',
    name: 'Kognitive Umstrukturierung',
    shortName: 'CBT',
    description: 'Gedanken als Hypothesen, nicht als Wahrheiten behandeln.',
    citation: 'Beck, 1976'
  },
  act: {
    id: 'act',
    name: 'Akzeptanz & Werte',
    shortName: 'ACT',
    description: 'Schwieriges annehmen, in Richtung eigener Werte handeln.',
    citation: 'Hayes et al., 1999'
  },
  sdt: {
    id: 'sdt',
    name: 'Selbstbestimmung',
    shortName: 'SDT',
    description: 'Autonomie, Kompetenz, Verbundenheit als drei Grundbedürfnisse.',
    citation: 'Deci & Ryan, 2000'
  },
  mi: {
    id: 'mi',
    name: 'Motivierende Gesprächsführung',
    shortName: 'MI',
    description: 'Offene Fragen, Change Talk evozieren, keine Direktivität.',
    citation: 'Miller & Rollnick, 1991'
  }
};

// Templates per framework and user state. Each template is a function
// that receives the user state and returns the message text. The engine
// picks one framework per day using a small rule + rotation.
//
// IMPORTANT: Keep these short, non-prescriptive, and never claim
// therapeutic effect. The coach is a thoughtful companion, not a
// therapist.

const T = {
  cbt: {
    stable: [
      ({ macros, target }) => `Heute war im Plan. Was war der Gedanke, der dich am längsten bei der Stange gehalten hat?`,
      ({ streak }) => `Tag ${streak} stabil. Welche Erwartung hast du an dich selbst, die du heute überprüfen könntest?`,
      () => `Gedanken sind keine Befehle. Wenn du heute etwas hartnäckig Wiederholtes gedacht hast, schreib es auf, dann lies es als Hypothese.`
    ],
    over: [
      ({ overKcal }) => `${overKcal} kcal über dem Ziel. Kein Drama, aber: welcher Gedanke hat den Auslöser gegeben? Hunger, Stress, Gewohnheit?`,
      () => `Über dem Ziel zu landen ist Information, nicht Versagen. Was war die Geschichte, die das Essen "verdient" gemacht hat?`
    ],
    under: [
      () => `Unter dem Ziel heißt nicht automatisch Erfolg. Wie war dein Energielevel, dein Hunger, deine Stimmung?`,
      () => `Weniger essen fühlt sich oft wie Disziplin an. Was war heute die Kosten-Nutzen-Rechnung in deinem Kopf?`
    ],
    low_mood: [
      () => `Schwere Tage sind nicht das Problem. Die Bewertung "ich habe versagt" wäre eins. Was sagt der innere Richter, und was sagt der Rest?`,
      () => `Wenn der Tag dunkel ist, ist eine ausgewogene Mahlzeit eine kleine Form von Selbstfürsorge, nicht "Diät". Was ist heute drin?`
    ]
  },
  act: {
    stable: [
      ({ streak }) => `${streak} Tage bewusst. Welcher Wert steht dahinter, der größer ist als nur "gesund essen"?`,
      () => `Akzeptanz heißt nicht aufgeben. Es heißt, den heutigen Tag so anzunehmen, wie er war, und morgen in Richtung eines Werts zu handeln, der dir wichtig ist.`,
      () => `Was hast du heute getan, das in Richtung eines Werts ging, der nichts mit Kalorien zu tun hat?`
    ],
    over: [
      () => `Der Wert, der das Essen ausgelöst hat, ist real. Welcher? Wärme, Trost, Verbindung, Belohnung. Was wäre ein alternativer Weg zu diesem Wert heute Abend?`,
      ({ overKcal }) => `Über dem Plan: nicht das Ziel war das Problem, sondern der Wert, der stärker war. Welcher?`
    ],
    under: [
      () => `Weniger zu essen, wenn der Körper mehr braucht, ist Vermeidung, keine Werte-Handlung. Wie war dein körperliches Signal heute?`
    ],
    low_mood: [
      () => `Schwermut ist ein Gefühl, kein Versagen. Welche kleine Handlung wäre heute möglich, auch wenn das Gefühl bleibt?`,
      () => `Werte sind nicht an Stimmung gekoppelt. Was ist heute ein Wert, der nichts mit Leistung zu tun hat?`
    ]
  },
  sdt: {
    stable: [
      ({ streak }) => `${streak} Tage in Folge, weil du es wolltest, nicht weil du musstest. Das ist der Unterschied.`,
      () => `Autonomie: du wählst, was du isst. Kompetenz: du liest Muster. Verbundenheit: mit dir selbst ehrlich sein. Welche der drei braucht heute am meisten Aufmerksamkeit?`
    ],
    over: [
      () => `Druck von außen macht das Essen zur Pflicht. Wer hat heute mitgemischt — Kalorienziel, App, innere Stimme? Was wäre die ehrlichere Wahl gewesen?`
    ],
    under: [
      () => `Kompetenz zeigt sich auch darin, Hunger zu spüren und darauf zu antworten, nicht ihn zu unterdrücken. Wie war das heute?`
    ],
    low_mood: [
      () => `Verbundenheit fängt bei dir an. Wie redest du heute mit dir über das, was du gegessen hast? Hartes Urteil oder Mitarbeiter?`
    ]
  },
  mi: {
    stable: [
      () => `Auf einer Skala von 0-10: wie wichtig ist dir gerade, was du hier trackst? Was würde die Zahl um einen Punkt nach oben bringen?`,
      () => `Was funktioniert gerade, das du beibehalten willst? Erzähl mir konkret.`
    ],
    over: [
      () => `Was müsste passieren, damit morgen anders aussieht? Eine konkrete Änderung, die du dir zutraust.`,
      () => `Wenn ein Freund dir erzählen würde, was du heute gegessen hast, was würdest du ihm raten?`
    ],
    under: [
      () => `Was hindert dich gerade daran, auf dein Hungersignal zu hören? Ist es eine Regel, ein Gedanke, eine Gewohnheit?`
    ],
    low_mood: [
      () => `Was wäre ein winziger Schritt, der heute möglich wäre? Nicht morgen, nicht nächste Woche. Heute.`,
      () => `Wenn du dir selbst gerade zuhören würdest — was sagt die leise Stimme unter dem Lärm?`
    ]
  }
};

export function getTemplate(frameworkId, state) {
  const f = T[frameworkId];
  if (!f) return null;
  // Pick the most relevant state bucket
  let bucket = 'stable';
  if (state.low_mood) bucket = 'low_mood';
  else if (state.overKcal > 200) bucket = 'over';
  else if (state.underKcal < -400) bucket = 'under';
  const pool = f[bucket] || f.stable;
  // Deterministic pick by date — same day → same message
  const idx = state.dayIndex % pool.length;
  return pool[idx];
}
