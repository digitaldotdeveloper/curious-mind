/* Generate the slide 2 and slide 3 hero scenes with Gemini.
 *
 *   node tools/generate-hero-scenes.mjs            # both, 2 variants each
 *   node tools/generate-hero-scenes.mjs shelf      # just one
 *
 * These are generated as ONE scene per slide, in the same visual language as the
 * slide 1 illustration, then cut into animatable layers by tools/segment-scene.py.
 * The prompt asks for clearly separated elements on a flat cream ground precisely
 * so that the segmentation finds distinct components instead of one fused blob.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT  = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const RAW   = path.join(ROOT, 'tools', '.scenes-raw');
const HOST  = 'http://127.0.0.1:4321';
const TOKEN = process.env.GEMINI_STUDIO_TOKEN
  || (fs.existsSync(path.join(ROOT, 'tools', '.token'))
        ? fs.readFileSync(path.join(ROOT, 'tools', '.token'), 'utf8').trim() : '');
if (!TOKEN) { console.error('No studio token — put it in tools/.token'); process.exit(1); }
const H = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN };
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* The visual language of the existing hero illustration. */
const STYLE = [
  'Soft watercolour and gouache childrens-book illustration, flat 2D, hand-painted texture,',
  'delicate ink line work, visible paper grain.',
  'Palette: dusty violet #9785B9, soft blush pink #F8BBD7, sage and teal greens, warm sand,',
  'muted slate blue, small warm-yellow accents. Gentle, dreamy, optimistic.',
  'CRITICAL COMPOSITION RULES:',
  'place every object with clear empty space around it so nothing overlaps or touches;',
  'spread the objects across the canvas rather than clustering them;',
  'flat plain uniform cream background #FDF4EF with absolutely no gradient, no vignette,',
  'no cast shadows, no ground plane and no connecting haze between objects.',
  'Absolutely no text, no letters, no words, no numbers, no logo, no signature.',
  'No human faces. Wide horizontal 16:9 composition.'
].join(' ');

const SCENES = {
  shelf: [
    'A magical floating library: one long wooden bookshelf drifting in mid-air in the centre,',
    'its books lifting off and floating freely outward — six or seven separate books at different',
    'angles spread widely across the picture, some open with pages fanning, some closed.',
    'A paper aeroplane folded from a page, a small brass reading lamp, a pair of round spectacles,',
    'a few loose drifting pages and small stars scattered in the empty spaces between them.'
  ].join(' '),

  chapter: [
    'A large open book lying flat in the centre with its pages fanned, and rising out of it,',
    'well separated and floating freely upward across the canvas: a small lighthouse on a rock,',
    'a paper boat, a whale arcing, a crescent moon, a tiny house with a lit window,',
    'a flock of three birds, and a handful of small stars — each object surrounded by empty',
    'cream space so none of them touch or overlap.'
  ].join(' ')
};

async function api(p, body) {
  const r = await fetch(HOST + p, body ? { method: 'POST', headers: H, body: JSON.stringify(body) } : { headers: H });
  if (!r.ok) throw new Error(p + ' -> ' + r.status);
  return r.json();
}

const RUNS = 2;

async function main() {
  const only = process.argv.slice(2);
  const keys = Object.keys(SCENES).filter(k => !only.length || only.includes(k));
  fs.mkdirSync(RAW, { recursive: true });

  let s0;
  try { s0 = await api('/api/state'); }
  catch { console.error('Studio not running. Start "Start Dashboard.cmd".'); process.exit(1); }

  console.log(`Queueing ${keys.length} scene(s) x ${RUNS} variants…`);
  for (const k of keys) {
    await api('/api/generate', {
      prompt: `${SCENES[k]} ${STYLE}`,
      mode: 'image', model: 'Flash', runs: RUNS, threadId: null, attach: []
    });
    console.log('  queued', k);
    await sleep(400);
  }

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
  const lib = [...s.library].sort((a, b) => b.createdAt - a.createdAt);
  for (const k of keys) {
    const needle = SCENES[k].slice(0, 40);
    const hits = lib.filter(i => i.prompt && i.prompt.indexOf(needle) === 0).slice(0, RUNS);
    if (!hits.length) { console.log('  no image for', k); continue; }
    for (let n = 0; n < hits.length; n++) {
      const r = await fetch(HOST + '/images/' + hits[n].file, { headers: H });
      if (!r.ok) continue;
      const dest = path.join(RAW, `${k}-${n + 1}.png`);
      fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
      console.log('  saved', path.relative(ROOT, dest), hits[n].w + 'x' + hits[n].h);
    }
  }
  console.log('\nPick the best of each, then: py tools/segment-scene.py <name> <file>');
}

main().catch(e => { console.error(e); process.exit(1); });
