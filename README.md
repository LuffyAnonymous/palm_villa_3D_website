# VILLA PALM — interactive 3D villa website

A single-page site for a luxury villa: a full-screen 3D hero, a **layout configurator** where visitors cut the
villa open floor by floor, step inside rooms, and download plans, plus gallery, location, specifications and contact.
Built with **Vite + React + TypeScript**, **three.js** (`@react-three/fiber`, `drei`, `postprocessing`),
**GSAP** (camera moves) and **styled-components**. English and Arabic (right-to-left).

The villa is **modelled in code** (real metres, one component per building part). Nothing is a flat image.

---

## 1. Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build -> dist/
npm run preview    # serve dist/ locally
npm run zip        # build, then dist/ -> villa-palm-dist.zip (ready to upload)
```

Node 20+. Python 3 + Pillow are only needed for the asset scripts below.
Add `?quality=low` or `?quality=high` to the URL to force a graphics tier (see §7).

## 2. Where things live

```
src/data/villa.ts      ALL content: rooms, zones, copy (EN + AR), gallery, places, specs, contact, projects, footer
src/ui/                page sections (Navbar, Hero, Configurator, Gallery, Location, Specs, Contact, Projects, Footer)
src/three/             the 3D scene
  parts/               GroundFloor, FirstFloor, Roof, Site, Terrace, Pool, Vegetation  (one component per building part)
  facade.tsx           walls, glazing, slat panels, auto-generated interior partitions
  materials.ts         PBR materials (CC0 textures)      Atmosphere.tsx  HDRI sky, sun, night lights
  primitives.tsx       box/instancing helpers + the draw-call "bake"     Effects.tsx  AO, bloom, tone mapping, SMAA
public/images/         source photos + WebP web versions   public/textures, public/hdri   CC0 PBR textures and HDRIs
public/plans/          floor-plan PDFs                      public/models/villa.glb          exported, compressed model
reference/             images kept for reference only — NOT part of the build
scripts/               asset pipelines (images, textures, plans, sun direction)
```

## 3. Changing content — `src/data/villa.ts`

Everything the visitor reads is in this one file, in plain data shaped so it could later come from an API.
Every visible string is `{ en, ar }` (`l('English', 'العربية')`).

| You want to change… | Edit |
|---|---|
| Hero title, text, pin, 3 distance stats | `site.hero` |
| Menu labels, "Contact us" | `site.nav`, `site.contactCta` |
| Floor cards (title, blurb, status) | `zones` |
| Rooms: name, description, size, photo, interior viewpoint | `rooms` (`rect` = `[x0, x1, z0, z1]` in metres) |
| Gallery images and captions | `site.gallery.items` |
| Map location, address, nearby places and km | `site.location` |
| The 9 specification items | `site.specs.items` |
| Form labels, errors, consent text, phone, e-mail, address | `site.contact` |
| "Other projects" cards | `site.projects.items` (placeholders) |
| Footer text, studio name | `site.footer`, `site.brand` |

**All names, numbers, phone, e-mail, address and the studio name are placeholders.** The Arabic copy was written
without a native review — please have it checked.

Room sizes shown on the site are computed from the room rectangles, so editing a `rect` updates the m² everywhere.
After changing rooms, run `npm run plans` to regenerate the floor-plan PDFs.

## 4. Replacing images

1. Put the full-size originals in `public/images/exterior/` or `public/images/interior/`.
2. `python3 scripts/make-web-images.py` writes `<name>.webp` next to each original: ≤ 1920 px wide, ≈ 300 KB,
   **bottom 8 % cropped** (this removes the "HIGGSFIELD AI" watermark). Change `0.92` in the script for another crop.
3. Reference the `.webp` in `site.gallery.items` (and `photo:` in `rooms` for the room-detail panel).

Only the WebP files are shipped: `npm run build` deletes the PNG/JPG originals from `dist/`.

> `reference/rear-original.jpg` carries a third-party visualiser's credit. It is deliberately **not** used on the site
> and is not part of the build. Use it only if you have the rights, and never with the credit cropped away.

## 5. The 3D model

- Coordinates are metres. **+x = right** when facing the front facade, **+z = towards the street**, y = up. The house core is 18 × 14 m.
- Each floor is a separate group (`floor-0-ground`, `floor-1-first`, `floor-2-roof`), which is how the configurator cuts the villa away.
- Every element is wrapped in `<Part id=… status="VISIBLE|INFERRED" note=…>`:
  **VISIBLE** = seen in the reference images, **INFERRED** = a plausible guess (see the list in §9).
- **Export:** in `npm run dev`, scroll to *Layouts* and press **Export GLB** (bottom-right of the 3D view).
  It writes `public/models/villa.glb` — merged meshes + GPU-instanced slats, compressed with **Meshopt**, textures as **WebP** (1K),
  every node tagged with `extras.status` — and rewrites `ELEMENTS.md` (the full VISIBLE/INFERRED list). The button does not exist in production builds.
- The website renders the villa from code, not from the GLB (the configurator needs per-floor and per-room control);
  the GLB is a deliverable for other tools or a future viewer.

## 6. Textures, sky and lighting

- **Materials** are CC0 PBR sets from [Poly Haven](https://polyhaven.com) and [ambientCG](https://ambientcg.com):
  concrete, oak, render, travertine, black marble, grass, pool tile, paving, asphalt — at real-world scale
  (UVs are in metres; each material has its tile size in `src/three/materials.ts`). Credits: `public/textures/CREDITS.md`.
- **Lighting** is an HDRI per mode (clear sky by day, dusk by night) plus a shadow-casting sun and a soft front fill.
  The sun direction is measured from the HDRI itself (`npm run sun`).
- To swap a texture: edit the table in `scripts/fetch-assets.py`, run `npm run assets` (needs internet), adjust the tint in `materials.ts`.

## 7. Performance and quality tiers

| | before | after (High) | after (Low) |
|---|---|---|---|
| GPU draw calls / frame | 1,226 | ≈ 260–280 (incl. shadow, AO and post passes) | ≈ 165 |

How: static meshes are merged per material (`bake()` in `primitives.tsx`), repeated items stay **instanced**, and all
instances of one material/shape become a single draw call. Only chunky parts cast shadows.

- **High:** transmission glass, N8AO ambient occlusion, bloom, ACES Filmic tone mapping, SMAA, soft shadows, pixel ratio ≤ 2.
- **Low:** no glass refraction, no post-processing, hardware AA, simpler shadows, pixel ratio 1, fewer night lights.
- **Auto-detection:** GPU/device heuristics at start, then an FPS monitor drops to Low if frame rate stays poor.
  Visitors can switch with the **High / Low** buttons (remembered). `?quality=low|high` overrides.
- The 3D canvases are lazy-loaded (a real progress bar shows texture/HDRI loading) and **stop rendering while off-screen**.
- `window.__villaStats` exposes `{ calls, triangles, geometries, textures }` for measuring.

## 8. Deploying

`npm run zip` produces `villa-palm-dist.zip`. Unzip it into the web root of any (sub)domain — the build uses relative
paths (`base: './'`), navigation is hash-based (`#layouts`), so no server rewrites are needed.
Serve over **http(s)**; opening `index.html` from the file system will not load textures.

The **contact form has no backend yet**: it validates (incl. the 5 MB attachment limit), logs the payload to the console
and shows a success state. Wire it up in `src/lib/contact.ts` (a commented `FormData` example is there), and re-validate
the file on the server.

## 9. Inferred elements (please review)

Not visible in the supplied images, so reasoned and kept simple. Everything else was modelled from the photos.

**Rooms and layout** (`rooms` in `villa.ts`; rectangles are `[x0, x1, z0, z1]` in metres)

| Room | Floor | Area | Rectangle |
|---|---|---|---|
| Entrance hall & stairs | Ground | 30 m² | -3, 1, -0.5, 7 |
| Double garage | Ground | 33 m² | -9, -3, 1.5, 7 |
| Laundry / utility | Ground | 6 m² | -9, -6, -0.5, 1.5 |
| Guest WC | Ground | 6 m² | -6, -3, -0.5, 1.5 |
| Master bathroom | First | 16 m² | -3, 1, -4.5, -0.5 |
| Walk-in wardrobe | First | 11 m² | -9, -5.5, 0.5, 3.5 |
| Bathroom 2 | First | 8 m² | -5.5, -3, 0.5, 3.5 |
| Bedroom 2 | First | 21 m² | -9, -3, 3.5, 7 |
| Landing | First | 7 m² | -3, 1, -0.5, 1.2 |
| Gallery | First | 6 m² | -3, -2, 1.2, 7 |
| Bridge over the living room | First | 5 m² | 1, 5, 0, 1.2 |
| Corridor | First | 5 m² | 1, 3.4, -2, 0 |
| Bathroom 3 | First | 3 m² | 3.4, 5, -2, 0 |
| Roof deck | Roof | 190 m² | -9, 9, -6, 7 |

Also inferred: the **double-height void** over part of the living room, the **stair position and shape**, all **door openings**
(auto-placed in partitions), the room **circulation** (which rooms connect), and all **dimensions** (the images give no scale; the
18 × 14 m footprint and 3.2 m floor height come from the brief).

**Building parts** (see `ELEMENTS.md` for every part with its source note)

- `hall-stairs` — entrance hall and stair (oak floating treads, steel stringer, glass rail)
- `g-side-walls`, `f1-side-walls` — side and return walls, west garage wall in dark concrete
- `garage-fitout`, `utility-fitout`, `wc-fitout` — storage wall, laundry, guest WC fixtures
- `f1-inferred-fitout` — master bath, wardrobe, bedroom 2 and 3, bathrooms 2 and 3: placeholder furniture
- `f1-rails` — glass balustrades on the stair void and the bridge
- `site-perimeter-walls` — 2.5 m side and rear walls and hedges (fade out when the camera is outside them)
- Roof: the deck finish, and what the two rooftop boxes contain
- Plot size (26 × 34 m), the street, neighbouring ground, and the exact palm / planting positions

**Content** — all marketing copy, distances, specifications, addresses and the "other projects" are placeholders.

## 10. Credits and licences

Code: yours. Textures and HDRIs: CC0 (Poly Haven, ambientCG) — see `public/textures/CREDITS.md`.
Fonts: Hanken Grotesk and Noto Sans Arabic (SIL OFL), bundled via Fontsource.
