/* Generate the 12 book covers with Gemini, via the local Gemini Studio.
 *
 *   1. Start the studio:  "Gemini Prompt Sender/dashboard/Start Dashboard.cmd"
 *   2. Open http://127.0.0.1:4321 and click "Sign in to Google" once
 *      (the studio drives its own Chrome profile, which starts signed out).
 *   3. node tools/generate-covers.mjs            — all twelve
 *      node tools/generate-covers.mjs small-hours the-long-attention   — just these
 *
 * Covers land in tools/.covers-raw, then py tools/covers-to-webp.py
 * shrinks them into assets/covers/<id>.webp. The site picks them up automatically:
 * CM.coverHTML() uses the image when one exists and falls back to the drawn
 * cover when it doesn't, so a partial run is fine.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT   = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT    = path.join(ROOT, 'assets', 'covers');
const HOST   = 'http://127.0.0.1:4321';
const TOKEN  = process.env.GEMINI_STUDIO_TOKEN
  || (fs.existsSync(path.join(ROOT, 'tools', '.token'))
        ? fs.readFileSync(path.join(ROOT, 'tools', '.token'), 'utf8').trim()
        : '');
if (!TOKEN) {
  console.error('No studio token. Put it in tools/.token (gitignored), or set GEMINI_STUDIO_TOKEN.');
  process.exit(1);
}
const H      = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN };
const sleep  = ms => new Promise(r => setTimeout(r, ms));

/* House style — every cover shares it so the shelf reads as one shop. */
const STYLE = [
  'Book cover artwork in a soft watercolour and gouache editorial style.',
  'Muted pastel palette: dusty violet #9785B9, soft blush pink #F8BBD7, warm cream #FFFBFE,',
  'quiet grey #7A7D7D, with one restrained accent colour.',
  'Flat 2D illustration, visible paper grain, delicate line work, generous negative space,',
  'calm and contemplative mood, nothing photographic, no 3D render.',
  'IMPORTANT: absolutely no text, no letters, no words, no title, no author name,',
  'no logo and no signature anywhere in the image. No human faces.',
  'Vertical 2:3 portrait composition, the subject sitting low so the upper third stays quiet.'
].join(' ');

/* One line of subject matter per book. */
const SUBJECTS = {
  'the-long-attention':          'A still, empty reading room: one armchair, a tall window, a shaft of light full of dust motes, and a bare wall where a clock used to hang.',
  'soft-machinery':              'An old brass-and-tin weather machine standing in a small courtyard, with strange hand-painted clouds gathering above it.',
  'notes-on-not-knowing':        'A single open drawer in a plain wooden desk, entirely empty, lit softly from above.',
  'a-field-guide-to-doubt':      'A naturalist field-guide plate of small grey imaginary birds perched on a bare branch, arranged like specimens.',
  'everything-is-a-draft':       'A loose stack of overlapping paper drafts, corners curling, one sheet lifting slightly as if caught in a draught.',
  'small-hours':                 'A dark kitchen at three in the morning, lit only by the open fridge, a long quiet rectangle of light on the floor.',
  'the-quiet-corner':            'A cosy corner of a room where mismatched books are stacked on the floor beside a low lamp and a worn rug.',
  'the-cartographers-apology':   'An old nautical survey map with a comma-shaped bay drawn on a coastline, a compass rose in one corner.',
  'against-efficiency':          'A single antique stopwatch resting on a workshop bench among quiet, unhurried hand tools.',
  'how-to-sit-still':            'An empty cushion on a bare wooden floor with a window casting one long slow rectangle of morning light.',
  'the-weight-of-small-decisions':'Hundreds of tiny identical pebbles arranged in a slow spiral on a plain surface, one of them a different colour.',
  'marginalia':                  'A close view of an open book\'s wide margin filled with faint handwritten pencil marks, underlines and small pressed flowers.'
};

async function api(p, body) {
  const r = await fetch(HOST + p, body ? { method: 'POST', headers: H, body: JSON.stringify(body) } : { headers: H });
  if (!r.ok) throw new Error(p + ' -> ' + r.status);
  return r.json();
}

async function main() {
  const only = process.argv.slice(2);
  const ids  = Object.keys(SUBJECTS).filter(id => !only.length || only.includes(id));
  fs.mkdirSync(OUT, { recursive: true });

  let state;
  try { state = await api('/api/state'); }
  catch { console.error('The studio is not running. Start "Start Dashboard.cmd" first.'); process.exit(1); }

  const before = new Set(state.library.map(i => i.file));
  console.log(`Queueing ${ids.length} cover${ids.length === 1 ? '' : 's'}…`);

  const jobs = [];
  for (const id of ids) {
    const res = await api('/api/generate', {
      prompt: `${SUBJECTS[id]} ${STYLE}`,
      mode: 'image', model: 'Flash', runs: 1, threadId: null, attach: []
    });
    jobs.push({ id, job: (res.queued || [])[0] });
    console.log('  queued', id);
    await sleep(400);                    // stagger so the queue orders predictably
  }

  process.stdout.write('Waiting for Gemini');
  for (;;) {
    await sleep(5000);
    const s = await api('/api/state');
    const busy = s.jobs.filter(j => j.status === 'queued' || j.status === 'running');
    process.stdout.write('.');
    if (!busy.length) break;
  }
  console.log('');

  const s = await api('/api/state');
  const failed = s.jobs.filter(j => j.status === 'failed');
  failed.forEach(j => console.error('  FAILED:', j.error));

  /* Match each image to its book by the prompt it was generated from.
     Job order and library order are both unreliable — jobs run concurrently and
     finish out of order, which silently mis-assigned every cover on the first run. */
  const lib = [...s.library].sort((a, b) => b.createdAt - a.createdAt);
  const raw = path.join(ROOT, 'tools', '.covers-raw');
  fs.mkdirSync(raw, { recursive: true });

  let got = 0;
  for (const id of ids) {
    const needle = SUBJECTS[id].slice(0, 40);
    const hit = lib.find(i => i.prompt && i.prompt.indexOf(needle) === 0);
    if (!hit) { console.log('  no image for', id); continue; }
    const r = await fetch(HOST + '/images/' + hit.file, { headers: H });
    if (!r.ok) { console.log('  could not download', hit.file); continue; }
    fs.writeFileSync(path.join(raw, id + '.png'), Buffer.from(await r.arrayBuffer()));
    console.log('  fetched', id, hit.w + 'x' + hit.h);
    got++;
  }

  console.log(`\n${got} image${got === 1 ? '' : 's'} fetched to tools/.covers-raw`);
  console.log('Now shrink them into the site:  py tools/covers-to-webp.py');
}

main().catch(e => { console.error(e); process.exit(1); });
