"""
make-icons.py — draws the Learn5 app icons and saves them as PNG files.

    python scripts/make-icons.py

The logo is a glossy 3D orange tile with a white "5-minute timer" ring and a "5"
(the same drawing as src/components/Logo.tsx). Each image is an SVG drawn in a
small HTML page and saved as a PNG by headless Chrome (transparent background).

Writes:
  assets/images/icon.png                     1024  app icon (iOS + store), full square
  assets/images/android-icon-background.png  1024  Android adaptive icon: background
  assets/images/android-icon-foreground.png  1024  Android adaptive icon: the mark
  assets/images/android-icon-monochrome.png  1024  Android themed (one-colour) icon
  assets/images/splash-icon.png              1024  splash screen mark
  assets/images/favicon.png                    96  website favicon (app.json)
  public/learn5-icon.png                      256  browser tab + home-screen icon
"""
import os
import pathlib
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT = (ROOT / 'node_modules/@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf').as_uri()
CHROME_PATHS = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'google-chrome',
    'chromium',
]

DEFS = '''
<defs>
  <linearGradient id="face" x1="0" y1="0" x2="0.5" y2="1">
    <stop offset="0" stop-color="#FFA15C"/>
    <stop offset="0.55" stop-color="#FF6A1A"/>
    <stop offset="1" stop-color="#E2480C"/>
  </linearGradient>
  <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.5"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#5A1A00" flood-opacity="0.45"/>
  </filter>
</defs>'''


def mark(cx, cy, scale, color='#fff', dot='#2A0E02', shadow=True):
    """The timer ring + dot + "5", centred at (cx, cy). scale 1 = 100px logo."""
    import math
    r = 30 * scale
    circ = 2 * math.pi * r
    arc = circ * 300 / 360
    ex = cx + r * math.cos(math.radians(210))
    ey = cy + r * math.sin(math.radians(210))
    f = ' filter="url(#shadow)"' if shadow else ''
    return f'''<g{f}>
  <circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{color}" stroke-width="{8 * scale}"
    stroke-linecap="round" stroke-dasharray="{arc} {circ}" transform="rotate(-90 {cx} {cy})"/>
  <circle cx="{ex}" cy="{ey}" r="{8 * scale}" fill="{dot}"/>
  <text x="{cx}" y="{cy + 12.5 * scale}" text-anchor="middle" font-family="SG" font-weight="700"
    font-size="{36 * scale}" fill="{color}">5</text>
</g>'''


def tile(size, pad):
    """The 3D tile (depth + face + rim + gloss) inside a size x size canvas."""
    s = size - 2 * pad
    depth = s * 0.06
    face = s - depth
    rx = s * 0.28
    return f'''
<rect x="{pad}" y="{pad + depth}" width="{s}" height="{face}" rx="{rx}" fill="#8A2A06"/>
<rect x="{pad}" y="{pad}" width="{s}" height="{face}" rx="{rx}" fill="url(#face)"/>
<rect x="{pad + s * 0.01}" y="{pad + s * 0.01}" width="{s * 0.98}" height="{face - s * 0.02}" rx="{rx * 0.96}"
  fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="{s * 0.02}"/>
<ellipse cx="{size / 2}" cy="{pad + face * 0.2}" rx="{s * 0.36}" ry="{face * 0.15}" fill="url(#gloss)"/>
{mark(size / 2, pad + face / 2, s / 100)}'''


def full_square(size, with_mark=True):
    """Edge-to-edge gradient (the OS rounds the corners) with gloss and the mark."""
    body = f'''
<rect width="{size}" height="{size}" fill="url(#face)"/>
<ellipse cx="{size / 2}" cy="{-size * 0.08}" rx="{size * 0.75}" ry="{size * 0.38}" fill="url(#gloss)" opacity="0.55"/>'''
    if with_mark:
        body += mark(size / 2, size / 2, size / 100 * 0.62)
    return body


IMAGES = [
    ('assets/images/icon.png', 1024, full_square(1024)),
    ('assets/images/android-icon-background.png', 1024, full_square(1024, with_mark=False)),
    # Android keeps only the middle ~66% visible, so the mark stays small.
    ('assets/images/android-icon-foreground.png', 1024, mark(512, 512, 4.6)),
    ('assets/images/android-icon-monochrome.png', 1024, mark(512, 512, 4.6, color='#fff', dot='#fff', shadow=False)),
    ('assets/images/splash-icon.png', 1024, tile(1024, 112)),
    ('assets/images/favicon.png', 96, tile(96, 4)),
    ('public/learn5-icon.png', 256, tile(256, 10)),
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
@font-face {{ font-family: SG; src: url("{FONT}"); }}
html, body {{ margin: 0; background: transparent; }}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">{DEFS}{body}</svg>
</body></html>'''
            page = pathlib.Path(tmp) / 'icon.html'
            page.write_text(html, encoding='utf-8')
            target = ROOT / out
            subprocess.run(
                [chrome, '--headless=new', '--disable-gpu', '--hide-scrollbars',
                 '--default-background-color=00000000', f'--window-size={size},{size}',
                 '--force-device-scale-factor=1', '--virtual-time-budget=2000',
                 f'--screenshot={target}', page.as_uri()],
                check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
            print(f'ok  {out} ({size}px)')


if __name__ == '__main__':
    main()
