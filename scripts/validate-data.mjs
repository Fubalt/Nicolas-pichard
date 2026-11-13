#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf-8'));
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const isNum = (n) => typeof n === 'number' && Number.isFinite(n);

// Videos
const videos = load('data/cyprien-videos.json');
const ID_RE = /^[A-Za-z0-9_-]{11}$/;
if (!Array.isArray(videos)) err('videos: not an array');
else {
  if (videos.length !== 205) err(`videos: expected 205, got ${videos.length}`);
  const seen = new Set();
  videos.forEach((v, i) => {
    if (typeof v.id !== 'string' || !ID_RE.test(v.id)) err(`videos[${i}]: invalid id ${JSON.stringify(v.id)}`);
    else if (seen.has(v.id)) err(`videos[${i}]: duplicate id ${v.id}`);
    seen.add(v.id);
    if (typeof v.title !== 'string' || !v.title.trim()) err(`videos[${i}] ${v.id}: empty title`);
    for (const k of ['duration', 'durationInSeconds'])
      if (k in v && !(isNum(v[k]) && v[k] >= 0)) err(`videos[${i}] ${v.id}: bad ${k} ${v[k]}`);
  });
}
const byId = new Map((videos || []).map((v) => [v.id, v]));

// Catalog meta
const meta = load('data/catalog-meta.json');
const classic = Array.isArray(meta.classic) ? meta.classic : (err('catalog-meta: classic not an array'), []);
const cs = new Set();
for (const id of classic) {
  if (cs.has(id)) err(`catalog-meta: duplicate classic id ${id}`);
  cs.add(id);
  if (!byId.has(id)) err(`catalog-meta: classic id ${id} not in videos`);
}

// Quotes
const quotes = load('src/data/classic-quotes.json');
if (quotes.length !== 520) err(`quotes: expected 520, got ${quotes.length}`);
const qids = new Set();
const vids = new Set();
const missing = new Map();
quotes.forEach((q, i) => {
  const t = `quotes[${i}] ${q.id}`;
  if (!q.id) err(`quotes[${i}]: missing id`);
  else if (qids.has(q.id)) err(`${t}: duplicate id`);
  qids.add(q.id);
  vids.add(q.videoId);
  const v = byId.get(q.videoId);
  if (!v) missing.set(q.videoId, (missing.get(q.videoId) || 0) + 1);
  if (!isNum(q.startTime) || !isNum(q.pauseTime)) err(`${t}: non-numeric start/pause`);
  else {
    if (!(q.startTime < q.pauseTime)) err(`${t}: start ${q.startTime} >= pause ${q.pauseTime}`);
    const d = v && (v.durationInSeconds ?? v.duration);
    if (d && q.pauseTime > d) err(`${t}: pause ${q.pauseTime} > duration ${d}`);
  }
  if (!Array.isArray(q.options)) err(`${t}: options not an array`);
  else if (!q.options.includes(q.correctPunchline)) err(`${t}: options lack correctPunchline`);
});
if (vids.size !== 73) err(`quotes: expected 73 distinct videoIds, got ${vids.size}`);
for (const [id, n] of missing) warn(`quotes: videoId ${id} not in video catalog (${n} quotes)`);

console.log(`videos: ${videos.length} | classic: ${classic.length} | quotes: ${quotes.length} (${vids.size} videos)`);
warnings.forEach((w) => console.log('WARNING ' + w));
if (errors.length) {
  errors.forEach((e) => console.log('ERROR ' + e));
  console.log(`FAILED (${errors.length} errors, ${warnings.length} warnings)`);
  process.exit(1);
}
console.log(`OK (${warnings.length} warnings)`);
