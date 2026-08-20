# Shrink the raw Gemini covers into web-sized WebP.
#
#   py tools/covers-to-webp.py
#
# Reads tools/.covers-raw/*.png (written by generate-covers.mjs) and writes
# assets/covers/<id>.webp. Covers render at ~250px CSS at the largest, so 560px
# is already 2x on a retina screen — anything bigger is bytes nobody sees.

from PIL import Image
import os, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW  = os.path.join(ROOT, "tools", ".covers-raw")
OUT  = os.path.join(ROOT, "assets", "covers")
TARGET_W = 560
QUALITY  = 82

os.makedirs(OUT, exist_ok=True)
files = sorted(glob.glob(os.path.join(RAW, "*.png")))
if not files:
    raise SystemExit("Nothing in tools/.covers-raw — run generate-covers.mjs first.")

before = after = 0
for f in files:
    name = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f).convert("RGB")
    before += os.path.getsize(f)
    if im.width > TARGET_W:
        im = im.resize((TARGET_W, round(im.height * TARGET_W / im.width)), Image.LANCZOS)
    dest = os.path.join(OUT, name + ".webp")
    im.save(dest, "WEBP", quality=QUALITY, method=6)
    after += os.path.getsize(dest)
    print("%-32s %4dx%-4d  %6.1f KB" % (name, im.width, im.height, os.path.getsize(dest) / 1024))

print("\n%.1f KB  ->  %.1f KB   (%.0f%% smaller)" % (before / 1024, after / 1024, 100 * (1 - after / before)))
