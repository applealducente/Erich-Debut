/* ===== GUEST LIST (Google Sheet is the single source of truth) =====
 *
 * Sheet columns on the FIRST tab: Number of Guests | Guest Name | Table Number
 * Edit the sheet and the site picks it up on the next page load.
 *
 * Load order in the browser:
 *   1. /api/guests  (Vercel function, fetches the sheet server side)
 *   2. Google Sheets directly (needs "Anyone with the link can view")
 *   3. Last good copy saved in this browser
 *
 * The same file also runs in Node (api/guests.js requires it for parsing).
 */
(function (root) {
  const SHEET_ID = '1NmHsc0HdhuiVzdJl8CdY0sHlW4-TqJyJVxYrnW8oWgs';
  const SHEET_EXPORT_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/export?format=csv';
  const SHEET_GVIZ_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv';
  const SHEET_EDIT_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit';
  const CACHE_KEY = 'erich_guest_cache_v2';

  /* ---------- name helpers ---------- */
  function norm(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Firebase-safe key built from the normalized name ("John Raven Cruz" -> "john-raven-cruz")
  function keyFor(name) {
    return norm(name).replace(/\s/g, '-');
  }

  /* ---------- CSV parsing ---------- */
  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;
    const src = String(text || '').replace(/^﻿/, '');

    for (let i = 0; i < src.length; i++) {
      const ch = src[i];
      if (inQuotes) {
        if (ch === '"') {
          if (src[i + 1] === '"') { cell += '"'; i++; }
          else inQuotes = false;
        } else {
          cell += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(cell); cell = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && src[i + 1] === '\n') i++;
        row.push(cell); cell = '';
        rows.push(row); row = [];
      } else {
        cell += ch;
      }
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  // Turn sheet rows into [{ name, table }]
  function parseGuests(csvText) {
    const rows = parseCsv(csvText);
    let nameCol = 1;
    let tableCol = 2;
    let headerRow = -1;

    for (let r = 0; r < Math.min(rows.length, 3); r++) {
      const cells = rows[r].map(norm);
      const n = cells.findIndex(c => c === 'guest name' || c === 'name');
      const t = cells.findIndex(c => c.startsWith('table'));
      if (n !== -1 && t !== -1) { nameCol = n; tableCol = t; headerRow = r; break; }
    }

    const guests = [];
    for (let r = headerRow + 1; r < rows.length; r++) {
      const name = String(rows[r][nameCol] || '').replace(/\s+/g, ' ').trim();
      const table = parseInt(String(rows[r][tableCol] || '').trim(), 10);
      if (name && table > 0) guests.push({ name, table });
    }
    return guests;
  }

  function findGuest(guests, typedName) {
    const target = norm(typedName);
    if (!target) return null;
    return guests.find(g => norm(g.name) === target) || null;
  }

  /* ---------- browser loading ---------- */
  async function fetchJsonGuests() {
    const res = await fetch('/api/guests', { cache: 'no-store' });
    if (!res.ok) throw new Error('api ' + res.status);
    const data = await res.json();
    if (!data || !Array.isArray(data.guests) || !data.guests.length) throw new Error('api empty');
    return data.guests;
  }

  async function fetchSheetDirect() {
    const res = await fetch(SHEET_GVIZ_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('sheet ' + res.status);
    const guests = parseGuests(await res.text());
    if (!guests.length) throw new Error('sheet empty');
    return guests;
  }

  function readCache() {
    try {
      const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      return saved && Array.isArray(saved.guests) && saved.guests.length ? saved : null;
    } catch (err) { return null; }
  }

  function writeCache(guests) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ guests, savedAt: new Date().toISOString() })); }
    catch (err) { /* storage unavailable, ignore */ }
  }

  // Returns { guests, source: 'api' | 'sheet' | 'cache' | 'none' }
  async function loadGuests() {
    for (const [source, fn] of [['api', fetchJsonGuests], ['sheet', fetchSheetDirect]]) {
      try {
        const guests = await fn();
        writeCache(guests);
        return { guests, source };
      } catch (err) {
        console.warn('Guest list source failed:', source, err.message);
      }
    }
    const cached = readCache();
    if (cached) return { guests: cached.guests, source: 'cache' };
    return { guests: [], source: 'none' };
  }

  function groupByTable(guests) {
    const tables = new Map();
    guests.forEach(g => {
      if (!tables.has(g.table)) tables.set(g.table, []);
      tables.get(g.table).push(g);
    });
    return [...tables.entries()].sort((a, b) => a[0] - b[0]);
  }

  const api = {
    SHEET_EDIT_URL, SHEET_EXPORT_URL,
    norm, keyFor, parseCsv, parseGuests, findGuest, loadGuests, groupByTable
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Guests = api;
})(typeof window !== 'undefined' ? window : globalThis);
