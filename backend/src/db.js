// Lightweight JSON-file datastore with atomic writes.
// On Railway, attach a volume and set DATA_DIR to its mount path so data survives redeploys.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

const COLLECTIONS = [
  'users',
  'contributions',
  'verifications',
  'referrals',
  'enrollments',
  'messages',
  'schools',
  'passwordResets',
  'auditLog',
];

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

let state = {};
function load() {
  if (fs.existsSync(DB_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (err) {
      console.error('Could not parse db.json, starting fresh (backup kept).', err.message);
      fs.copyFileSync(DB_FILE, `${DB_FILE}.corrupt-${Date.now()}`);
      state = {};
    }
  }
  for (const c of COLLECTIONS) if (!Array.isArray(state[c])) state[c] = [];
}
load();

let writeTimer = null;
function persist() {
  clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, DB_FILE);
  }, 50);
}

export function flush() {
  clearTimeout(writeTimer);
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export const newId = (prefix = '') =>
  `${prefix}${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}`.toUpperCase();

export const db = {
  all: (c) => state[c],
  find: (c, fn) => state[c].find(fn),
  filter: (c, fn) => state[c].filter(fn),
  get: (c, id) => state[c].find((r) => r.id === id),
  insert(c, record) {
    const row = { id: record.id || newId(), createdAt: new Date().toISOString(), ...record };
    state[c].push(row);
    persist();
    return row;
  },
  update(c, id, patch) {
    const row = state[c].find((r) => r.id === id);
    if (!row) return null;
    Object.assign(row, patch, { updatedAt: new Date().toISOString() });
    persist();
    return row;
  },
  remove(c, id) {
    const i = state[c].findIndex((r) => r.id === id);
    if (i === -1) return false;
    state[c].splice(i, 1);
    persist();
    return true;
  },
};
