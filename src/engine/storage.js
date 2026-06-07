// Local storage wrappers. Every function is defensive against quota
// errors and corrupted JSON. Nothing leaves the device.

const PREFIX = 'calorix:';

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function readString(key, fallback = '') {
  try {
    return localStorage.getItem(PREFIX + key) || fallback;
  } catch {
    return fallback;
  }
}

export function writeString(key, value) {
  try {
    localStorage.setItem(PREFIX + key, value);
    return true;
  } catch {
    return false;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

// Date-keyed helpers. Date is local YYYY-MM-DD.
export function todayKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function loadDay(key = todayKey()) {
  return readJSON(`day:${key}`, { entries: [] });
}

export function saveDay(key, value) {
  return writeJSON(`day:${key}`, value);
}

export function listDayKeys() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX + 'day:')) out.push(k.slice((PREFIX + 'day:').length));
  }
  return out.sort();
}

export function streakFromKeys(keys) {
  if (!keys.length) return 0;
  const set = new Set(keys);
  let count = 0;
  const d = new Date();
  for (;;) {
    const k = todayKey(d);
    if (set.has(k)) {
      count++;
      d.setDate(d.getDate() - 1);
    } else {
      // allow today not yet logged
      if (count === 0 && k === todayKey(new Date())) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return count;
}
