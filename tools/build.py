# Build the site's static assets and stamp them so browsers can't serve a stale copy.
#
#   py tools/build.py
#
# 1. Concatenates + minifies the three stylesheets into assets/curious.min.css,
#    so a phone pays one round-trip instead of three.
# 2. Stamps ?v=<content hash> onto the css/js links in every page.
#
# Why the stamp: GitHub Pages serves assets with Cache-Control: max-age=600 and
# the filenames never change, so a browser that fetched the previous version
# keeps using it for up to ten minutes after a deploy. That is how a fixed
# layout can still look broken to the person who reported it. A hash in the
# query string means a changed file is always a new URL, and an unchanged one
# still gets cached.

import re, os, hashlib

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
SRC    = ["site.css", "pages.css", "hero.css"]
BUNDLE = "curious.min.css"
PAGES  = ["index.html","shop.html","book.html","read.html","cart.html","library.html","about.html"]
STAMP  = ["assets/" + BUNDLE, "assets/app.js", "assets/data.js"]


def minify(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{}:;,>~+])\s*", r"\1", css)
    css = re.sub(r";}", "}", css)
    css = re.sub(r"\s*!\s*important", "!important", css)
    css = css.replace("@media(", "@media (").replace("and(", "and (")
    return css.strip()


def short_hash(path):
    with open(path, "rb") as fh:
        return hashlib.sha1(fh.read()).hexdigest()[:8]


# ---- 1. the stylesheet bundle ----
parts, total = [], 0
for name in SRC:
    raw = open(os.path.join(ASSETS, name), encoding="utf-8").read()
    total += len(raw.encode("utf-8"))
    parts.append("/* %s */\n%s" % (name, minify(raw)))
out = "\n".join(parts)
open(os.path.join(ASSETS, BUNDLE), "w", encoding="utf-8").write(out)
after = len(out.encode("utf-8"))
print("css: %d files, %.1f KB -> %.1f KB (%.0f%% smaller, 1 request instead of %d)"
      % (len(SRC), total / 1024, after / 1024, 100 * (1 - after / total), len(SRC)))

# ---- 2. stamp every versioned asset ----
version = {rel: short_hash(os.path.join(ROOT, rel.replace("/", os.sep))) for rel in STAMP}
for rel, h in version.items():
    print("stamp: %-26s v=%s" % (rel, h))

changed = 0
for fn in PAGES:
    p = os.path.join(ROOT, fn)
    s = before = open(p, encoding="utf-8").read()
    for rel, h in version.items():
        # match the asset with or without an existing ?v=
        s = re.sub(r'(["\'])' + re.escape(rel) + r'(\?v=[0-9a-f]+)?\1',
                   lambda m: m.group(1) + rel + "?v=" + h + m.group(1), s)
    if s != before:
        open(p, "w", encoding="utf-8").write(s)
        changed += 1
print("stamped %d of %d pages" % (changed, len(PAGES)))
