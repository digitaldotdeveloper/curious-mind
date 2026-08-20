# Concatenate and minify the stylesheets into assets/curious.min.css
#
#   py tools/build-css.py
#
# The sources stay readable and are what you edit; the site ships one file so a
# phone pays one round-trip instead of three. On a high-latency connection that
# was worth about a second before anything could paint.

import re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = ["site.css", "pages.css", "hero.css"]
OUT  = os.path.join(ROOT, "assets", "curious.min.css")

def minify(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)        # comments
    css = re.sub(r"\s+", " ", css)                          # collapse whitespace
    css = re.sub(r"\s*([{}:;,>~+])\s*", r"\1", css)         # around punctuation
    css = re.sub(r";}", "}", css)                           # trailing semicolons
    css = re.sub(r"\s*!\s*important", "!important", css)
    # put back the space media queries and selector combinators need
    css = css.replace("@media(", "@media (").replace("and(", "and (")
    return css.strip()

parts, total = [], 0
for name in SRC:
    p = os.path.join(ROOT, "assets", name)
    raw = open(p, encoding="utf-8").read()
    total += len(raw.encode("utf-8"))
    parts.append("/* %s */\n%s" % (name, minify(raw)))

out = "\n".join(parts)
open(OUT, "w", encoding="utf-8").write(out)

after = len(out.encode("utf-8"))
print("%d files, %.1f KB -> %.1f KB (%.0f%% smaller, and 1 request instead of %d)"
      % (len(SRC), total / 1024, after / 1024, 100 * (1 - after / total), len(SRC)))
