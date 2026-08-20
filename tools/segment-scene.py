# Cut a generated scene into independently animatable layers.
#
#   py tools/segment-scene.py <name> tools/.scenes-raw/<file>.png
#
# Keys out the flat cream ground, finds each object as a connected component,
# hands every soft watercolour edge pixel to its nearest object so nothing is
# dropped, then writes assets/scenes/<name>/layer-NN.webp plus a manifest of
# positions as percentages. Verifies by restacking against the original.

from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage
from collections import deque
import sys, os, json

if len(sys.argv) < 3:
    raise SystemExit("usage: segment-scene.py <name> <source.png>")

NAME, SRC = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, "assets", "scenes", NAME)
os.makedirs(OUT, exist_ok=True)

MIN_AREA  = 900      # smaller than this joins the shared "dust" layer
MAX_LAYERS = 11      # biggest N objects get their own layer

# ---------- 1. key out the flat background ----------
im = Image.open(SRC).convert("RGB")
W, H = im.size
a = np.array(im).astype(np.float32)

corner = np.concatenate([a[0:6, 0:6].reshape(-1, 3), a[0:6, -6:].reshape(-1, 3),
                         a[-6:, 0:6].reshape(-1, 3), a[-6:, -6:].reshape(-1, 3)])
bg = np.median(corner, axis=0)
print("background:", bg.astype(int).tolist())

d = np.sqrt(((a - bg) ** 2).sum(-1))

# flood the background in from the borders so enclosed light areas are kept
strict = d < 16
vis = np.zeros((H, W), bool)
q = deque()
for x in range(W):
    for y in (0, H - 1):
        if strict[y, x] and not vis[y, x]: vis[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if strict[y, x] and not vis[y, x]: vis[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and strict[ny, nx] and not vis[ny, nx]:
            vis[ny, nx] = True; q.append((ny, nx))

band = np.array(Image.fromarray((vis * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))) > 0
alpha = np.where(band, np.clip((d - 9.0) / 30.0, 0, 1), 1.0)
al = alpha[..., None]
rgb = np.where(al > 0.01, (a - bg * (1 - al)) / np.maximum(al, 1e-6), a)
rgba = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)

# ---------- 2. find the objects ----------
A = rgba[..., 3]
mask = A > 40
lab, n = ndimage.label(mask)
soft = (A > 0) & ~mask
if soft.any():                                    # nothing may be discarded
    _, idx = ndimage.distance_transform_edt(~mask, return_indices=True)
    lab = np.where(A > 0, lab[idx[0], idx[1]], 0)

objs  = ndimage.find_objects(lab)
sizes = ndimage.sum(A > 0, lab, range(1, n + 1))
order = np.argsort(sizes)[::-1]

big  = [k for k in order if sizes[k] >= MIN_AREA][:MAX_LAYERS]
dust = [k for k in order if k not in big]
print("components:", n, "-> layers:", len(big), "+ dust:", len(dust))

groups = [("obj%02d" % (i + 1), [k + 1]) for i, k in enumerate(big)]
if dust:
    groups.append(("dust", [k + 1 for k in dust]))

# ---------- 3. write one image per layer ----------
manifest = []
for name, ids in groups:
    gm = np.isin(lab, ids)
    layer = rgba.copy()
    layer[..., 3] = np.where(gm, A, 0)
    img = Image.fromarray(layer, "RGBA")
    bb = img.getbbox()
    if not bb:
        continue
    img = img.crop(bb)
    fn = "%s.webp" % name
    img.save(os.path.join(OUT, fn), "WEBP", quality=88, method=6)
    manifest.append({
        "name": name, "file": "assets/scenes/%s/%s" % (NAME, fn),
        "left": round(bb[0] / W * 100, 3), "top": round(bb[1] / H * 100, 3),
        "width": round((bb[2] - bb[0]) / W * 100, 3),
        "px": [bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]],
        "area": int(sum(sizes[i - 1] for i in ids)),
    })
    print("  %-7s %4dx%-4d at %4d,%-4d  %5.1f KB" % (
        name, bb[2] - bb[0], bb[3] - bb[1], bb[0], bb[1],
        os.path.getsize(os.path.join(OUT, fn)) / 1024))

json.dump({"canvas": [W, H], "layers": manifest},
          open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8"), indent=1)

# ---------- 4. prove the layers restack to the original ----------
check = Image.new("RGBA", (W, H), (0, 0, 0, 0))
for m in manifest:
    check.alpha_composite(Image.open(os.path.join(OUT, os.path.basename(m["file"]))).convert("RGBA"),
                          (m["px"][0], m["px"][1]))
c = np.array(check).astype(int)
da = np.abs(c[..., 3] - rgba[..., 3].astype(int))
vis_px = rgba[..., 3] > 0
dc = np.abs(c[..., :3] - rgba[..., :3].astype(int))[vis_px]
print("alpha differs on %d px | colour max diff %d (WebP is lossy, <8 is invisible)"
      % (int((da > 0).sum()), int(dc.max()) if dc.size else 0))
