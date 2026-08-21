/* Generate a replacement for the slide 1 "rocket" layer: a paper aeroplane
 * climbing out of a ribbon of loose pages.
 *
 *   node tools/generate-plane.mjs [runs]      # -> tools/.plane-raw/plane-N.png
 *
 * One connected composition, not a scattered scene — this layer replaces a
 * single element in the hero, so tools/cutout.py keys the cream ground and
 * keeps the whole thing as one cut-out.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT  = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const RAW   = path.join(ROOT, 'tools', '.plane-raw');
const HOST  = 'http://127.0.0.1:4321';
const TOKEN = process.env.GEMINI_STUDIO_TOKEN
  || (fs.existsSync(path.join(ROOT, 'tools', '.token'))
        ? fs.readFileSync(path.join(ROOT, 'tools', '.token'), 'utf8').trim() : '');
if (!TOKEN) { console.error('No studio token — put it in tools/.token'); process.exit(1); }
const H = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const SUBJECT = [
  'A single paper aeroplane folded from a page of a book, seen from the side,',
  'tilted about thirty degrees and climbing upward towards the top right corner.',
  'Behind and below it a long soft ribbon of loose book pages and gentle swirling',
  'wind curls down and away to the lower left, like a trail it has just flown along,',
  'and one small closed book tumbles at the lower end of that trail.',
  'The aeroplane, the page ribbon and the book form ONE single connected diagonal',
  'composition rising from the lower left to the upper right.'
].join(' ');

const STYLE = [
  'Soft watercolour and gouache childrens-book illustration, flat 2D, hand-painted texture,',
  'delicate ink line work, visible paper grain.',
  'Palette: dusty violet #9785B9, soft blush pink #F8BBD7, sage and teal greens, warm sand,',
  'muted slate blue, small warm-yellow accents. Gentle, dreamy, optimistic.',
  'CRITICAL: flat plain uniform cream background #FDF4EF with absolutely no gradient,',
  'no vignette, no cast shadows, no ground plane and no haze.',
  'Leave a wide clear cream margin around the whole composition so nothing touches the edges.',
  'Absolutely no text, no letters, no words, no numbers, no logo, no signature. No human figures.',
  'Vertical portrait 3:4 composition.'
].join(' ');

const RUNS = Number(process.argv[2] || 4);

async function api(p, body) {
  const r = await fetch(HOST + p, body ? { method: 'POST', headers: H, body: JSON.stringify(body) } : { headers: H });
  if (!r.ok) throw new Error(p + ' -> ' + r.status);
  return r.json();
}

const PROMPT = `${SUBJECT} ${STYLE}`;

async function main() {
  fs.mkdirSync(RAW, { recursive: true });
  try { await api('/api/state'); }
  catch { console.error('Studio not running. Start "Start Dashboard.cmd".'); process.exit(1); }

  await api('/api/generate', { prompt: PROMPT, mode: 'image', model: 'Flash', runs: RUNS, threadId: null, attach: [] });
  console.log(`Queued ${RUNS} variant(s).`);

  process.stdout.write('Waiting');
  for (;;) {
    await sleep(5000);
    const s = await api('/api/state');
    process.stdout.write('.');
    if (!s.jobs.some(j => j.status === 'queued' || j.status === 'running')) break;
  }
  console.log('');

  const s = await api('/api/state');
  s.jobs.filter(j => j.status === 'failed').forEach(j => console.error('  FAILED:', j.error));

  /* match by prompt, newest first — never by job order */
  const needle = SUBJECT.slice(0, 40);
  const hits = [...s.library].sort((a, b) => b.createdAt - a.createdAt)
                             .filter(i => i.prompt && i.prompt.indexOf(needle) === 0).slice(0, RUNS);
  if (!hits.length) { console.log('no image came back'); return; }
  for (let n = 0; n < hits.length; n++) {
    const r = await fetch(HOST + '/images/' + hits[n].file, { headers: H });
    if (!r.ok) continue;
    const dest = path.join(RAW, `plane-${n + 1}.png`);
    fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
    console.log('  saved', path.relative(ROOT, dest), hits[n].w + 'x' + hits[n].h);
  }
  console.log('\nPick the best, then: py tools/cutout.py tools/.plane-raw/plane-N.png assets/layers/layer-plane.webp');
}

main().catch(e => { console.error(e); process.exit(1); });
