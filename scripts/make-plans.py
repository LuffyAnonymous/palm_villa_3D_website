"""Draws simple indicative floor plans (PDF) from the room data. Run via `npm run plans`."""
import json, os
from PIL import Image, ImageDraw, ImageFont

rooms = json.load(open('scripts/.plan-data.json'))
os.makedirs('public/plans', exist_ok=True)
S = 60  # px per metre
M = 90
W, H = 1754, 1240  # A3-ish landscape @ 100dpi-ish
try:
    F = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 22)
    FS = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 17)
    FT = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 40)
except Exception:
    F = FS = FT = ImageFont.load_default()

PLANS = {
    'ground-floor': ('Ground floor', lambda r: r['zone'] == 'ground'),
    'first-floor': ('First floor', lambda r: r['zone'] == 'first'),
    'roof': ('Roof', lambda r: r['zone'] == 'roof'),
    'terrace-pool': ('Terrace, pool & garden', lambda r: r['zone'] == 'terrace'),
}

def page(title, rs):
    im = Image.new('RGB', (W, H), '#0f0f0f')
    d = ImageDraw.Draw(im)
    d.text((M, 50), 'VILLA PALM', font=F, fill='#c8a06a')
    d.text((M, 85), title, font=FT, fill='#eaeaea')
    d.text((M, H - 60), 'Indicative plan - dimensions in metres, areas in m2. Not for construction.', font=FS, fill='#888')
    xs = [v for r in rs for v in r['rect'][:2]]
    zs = [v for r in rs for v in r['rect'][2:]]
    x0, z1 = min(xs), max(zs)
    sc = min((W - 2 * M) / (max(xs) - x0), (H - 280) / (z1 - min(zs)), S * 1.4)
    def P(x, z):  # plan view: rear (-z) at the top, street / front (+z) at the bottom
        return (M + (x - x0) * sc, 190 + (z - min(zs)) * sc)
    for r in rs:
        a, b, c, e = r['rect']
        (px0, py0), (px1, py1) = P(a, c), P(b, e)
        d.rectangle([px0, py0, px1, py1], fill='#1b1b1b' if not r['outdoor'] else '#172019', outline='#c8a06a', width=3)
        cx, cy = (px0 + px1) / 2, (py0 + py1) / 2
        for i, t in enumerate([r['name'], f"{r['area']} m2"]):
            tw = d.textlength(t, font=FS)
            d.text((cx - tw / 2, cy - 16 + i * 22), t, font=FS, fill='#eaeaea' if i == 0 else '#c8a06a')
    return im

pages = {}
for key, (title, f) in PLANS.items():
    rs = [r for r in rooms if f(r)]
    pages[key] = page(title, rs)
    pages[key].save(f'public/plans/{key}.pdf', 'PDF', resolution=100)
first = list(pages.values())
first[0].save('public/plans/villa-complete.pdf', 'PDF', resolution=100, save_all=True, append_images=first[1:])
print('plans:', sorted(os.listdir('public/plans')))
