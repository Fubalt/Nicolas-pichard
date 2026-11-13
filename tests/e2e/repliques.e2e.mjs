// e2e du mode Répliques sur le moteur de lecture, avec un faux YouTube.
// Usage : npm run build && npx next start -p 3102 & ; E2E_URL=http://localhost:3102 npm run e2e
import { createRequire } from 'node:module';
// Playwright n'est pas une dépendance du projet : on utilise celui de la machine (NODE_PATH).
const { chromium } = createRequire(import.meta.url)('playwright');
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = process.env.E2E_URL || 'http://localhost:3102';
const fake = readFileSync(fileURLToPath(new URL('./fake-yt.js', import.meta.url)), 'utf8');
const results = [];
const test = async (name, fn) => {
  try { await fn(); results.push(['ok', name]); } catch (e) { results.push(['FAIL', name, e.message]); }
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(/youtube\.com|ytimg|googlevideo/, (r) => r.fulfill({ status: 200, body: '' }));
await ctx.addInitScript(fake);
const page = await ctx.newPage();
const player = page.getByTestId('quote-player');
const waitPhase = (p, timeout = 10000) => page.waitForFunction(
  (p) => document.querySelector('[data-testid=quote-player]')?.dataset.phase === p, p, { timeout });
const lastPause = () => page.evaluate(() => window.__yt.calls.filter((c) => c[0] === 'pause').at(-1)?.[1]);

await page.goto(BASE);
await page.getByRole('button', { name: /Répliques/ }).first().click();
await page.getByRole('button', { name: 'Lancer l’extrait' }).waitFor({ state: 'visible' });
await page.waitForFunction(() => !document.querySelector('[data-testid=quote-player] button')?.disabled);

await test('rien n’est superposé au lecteur', async () => {
  const overlap = await page.evaluate(() => {
    const f = document.querySelector('[data-testid=quote-player] iframe');
    const r = f.getBoundingClientRect();
    const pts = [[0.5, 0.5], [0.1, 0.1], [0.9, 0.9], [0.1, 0.9], [0.9, 0.1]];
    return pts.filter(([x, y]) => document.elementFromPoint(r.left + r.width * x, r.top + r.height * y) !== f).length;
  });
  assert.equal(overlap, 0);
  const pe = await page.evaluate(() => getComputedStyle(document.querySelector('[data-testid=quote-player] iframe')).pointerEvents);
  assert.notEqual(pe, 'none');
});

let cutAt;
await test('l’amorce est coupée à pauseTime (temps vidéo)', async () => {
  cutAt = Number(await player.getAttribute('data-cut-at'));
  await page.getByRole('button', { name: 'Lancer l’extrait' }).click();
  await waitPhase('setup_paused');
  const t = await lastPause();
  assert.ok(t >= cutAt, `coupé trop tôt : ${t} < ${cutAt}`);
  assert.ok(t - cutAt < 0.12, `coupé trop tard : ${(t - cutAt).toFixed(3)} s après pauseTime`);
});

await test('un clic dans le lecteur en attente rejoue l’amorce (pas la suite)', async () => {
  await page.evaluate(() => window.__yt.instance.playVideo());
  await waitPhase('setup_playing');
  const seekBack = await page.evaluate(() => window.__yt.calls.filter((c) => c[0] === 'seek').at(-1)[1]);
  assert.ok(seekBack < cutAt);
  await waitPhase('setup_paused');
});

await test('la révélation continue après pauseTime', async () => {
  const options = page.locator('button[type=button]:not([disabled])').filter({ has: page.locator('div.rounded-xl') });
  await options.first().click();
  await waitPhase('revealing');
  await page.waitForTimeout(1500);
  const t = await page.evaluate(() => window.__yt.instance.t);
  assert.ok(t > cutAt + 1, `la vidéo devrait continuer (t=${t}, cut=${cutAt})`);
});

await test('question suivante : même lecteur réutilisé (cue, pas de recréation)', async () => {
  const playersBefore = await page.evaluate(() => window.__yt.players); // inclut le lecteur du Solo
  const cuesBefore = await page.evaluate(() => window.__yt.calls.filter((c) => c[0] === 'cue').length);
  await page.getByRole('button', { name: /Réplique suivante/ }).click();
  await waitPhase('standby');
  await page.waitForTimeout(200);
  const { players, cues } = await page.evaluate(() => ({ players: window.__yt.players, cues: window.__yt.calls.filter((c) => c[0] === 'cue').length }));
  assert.equal(players, playersBefore);
  assert.ok(cues > cuesBefore);
});

await test('« terminé » inattendu : rechargement avant la lecture suivante', async () => {
  await page.evaluate(() => { const p = window.__yt.instance; p.s = 0; p.o.events.onStateChange({ data: 0, target: p }); });
  const cuesBefore = await page.evaluate(() => window.__yt.calls.filter((c) => c[0] === 'cue').length);
  await page.getByRole('button', { name: 'Lancer l’extrait' }).click();
  await waitPhase('setup_paused');
  const cues = await page.evaluate(() => window.__yt.calls.filter((c) => c[0] === 'cue').length);
  assert.equal(cues, cuesBefore + 1);
});

await test('erreur 150 : message affiché', async () => {
  await page.evaluate(() => window.__yt.instance._error(150));
  await page.getByText('Cette vidéo ne peut pas être lue ici.').waitFor({ timeout: 3000 });
});

await browser.close();
for (const r of results) console.log(r.join(' — '));
process.exit(results.some((r) => r[0] === 'FAIL') ? 1 : 0);
