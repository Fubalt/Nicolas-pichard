// e2e de la page /repliques (« Complète la réplique ») avec un faux YouTube.
// Usage : E2E_URL=http://localhost:3102 npm run e2e
import { createRequire } from 'node:module';
// Playwright n'est pas une dépendance du projet : on utilise celui de la machine (NODE_PATH).
const { chromium } = createRequire(import.meta.url)('playwright');
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = process.env.E2E_URL || 'http://localhost:3102';
const fake = readFileSync(fileURLToPath(new URL('./fake-yt.js', import.meta.url)), 'utf8');
const quotes = JSON.parse(readFileSync(fileURLToPath(new URL('../../src/data/classic-quotes.json', import.meta.url)), 'utf8'));
const results = [];
const test = async (name, fn) => {
  try { await fn(); results.push(['ok', name]); } catch (e) { results.push(['FAIL', name, e.message]); }
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(/youtube\.com|ytimg|googlevideo/, (r) => r.fulfill({ status: 200, body: '' }));
await ctx.addInitScript(fake);
const page = await ctx.newPage();
const norm = (s) => s.replace(/[\s  ]+/g, ' ').trim();
const waitPhase = (p, timeout = 10000) => page.waitForFunction(
  (p) => document.querySelector('[data-testid=quote-player]')?.dataset.phase === p, p, { timeout });
const player = page.getByTestId('quote-player');
const choices = page.locator('.bb-choice');

const open = async () => {
  await page.goto(`${BASE}/repliques`);
  await page.getByRole('button', { name: 'Lancer l’extrait' }).waitFor({ state: 'visible' });
  await page.waitForFunction(() => !document.querySelector('.bb-btn[disabled]') || true);
  await waitPhase('standby');
};
// Lance l'amorce et attend l'arrêt sur image (choix actifs).
const playSetup = async () => {
  await page.waitForTimeout(300); // laisse le lecteur se recaler sur la nouvelle réplique
  const phase = await player.getAttribute('data-phase');
  if (phase === 'standby') await page.getByRole('button', { name: 'Lancer l’extrait' }).click();
  await waitPhase('setup_paused');
  await page.waitForFunction(() => [...document.querySelectorAll('.bb-choice')].every((c) => !c.disabled));
};
// Retrouve la question affichée dans le JSON (par la phrase d'amorce).
const currentQuestion = async () => {
  const txt = norm(await page.locator('.bb-sub q').innerText());
  const q = quotes.find((x) => txt.startsWith(norm(x.setupPhrase)));
  assert.ok(q, `question introuvable dans le JSON : ${txt}`);
  return q;
};
const optionIndex = async (text) => {
  const n = await choices.count();
  for (let i = 0; i < n; i++) if (norm(await choices.nth(i).innerText()).endsWith(norm(text))) return i;
  throw new Error(`choix introuvable : ${text}`);
};
const answerGood = async () => {
  await playSetup();
  const q = await currentQuestion();
  const i = await optionIndex(q.correctPunchline);
  await choices.nth(i).click();
  await waitPhase('revealing');
  return i;
};
// Passe à la question suivante et attend que l'affichage ait changé de réplique.
const goNext = async () => {
  const label = await page.getByText(/^Réplique \d+ \/ \d+$/).first().innerText();
  await page.getByTestId('quote-next').click();
  await page.waitForFunction((l) => ![...document.querySelectorAll('*')].some((e) => e.children.length === 0 && e.textContent === l), label);
};
const result = async () => norm(await page.getByTestId('quote-result').innerText());

await open();

await test('bonne réponse : +1 000 pts et choix en « ok »', async () => {
  const i = await answerGood();
  assert.match(await result(), /^\+1 000 pts/);
  assert.match(await choices.nth(i).getAttribute('class'), /\bok\b/);
});

await test('mauvaise réponse : +0, choisi en « ko », bon en « ok »', async () => {
  await open();
  await playSetup();
  const q = await currentQuestion();
  const good = await optionIndex(q.correctPunchline);
  const bad = good === 0 ? 1 : 0;
  await choices.nth(bad).click();
  await waitPhase('revealing');
  assert.match(await result(), /^\+0 pt/);
  assert.match(await choices.nth(bad).getAttribute('class'), /\bko\b/);
  assert.match(await choices.nth(good).getAttribute('class'), /\bok\b/);
});

await test('combo : 1000, 1200, 1500 sur trois bonnes réponses', async () => {
  await open();
  const got = [];
  for (let k = 0; k < 3; k++) {
    await answerGood();
    got.push(Number((await result()).replace(/[^\d]/g, '').replace(/^\+/, '')));
    if (k < 2) {
      await goNext();
    }
  }
  assert.deepEqual(got, [1000, 1200, 1500]);
});

await test('session de 5 répliques : bilan avec le total', async () => {
  await open();
  await page.getByRole('tab', { name: '5 répliques' }).or(page.getByRole('button', { name: '5 répliques' })).first().click();
  await waitPhase('standby');
  for (let k = 0; k < 5; k++) {
    await playSetup();
    await choices.first().click();
    await waitPhase('revealing');
    if (k < 4) await goNext();
    else await page.getByTestId('quote-next').click();
  }
  const recap = page.getByTestId('quote-recap');
  await recap.waitFor({ timeout: 5000 });
  assert.match(norm(await recap.locator('.bb-score').innerText()), /^[\d ]+ pts$/);
  assert.match(norm(await recap.innerText()), /\/ 5 bonnes répliques/);
});

await test('erreur 150 : message affiché', async () => {
  await open();
  await page.evaluate(() => window.__yt.instance._error(150));
  await page.getByRole('alert').filter({ hasText: 'Cette vidéo ne peut pas être lue ici.' }).waitFor({ timeout: 3000 });
});

await browser.close();
for (const r of results) console.log(r.join(' — '));
process.exit(results.some((r) => r[0] === 'FAIL') ? 1 : 0);
