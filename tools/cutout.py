# Key the flat cream ground off a generated image and keep the whole
# composition as ONE cut-out layer.
#
#   py tools/cutout.py <source.png> <out.webp> [--box x,y,w,h] [--canvas WxH]
#
# segment-scene.py splits a scene into many objects; this is the single-object
# case, for replacing one layer of the slide 1 hero. Same keying: flood the
# background in from the borders so light areas *inside* the art survive, and
# feather only in a band around it so the soft watercolour edges are kept.
#
# --box is the pixel rectangle in the hero canvas the layer should occupy; the
# cut-out is fitted inside it, centred, and the left/top/width percentages for
# index.html and assets/layers/manifest.json are printed.

from PIL import Image, ImageFilter
import numpy as np
from collections import deque
import sys, os

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opts = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
if len(args) < 2:
    raise SystemExit("usage: cutout.py <source.png> <out.webp> [--box=x,y,w,h] [--canvas=WxH]")
SRC, OUT = args[0], args[1]
CW, CH = (int(v) for v in opts.get("canvas", "1150x705").split("x"))
BOX = [int(v) for v in opts["box"].split(",")] if "box" in opts else None

im = Image.open(SRC).convert("RGB")
W, H = im.size
a = np.array(im).astype(np.float32)

corner = np.concatenate([a[0:6, 0:6].reshape(-1, 3), a[0:6, -6:].reshape(-1, 3),
                         a[-6:, 0:6].reshape(-1, 3), a[-6:, -6:].reshape(-1, 3)])
bg = np.median(corner, axis=0)
print("background:", bg.astype(int).tolist())

d = np.sqrt(((a - bg) ** 2).sum(-1))

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

cut = Image.fromarray(rgba, "RGBA")
bb = cut.getbbox()
cut = cut.crop(bb)
print("cropped to:", cut.size, "from", (W, H))

if BOX:
    bx, by, bw, bh = BOX
    s = min(bw / cut.width, bh / cut.height)
    tw, th = max(1, round(cut.width * s)), max(1, round(cut.height * s))
    cut = cut.resize((tw, th), Image.LANCZOS)
    left, top = bx + (bw - tw) / 2, by + (bh - th) / 2
    print("\nplacement (canvas %dx%d):" % (CW, CH))
    print("  px      %d,%d,%d,%d" % (round(left), round(top), tw, th))
    print("  left    %.3f%%" % (left / CW * 100))
    print("  top     %.3f%%" % (top / CH * 100))
    print("  width   %.3f%%" % (tw / CW * 100))
    print("  height  %.3f%%" % (th / CH * 100))
    print("  img     width=\"%d\" height=\"%d\"" % (tw, th))

os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
cut.save(OUT, "WEBP", quality=82, method=6)
print("\nwrote", OUT, os.path.getsize(OUT), "bytes")
