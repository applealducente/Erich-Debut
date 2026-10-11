/* ===== GUEST LIST (Google Sheet is the single source of truth) =====
 *
 * Sheet columns on the FIRST tab: Number of Guests | Guest Name | Table Number
 * Edit the sheet and the site picks it up on the next page load.
 * The "18's" tab (Roses, Treasures, Blue Bills, Candles, Cotillion) is read the same way.
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
  // The "18's" tab (Roses, Treasures, Blue Bills, Candles, Cotillion)
  const ROLES_GID = '1937863515';
  const ROLES_EXPORT_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/export?format=csv&gid=' + ROLES_GID;
  const ROLES_GVIZ_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:csv&gid=' + ROLES_GID;
  const ROLES_CACHE_KEY = 'erich_roles_cache_v1';

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


  /* ---------- the 18's tab ---------- */
  // Cells look like "13. Alvin Sto. Domingo" or "16. Aislinn Laxamana(online)"; Cotillion cells are "A & B".
  function cleanRoleCell(cell) {
    const raw = String(cell || '');
    const online = /\(\s*online\s*\)/i.test(raw);
    const name = raw
      .replace(/\(\s*online\s*\)/ig, '')
      .replace(/^\s*\d+\s*[.)]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
    return { name, online };
  }

  // Returns { roses, treasures, blueBills, candles, cotillion: [[a, b]], online: [names] } or null if the tab is unreadable
  function parseRoles(csvText) {
    const rows = parseCsv(csvText);
    const wanted = { roses: /roses/, treasures: /treasures/, blueBills: /blue\s*bills/, candles: /candles/, cotillion: /cot+il+ion/ };
    let headerRow = -1;
    const cols = {};
    for (let r = 0; r < Math.min(rows.length, 3); r++) {
      const cells = rows[r].map(norm);
      const found = {};
      Object.entries(wanted).forEach(([key, re]) => {
        const i = cells.findIndex(c => re.test(c));
        if (i !== -1) found[key] = i;
      });
      if (Object.keys(found).length >= 4) { headerRow = r; Object.assign(cols, found); break; }
    }
    if (headerRow === -1) return null;

    const out = { roses: [], treasures: [], blueBills: [], candles: [], cotillion: [], online: [] };
    for (let r = headerRow + 1; r < rows.length; r++) {
      ['roses', 'treasures', 'blueBills', 'candles'].forEach(key => {
        if (cols[key] === undefined) return;
        const { name, online } = cleanRoleCell(rows[r][cols[key]]);
        if (!name) return;
        out[key].push(name);
        if (online) out.online.push(name);
      });
      if (cols.cotillion !== undefined) {
        const cell = String(rows[r][cols.cotillion] || '');
        const pair = cell.split('&').map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
        if (pair.length === 2) out.cotillion.push(pair);
      }
    }
    // A half-empty result means we read the wrong tab or a sign-in page
    if (!out.roses.length || !out.treasures.length || !out.blueBills.length || !out.candles.length) return null;
    return out;
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


  async function fetchJsonRoles() {
    const res = await fetch('/api/roles', { cache: 'no-store' });
    if (!res.ok) throw new Error('api ' + res.status);
    const data = await res.json();
    if (!data || !data.roles || !data.roles.roses) throw new Error('api empty');
    return data.roles;
  }

  async function fetchRolesDirect() {
    const res = await fetch(ROLES_GVIZ_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('sheet ' + res.status);
    const roles = parseRoles(await res.text());
    if (!roles) throw new Error('sheet empty');
    return roles;
  }

  // Returns { roles, source: 'api' | 'sheet' | 'cache' | 'none' }. roles is null when nothing could be read,
  // and the page keeps the lists that are built into it.
  async function loadRoles() {
    for (const [source, fn] of [['api', fetchJsonRoles], ['sheet', fetchRolesDirect]]) {
      try {
        const roles = await fn();
        try { localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify({ roles, savedAt: new Date().toISOString() })); } catch (err) { /* ignore */ }
        return { roles, source };
      } catch (err) {
        console.warn('18s source failed:', source, err.message);
      }
    }
    try {
      const saved = JSON.parse(localStorage.getItem(ROLES_CACHE_KEY) || 'null');
      if (saved && saved.roles && saved.roles.roses) return { roles: saved.roles, source: 'cache' };
    } catch (err) { /* ignore */ }
    return { roles: null, source: 'none' };
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
    SHEET_EDIT_URL, SHEET_EXPORT_URL, ROLES_EXPORT_URL,
    norm, keyFor, parseCsv, parseGuests, parseRoles, findGuest, loadGuests, loadRoles, groupByTable
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Guests = api;
})(typeof window !== 'undefined' ? window : globalThis);
