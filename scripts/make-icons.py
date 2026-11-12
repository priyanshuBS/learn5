"""
make-icons.py — draws the Learn5 app icons and saves them as PNG files.

    python scripts/make-icons.py

The logo is a "5-minute timer": a studio-black rounded tile with an indigo ring
that is almost closed, a light indigo dot where the ring ends, and a white "5" in
Geist Bold (the same drawing as src/components/Logo.tsx).
Each image is an SVG in a small HTML page, saved as a PNG by headless Chrome.

Writes:
  assets/images/icon.png                     1024  app icon (iOS + store), full square
  assets/images/android-icon-background.png  1024  Android adaptive icon: background
  assets/images/android-icon-foreground.png  1024  Android adaptive icon: the mark
  assets/images/android-icon-monochrome.png  1024  Android themed (one-colour) icon
  assets/images/splash-icon.png              1024  splash screen mark
  assets/images/favicon.png                    96  website favicon (app.json)
  public/learn5-icon.png                      256  browser tab + home-screen icon
"""
import math
import os
import pathlib
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT = (ROOT / 'node_modules/@expo-google-fonts/geist/700Bold/Geist_700Bold.ttf').as_uri()
CHROME_PATHS = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'google-chrome',
    'chromium',
]

DEFS = '''
<defs>
  <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1F1F26"/>
    <stop offset="1" stop-color="#0B0B0D"/>
  </linearGradient>
  <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#B8BEFF"/>
    <stop offset="1" stop-color="#5B66FF"/>
  </linearGradient>
  <radialGradient id="glow" cx="50%" cy="0%" r="75%">
    <stop offset="0" stop-color="#6E78FF" stop-opacity="0.32"/>
    <stop offset="1" stop-color="#6E78FF" stop-opacity="0"/>
  </radialGradient>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#6E78FF" flood-opacity="0.5"/>
  </filter>
</defs>'''


def mark(cx, cy, scale, ring='url(#ring)', text='#FFFFFF', dot='#B8BEFF', glow=True):
    """The timer ring + dot + "5", centred at (cx, cy). scale 1 = a 100px logo."""
    r = 30 * scale
    circ = 2 * math.pi * r
    arc = circ * 300 / 360
    ex = cx + r * math.cos(math.radians(210))
    ey = cy + r * math.sin(math.radians(210))
    f = ' filter="url(#soft)"' if glow else ''
    return f'''<g{f}>
  <circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{ring}" stroke-width="{8 * scale}"
    stroke-linecap="round" stroke-dasharray="{arc} {circ}" transform="rotate(-90 {cx} {cy})"/>
  <circle cx="{ex}" cy="{ey}" r="{7 * scale}" fill="{dot}"/>
</g>
<text x="{cx}" y="{cy + 12.6 * scale}" text-anchor="middle" font-family="GS" font-weight="700"
  font-size="{36 * scale}" fill="{text}">5</text>'''


def tile(size, pad):
    """The rounded dark tile with a hairline edge, and the mark."""
    s = size - 2 * pad
    rx = s * 0.26
    return f'''
<rect x="{pad}" y="{pad}" width="{s}" height="{s}" rx="{rx}" fill="url(#tile)"/>
<rect x="{pad}" y="{pad}" width="{s}" height="{s}" rx="{rx}" fill="url(#glow)"/>
<rect x="{pad + s * 0.01}" y="{pad + s * 0.01}" width="{s * 0.98}" height="{s * 0.98}" rx="{rx * 0.97}"
  fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="{max(1, s * 0.02)}"/>
{mark(size / 2, size / 2, s / 100)}'''


def full_square(size, with_mark=True):
    """Edge-to-edge (the phone rounds the corners)."""
    body = f'''
<rect width="{size}" height="{size}" fill="url(#tile)"/>
<rect width="{size}" height="{size}" fill="url(#glow)"/>'''
    if with_mark:
        body += mark(size / 2, size / 2, size / 100 * 0.62)
    return body


IMAGES = [
    ('assets/images/icon.png', 1024, full_square(1024)),
    ('assets/images/android-icon-background.png', 1024, full_square(1024, with_mark=False)),
    # Android keeps only the middle ~66% visible, so the mark stays inside it.
    ('assets/images/android-icon-foreground.png', 1024, mark(512, 512, 4.6)),
    ('assets/images/android-icon-monochrome.png', 1024,
     mark(512, 512, 4.6, ring='#FFFFFF', text='#FFFFFF', dot='#FFFFFF', glow=False)),
    ('assets/images/splash-icon.png', 1024, tile(1024, 112)),
    ('assets/images/favicon.png', 96, tile(96, 2)),
    ('public/learn5-icon.png', 256, tile(256, 6)),
]


def find_chrome():
    for path in CHROME_PATHS:
        if os.path.isabs(path) and os.path.exists(path):
            return path
    for name in CHROME_PATHS:
        if not os.path.isabs(name):
            return name
    sys.exit('Chrome or Edge is needed to draw the icons.')


def main():
    chrome = find_chrome()
    with tempfile.TemporaryDirectory() as tmp:
        for out, size, body in IMAGES:
            html = f'''<!doctype html><html><head><style>
@font-face {{ font-family: GS; src: url("{FONT}"); font-weight: 700; }}
html, body {{ margin: 0; background: transparent; }}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">{DEFS}{body}</svg>
</body></html>'''
            page = pathlib.Path(tmp) / 'icon.html'
            page.write_text(html, encoding='utf-8')
            subprocess.run(
                [chrome, '--headless=new', '--disable-gpu', '--hide-scrollbars',
                 '--default-background-color=00000000', f'--window-size={size},{size}',
                 '--force-device-scale-factor=1', '--virtual-time-budget=2000',
                 f'--screenshot={ROOT / out}', page.as_uri()],
                check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
            print(f'ok  {out} ({size}px)')


if __name__ == '__main__':
    main()
