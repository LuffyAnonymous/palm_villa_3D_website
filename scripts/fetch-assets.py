"""
Downloads the CC0 PBR textures (Poly Haven, ambientCG) and HDRIs used by the 3D scene and converts the
textures to WebP (<= 1024 px, colour + GL normal + roughness).

    python3 scripts/fetch-assets.py

Output:  public/textures/<name>/{color,normal,rough}.webp   public/hdri/*.hdr   public/textures/CREDITS.md
`scale` = real-world size (metres) covered by one tile of the texture, used by src/three/materials.ts.
"""
import io, json, os, subprocess, tempfile, zipfile
from PIL import Image

TEX = {
    # name: (source, id, tile size in metres)
    'concrete':   ('polyhaven', 'brushed_concrete_04', 2.0),
    'oak':        ('polyhaven', 'oak_veneer_01', 1.83),
    'render':     ('polyhaven', 'beige_wall_002', 3.0),
    'renderGrey': ('polyhaven', 'beige_wall_002', 3.0),
    'grass':      ('polyhaven', 'leafy_grass', 2.0),
    'paver':      ('polyhaven', 'brick_pavement_03', 2.5),
    'asphalt':    ('polyhaven', 'asphalt_07', 2.5),
    'travertine': ('ambientcg', 'Travertine009', 1.2),
    'beigeStone': ('ambientcg', 'Marble020', 1.2),
    'stone':      ('ambientcg', 'Tiles143', 2.0),
    'marble':     ('ambientcg', 'Marble016', 1.2),
    'poolTile':   ('ambientcg', 'Tiles132A', 1.0),
}
HDRI = {'dusk': 'qwantani_dusk_2_puresky', 'day': 'kloofendal_43d_clear_puresky'}
SIZE = 1024
NEUTRAL = {'concrete', 'asphalt', 'paver', 'renderGrey'}
PARTIAL = {'stone': 0.65, 'grass': 0.25}  # blend towards grey by this fraction
ONLY = set(filter(None, os.environ.get('ONLY', '').split(',')))

def get(url):
    return subprocess.run(['curl', '-sfL', '-m', '120', url], capture_output=True, check=True).stdout

def save(img, path, q, gray=False):
    img = img.convert('L' if gray else 'RGB')
    if img.width > SIZE: img = img.resize((SIZE, SIZE), Image.LANCZOS)
    img.save(path, 'WEBP', quality=q, method=6)

os.makedirs('public/textures', exist_ok=True)
os.makedirs('public/hdri', exist_ok=True)
meta = {}
for name, (src, id_, scale) in TEX.items():
    if ONLY and name not in ONLY: continue
    out = f'public/textures/{name}'
    os.makedirs(out, exist_ok=True)
    if src == 'polyhaven':
        base = f'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/{id_}/{id_}'
        src_id = id_
        maps = {'color': get(base + '_diff_1k.jpg'), 'normal': get(base + '_nor_gl_1k.jpg'), 'rough': get(base + '_rough_1k.jpg')}
    else:
        z = zipfile.ZipFile(io.BytesIO(get(f'https://ambientcg.com/get?file={id_}_1K-JPG.zip')))
        pick = lambda s: z.read([n for n in z.namelist() if n.endswith(s)][0])
        maps = {'color': pick('_Color.jpg'), 'normal': pick('_NormalGL.jpg'), 'rough': pick('_Roughness.jpg')}
    col = Image.open(io.BytesIO(maps['color'])).convert('RGB')
    if name in NEUTRAL:  # strip the brown cast so the material can be tinted to a true charcoal / grey
        col = Image.merge('RGB', [col.convert('L')] * 3)
    if name in PARTIAL:
        col = Image.blend(col, Image.merge('RGB', [col.convert('L')] * 3), PARTIAL[name])
    save(col, f'{out}/color.webp', 82)
    save(Image.open(io.BytesIO(maps['normal'])), f'{out}/normal.webp', 88)
    save(Image.open(io.BytesIO(maps['rough'])), f'{out}/rough.webp', 80, gray=True)
    meta[name] = {'source': src, 'id': id_, 'scale': scale}
    print('texture', name, sum(os.path.getsize(f'{out}/{f}') for f in os.listdir(out)) // 1024, 'KB')

for k, id_ in HDRI.items():
    if ONLY: break
    open(f'public/hdri/{k}.hdr', 'wb').write(get(f'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/{id_}_1k.hdr'))
    print('hdri', k, os.path.getsize(f'public/hdri/{k}.hdr') // 1024, 'KB')

lines = ['# Texture and HDRI credits', '', 'All assets are CC0 (public domain). Thank you to Poly Haven and ambientCG.', '',
         '| Material | Source | Asset |', '|---|---|---|']
for n, m in meta.items():
    site = 'https://polyhaven.com/a/' if m['source'] == 'polyhaven' else 'https://ambientcg.com/a/'
    lines.append(f"| {n} | {m['source']} | [{m['id']}]({site}{m['id']}) |")
for k, id_ in HDRI.items():
    lines.append(f'| HDRI {k} | polyhaven | [{id_}](https://polyhaven.com/a/{id_}) |')
open('public/textures/CREDITS.md', 'w').write('\n'.join(lines) + '\n')
