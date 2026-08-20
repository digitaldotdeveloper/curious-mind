# Build the link-share thumbnail (Open Graph / Twitter / WhatsApp): assets/og.jpg
#
#   py tools/make-og.py
#
# 1200x630 is the size every platform crops from. JPEG rather than WebP because
# some scrapers (WhatsApp in particular) still ignore WebP previews.

from PIL import Image, ImageDraw, ImageFont
import os, glob

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAYERS = os.path.join(ROOT, "assets", "layers")
OUT    = os.path.join(ROOT, "assets", "og.jpg")
W, H   = 1200, 630

PAPER  = (255, 251, 254)
BLUSH  = (248, 187, 215)
VIOLET = (151, 133, 185)
INK    = (49, 45, 59)
DEEP   = (102, 86, 138)
FAINT  = (122, 125, 125)

def font(name, size):
    for p in [os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts", name),
              os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "Windows", "Fonts", name)]:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

# ---- ground: the same soft wash the site uses ----
base = Image.new("RGB", (W, H), PAPER)
wash = Image.new("RGB", (W, H), PAPER)
d = ImageDraw.Draw(wash)
for y in range(H):                                   # vertical blush -> paper
    t = y / H
    d.line([(0, y), (W, y)], fill=(
        int(253 - 8 * (1 - t)), int(240 + 11 * t), int(246 + 8 * t)))
base = Image.blend(base, wash, 0.75)

# corner glows, drawn as radial washes
glow = Image.new("RGB", (W, H), (0, 0, 0))
gd = ImageDraw.Draw(glow)
def radial(cx, cy, r, col):
    for i in range(r, 0, -6):
        a = (1 - i / r) ** 2
        gd.ellipse([cx - i, cy - i, cx + i, cy + i],
                   fill=tuple(int(c * a) for c in col))
radial(120, 90, 460, BLUSH)
radial(W - 90, 120, 420, VIOLET)
base = Image.blend(base, Image.blend(base, glow, 0.0), 0.0)  # keep base
base = Image.composite(base, base, Image.new("L", (W, H), 255))
soft = Image.new("RGB", (W, H), PAPER)
soft.paste(glow, (0, 0))
base = Image.blend(base, soft, 0.16)

# ---- the illustration, restacked from its layers ----
art = Image.new("RGBA", (1150, 705), (0, 0, 0, 0))
import json
man = json.load(open(os.path.join(LAYERS, "manifest.json"), encoding="utf-8"))
for m in man["layers"]:
    fp = os.path.join(LAYERS, os.path.basename(m["file"]))
    if not os.path.exists(fp):
        continue
    art.alpha_composite(Image.open(fp).convert("RGBA"), (m["px"][0], m["px"][1]))

art_w = 700
art = art.resize((art_w, round(art.height * art_w / art.width)), Image.LANCZOS)
base.paste(art, (W - art_w - 20, int(H / 2 - art.height / 2) + 10), art)

# ---- the words ----
d = ImageDraw.Draw(base)
f_name = font("georgiab.ttf", 30) or font("times.ttf", 30)
f_h1   = font("georgiab.ttf", 68)
f_sub  = font("segoeui.ttf", 25)
f_slog = font("segoeui.ttf", 19)

x = 76
logo_p = os.path.join(ROOT, "assets", "logo.webp")
if os.path.exists(logo_p):
    lg = Image.open(logo_p).convert("RGBA")
    lg.thumbnail((84, 84), Image.LANCZOS)
    base.paste(lg, (x, 74), lg)
    d.text((x + 100, 92), "CURIOUS MIND", font=f_name, fill=INK)
    d.text((x + 102, 128), "E B O O K   S T O R E", font=f_slog, fill=FAINT)

d.text((x, 232), "Read. Imagine.", font=f_h1, fill=DEEP)
d.text((x, 306), "Discover.", font=f_h1, fill=(63, 139, 128))

d.text((x, 410), "Stories today. Ideas forever.", font=f_sub, fill=INK)
d.text((x, 452), "Twelve hand-picked ebooks a month — DRM-free,", font=f_slog, fill=FAINT)
d.text((x, 480), "delivered instantly, worldwide.", font=f_slog, fill=FAINT)

# a quiet rule, like the site's eyebrow
d.line([(x, 200), (x + 54, 200)], fill=VIOLET, width=3)

base.convert("RGB").save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
print("wrote", os.path.relpath(OUT, ROOT), "%.0f KB" % (os.path.getsize(OUT) / 1024))
