/**
 * All site content lives here. Shaped as plain JSON-serialisable data so it
 * can later be replaced by an API response (`fetch('/api/villa').then(...)`).
 *
 * Coordinate system (metres): +x = right when facing the FRONT facade,
 * +z = towards the street (front), -z = rear garden, y = up.
 * The house core is x -9..9, z -7..7.
 */

/** bilingual string */
export interface L { en: string; ar: string }
const l = (en: string, ar: string): L => ({ en, ar })

export type Status = 'VISIBLE' | 'INFERRED'
export type V3 = [number, number, number]
/** [x0, x1, z0, z1] */
export type Rect = [number, number, number, number]

export type MaterialKey = 'travertine' | 'concrete' | 'stone' | 'beigeStone' | 'deck' | 'grass' | 'tile'

export interface Room {
  id: string
  floor: 0 | 1 | 2
  zone: 'ground' | 'first' | 'roof' | 'terrace'
  name: L
  rect: Rect
  /** overrides rect area (irregular shapes) */
  area?: number
  outdoor?: boolean
  status: Status
  floorMat: MaterialKey
  desc: L
  /** matching photo under /images/interior, if any */
  photo?: string
  /** eye-level viewpoint; auto-generated from rect when omitted */
  view?: { eye: V3; target: V3 }
  /** where the label is drawn (defaults to rect centre) */
  labelAt?: [number, number]
}

export const FLOOR_Y = [0, 3.2, 6.4] as const

export const rooms: Room[] = [
  // ───────────── Ground floor ─────────────
  {
    id: 'living', floor: 0, zone: 'ground', name: l('Living room', 'غرفة المعيشة'), rect: [1, 8, -5.5, 7], status: 'VISIBLE',
    floorMat: 'travertine', photo: 'living-room',
    desc: l('A double-height lounge wrapped around an oak slat feature wall with a linear fireplace. Full-height sliding glass opens onto the pool and waterfall.', 'غرفة معيشة بارتفاع مزدوج تلتفّ حول جدار موقد من شرائح خشب البلوط مع موقد خطي. أبواب زجاجية منزلقة بارتفاع كامل تفتح على المسبح والشلال.'),
    view: { eye: [7.4, 1.6, 0.4], target: [1, 2.0, 2.6] },
    labelAt: [4.5, 1.5],
  },
  {
    id: 'kitchen', floor: 0, zone: 'ground', name: l('Kitchen', 'المطبخ'), rect: [-9, -3.5, -4.5, -0.5], status: 'VISIBLE',
    floorMat: 'travertine', photo: 'kitchen',
    desc: l('A chef’s kitchen with an eight-seat stone waterfall island, tall oak cabinetry and an oak slat ceiling lit by linear LEDs.', 'مطبخ للطهاة مع جزيرة حجرية متدفقة بثمانية مقاعد، وخزائن بلوط عالية، وسقف من شرائح البلوط تضيئه أشرطة LED خطية.'),
    view: { eye: [-3.9, 1.55, -1.3], target: [-9, 1.4, -2.7] },
  },
  {
    id: 'dining', floor: 0, zone: 'ground', name: l('Dining', 'غرفة الطعام'), rect: [-3.5, 1, -4.5, -0.5], status: 'VISIBLE',
    floorMat: 'travertine',
    desc: l('A long oak dining table beside the kitchen, opening through sliding glass to the covered terrace and the pool.', 'طاولة طعام طويلة من البلوط بجوار المطبخ، تنفتح عبر زجاج منزلق على الشرفة المغطاة والمسبح.'),
    view: { eye: [0.4, 1.55, -0.9], target: [-3.5, 1.2, -3.2] },
  },
  {
    id: 'hall', floor: 0, zone: 'ground', name: l('Entrance hall & stairs', 'المدخل والدرج'), rect: [-3, 1, -0.5, 7], status: 'INFERRED',
    floorMat: 'travertine',
    desc: l('A tall pivot door opens to a double-height hall with a floating oak and steel stair.', 'باب دوّار طويل يفتح على مدخل بارتفاع مزدوج مع درج معلّق من البلوط والفولاذ.'),
    view: { eye: [-1, 1.6, 6.6], target: [-1, 1.8, 0] },
  },
  {
    id: 'garage', floor: 0, zone: 'ground', name: l('Double garage', 'كراج مزدوج'), rect: [-9, -3, 1.5, 7], status: 'INFERRED',
    floorMat: 'concrete',
    desc: l('Covered carport and double garage behind a vertical oak slat door.', 'مظلة سيارات وكراج مزدوج خلف باب من شرائح البلوط العمودية.'),
    view: { eye: [-3.6, 1.6, 2.2], target: [-8, 1.2, 6.5] },
  },
  {
    id: 'utility', floor: 0, zone: 'ground', name: l('Laundry / utility', 'الغسيل والخدمات'), rect: [-9, -6, -0.5, 1.5], status: 'INFERRED',
    floorMat: 'travertine', desc: l('Laundry, pantry and service storage with a discreet service door to the kitchen.', 'غسيل ومخزن وخدمات مع باب خدمة مخفي إلى المطبخ.'),
  },
  {
    id: 'wc', floor: 0, zone: 'ground', name: l('Guest WC', 'دورة مياه الضيوف'), rect: [-6, -3, -0.5, 1.5], status: 'INFERRED',
    floorMat: 'travertine', desc: l('Guest powder room off the entrance hall.', 'دورة مياه للضيوف بجوار المدخل.'),
  },
  // ───────────── First floor ─────────────
  {
    id: 'master', floor: 1, zone: 'first', name: l('Master bedroom', 'غرفة النوم الرئيسية'), rect: [-9, -3, -4.5, 0.5], status: 'VISIBLE',
    floorMat: 'beigeStone', photo: 'master-bedroom',
    desc: l('An oak slat headboard wall with a hidden LED strip, floating bedside tables and sliding glass to a private balcony with a frameless glass railing.', 'جدار رأس سرير من شرائح البلوط مع شريط LED مخفي، وطاولات جانبية معلّقة، وزجاج منزلق إلى شرفة بحاجز زجاجي بلا إطار.'),
    view: { eye: [-8.6, 4.75, -2.0], target: [-3, 4.6, -2.0] },
  },
  {
    id: 'balcony', floor: 1, zone: 'first', name: l('Master balcony', 'شرفة الجناح الرئيسي'), rect: [-9, 1, -7, -4.5], status: 'VISIBLE', outdoor: true,
    floorMat: 'beigeStone', desc: l('A 2.5 m cantilevered slab beneath the dark concrete frame, enclosed by frameless glass.', 'بلاطة كابولية بطول 2.5 م تحت الإطار الخرساني الداكن، محاطة بزجاج بلا إطار.'),
    view: { eye: [-2, 4.8, -4.8], target: [-4, 4.3, -10] },
  },
  {
    id: 'masterbath', floor: 1, zone: 'first', name: l('Master bathroom', 'حمّام الجناح الرئيسي'), rect: [-3, 1, -4.5, -0.5], status: 'INFERRED',
    floorMat: 'beigeStone', desc: l('Double vanity, rain shower and freestanding bath behind grey stone cladding.', 'حوض مزدوج ودش مطري وحوض استحمام قائم خلف تكسية من الحجر الرمادي.'),
  },
  {
    id: 'wardrobe', floor: 1, zone: 'first', name: l('Walk-in wardrobe', 'غرفة الملابس'), rect: [-9, -5.5, 0.5, 3.5], status: 'INFERRED',
    floorMat: 'beigeStone', desc: l('Oak-fronted walk-in wardrobe linked to the master suite.', 'غرفة ملابس بواجهات من البلوط مرتبطة بالجناح الرئيسي.'),
  },
  {
    id: 'bath2', floor: 1, zone: 'first', name: l('Bathroom 2', 'الحمّام 2'), rect: [-5.5, -3, 0.5, 3.5], status: 'INFERRED',
    floorMat: 'beigeStone', desc: l('En-suite bathroom for bedroom 2.', 'حمّام داخلي لغرفة النوم 2.'),
  },
  {
    id: 'bedroom2', floor: 1, zone: 'first', name: l('Bedroom 2', 'غرفة النوم 2'), rect: [-9, -3, 3.5, 7], status: 'INFERRED',
    floorMat: 'beigeStone', desc: l('Front-facing bedroom behind an oak slat screen.', 'غرفة نوم أمامية خلف ستار من شرائح البلوط.'),
  },
  {
    id: 'landing', floor: 1, zone: 'first', name: l('Landing', 'بسطة الدرج'), rect: [-3, 1, -0.5, 1.2], status: 'INFERRED',
    floorMat: 'beigeStone', desc: l('Stair landing overlooking the entrance hall.', 'بسطة الدرج المطلّة على المدخل.'),
  },
  {
    id: 'gallery', floor: 1, zone: 'first', name: l('Gallery', 'الممر المطل'), rect: [-3, -2, 1.2, 7], status: 'INFERRED',
    floorMat: 'beigeStone', desc: l('A narrow gallery along the stair void leading to bedroom 2.', 'ممر ضيق على امتداد فراغ الدرج يؤدي إلى غرفة النوم 2.'),
  },
  {
    id: 'corridor', floor: 1, zone: 'first', name: l('Bridge', 'الجسر'), rect: [1, 5, 0, 1.2], status: 'INFERRED',
    floorMat: 'beigeStone', desc: l('A glass-balustraded bridge crossing the void above the living room.', 'جسر بحاجز زجاجي يعبر الفراغ فوق غرفة المعيشة.'),
  },
  {
    id: 'corridor2', floor: 1, zone: 'first', name: l('Corridor', 'ممر'), rect: [1, 3.4, -2, 0], status: 'INFERRED',
    floorMat: 'beigeStone', desc: l('Corridor to bedroom 3.', 'ممر يؤدي إلى غرفة النوم 3.'),
  },
  {
    id: 'bath3', floor: 1, zone: 'first', name: l('Bathroom 3', 'الحمّام 3'), rect: [3.4, 5, -2, 0], status: 'INFERRED',
    floorMat: 'beigeStone', desc: l('En-suite bathroom for bedroom 3.', 'حمّام داخلي لغرفة النوم 3.'),
  },
  {
    id: 'bedroom3', floor: 1, zone: 'first', name: l('Bedroom 3', 'غرفة النوم 3'), rect: [1, 5, -5.5, -2], status: 'VISIBLE',
    floorMat: 'beigeStone',
    desc: l('A rear bedroom behind a wooden lattice screen, with a recessed planter and the waterfall spilling from the slab edge.', 'غرفة نوم خلفية خلف ستار خشبي شبكي، مع حوض نباتات غائر وشلال ينساب من حافة البلاطة.'),
  },
  // ───────────── Roof ─────────────
  {
    id: 'roofdeck', floor: 2, zone: 'roof', name: l('Roof deck', 'سطح مفتوح'), rect: [-9, 9, -6, 7], area: 190, outdoor: true, status: 'INFERRED',
    floorMat: 'concrete', desc: l('Flat roof with a light concrete finish, ready for solar panels or a planted green roof.', 'سطح مستوٍ بتشطيب خرساني فاتح، جاهز للألواح الشمسية أو للسطح الأخضر.'),
    labelAt: [-6.5, 5],
  },
  {
    id: 'teche', floor: 2, zone: 'roof', name: l('Stair & technical', 'الدرج والغرفة الفنية'), rect: [-4.5, -1.5, -2.5, 1], status: 'VISIBLE',
    floorMat: 'concrete', desc: l('Roof access and technical room for plant and water storage.', 'مدخل السطح وغرفة فنية للمعدات وخزان المياه.'),
  },
  {
    id: 'techb', floor: 2, zone: 'roof', name: l('Plant room', 'غرفة المعدات'), rect: [3, 6, -3.5, -0.5], status: 'VISIBLE',
    floorMat: 'concrete', desc: l('Inverter, heat-pump and smart-home hub room.', 'غرفة العاكس والمضخة الحرارية ومركز المنزل الذكي.'),
  },
  // ───────────── Terrace, pool & garden ─────────────
  {
    id: 'terrace', floor: 0, zone: 'terrace', name: l('Covered terrace', 'الشرفة المغطاة'), rect: [-9, 1, -14, -4.5], status: 'VISIBLE', outdoor: true,
    floorMat: 'stone',
    desc: l('A shaded terrace under the 2.5 m cantilever, with dark pergola beams, recessed downlights, two round rattan armchairs and a stone coffee table.', 'شرفة مظللة تحت الكابولي بطول 2.5 م، مع عوارض برغولا داكنة وإضاءة غائرة وكرسيين دائريين من الروطان وطاولة قهوة حجرية.'),
    view: { eye: [0.2, 1.7, -12.5], target: [-6, 1.2, -6] },
    labelAt: [-4, -9],
  },
  {
    id: 'pool', floor: 0, zone: 'terrace', name: l('Pool & spa', 'المسبح والسبا'), rect: [2, 8, -19, -6.5], area: 88, status: 'VISIBLE', outdoor: true,
    floorMat: 'tile',
    desc: l('Turquoise-tile pool with dark stone coping, a raised spa, a sunken lounge pit and a sheet waterfall from the upper slab.', 'مسبح ببلاط فيروزي وإطار حجري داكن، مع سبا مرتفع ومنطقة جلوس منخفضة وشلال ينساب من البلاطة العلوية.'),
    view: { eye: [6.5, 1.7, -20.5], target: [3, 0.5, -8] },
  },
  {
    id: 'garden', floor: 0, zone: 'terrace', name: l('Garden & deck', 'الحديقة والمنصة الخشبية'), rect: [-9, 9, -23, -17.5], area: 130, status: 'VISIBLE', outdoor: true,
    floorMat: 'grass',
    desc: l('Lawn with large concrete stepping stones, a timber deck in the corner, tall palms and uplit hedges.', 'مروج مع أحجار عبور خرسانية كبيرة، ومنصة خشبية في الزاوية، ونخيل عالٍ وأسيجة مضاءة.'),
    view: { eye: [-4, 1.7, -22.5], target: [3, 2, -6] },
    labelAt: [2, -21],
  },
]

export const roomArea = (r: Room) => Math.round(r.area ?? (r.rect[1] - r.rect[0]) * (r.rect[3] - r.rect[2]))

export const roomById = (id: string) => rooms.find((r) => r.id === id)

/** Default eye-level viewpoint: stand in a corner, look at the centre. */
export function roomView(r: Room): { eye: V3; target: V3 } {
  if (r.view) return r.view
  const [x0, x1, z0, z1] = r.rect
  const y = FLOOR_Y[r.floor]
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  return { eye: [x1 - 0.7, y + 1.55, z1 - 0.7], target: [cx, y + 1.3, cz] }
}

// ───────────── Layout configurator zones ─────────────
export interface Zone {
  id: 'ground' | 'first' | 'roof' | 'terrace' | 'full'
  title: L
  /** highest floor index shown (0 ground, 1 first, 2 roof) */
  cut: 0 | 1 | 2
  status: L
  /** status dot is lit */
  ready: boolean
  blurb: L
  roomIds?: string[]
  /** area override for composite zones */
  area?: number
}

const roomsOf = (zone: Room['zone']) => rooms.filter((r) => r.zone === zone).map((r) => r.id)

export const zones: Zone[] = [
  { id: 'ground', title: l('Ground floor', 'الطابق الأرضي'), cut: 0, status: l('Available', 'متاح'), ready: true, blurb: l('Living, kitchen, dining, entrance and garage.', 'غرفة معيشة ومطبخ وطعام ومدخل وكراج.'), roomIds: roomsOf('ground') },
  { id: 'first', title: l('First floor', 'الطابق الأول'), cut: 1, status: l('Available', 'متاح'), ready: true, blurb: l('Master suite, two bedrooms and a bridge over the living room.', 'جناح رئيسي وغرفتا نوم وجسر فوق غرفة المعيشة.'), roomIds: roomsOf('first') },
  { id: 'roof', title: l('Roof', 'السطح'), cut: 2, status: l('Planned', 'قيد التخطيط'), ready: false, blurb: l('Technical rooms and a flat roof deck.', 'غرف فنية وسطح مستوٍ.'), roomIds: roomsOf('roof') },
  { id: 'terrace', title: l('Terrace & pool', 'الشرفة والمسبح'), cut: 2, status: l('Available', 'متاح'), ready: true, blurb: l('Covered terrace, pool, spa, lounge pit and garden.', 'شرفة مغطاة ومسبح وسبا ومنطقة جلوس منخفضة وحديقة.'), roomIds: roomsOf('terrace') },
  { id: 'full', title: l('Full villa', 'الفيلا كاملة'), cut: 2, status: l('Phase 1', 'المرحلة 1'), ready: true, blurb: l('The complete two-storey villa on its landscaped plot.', 'الفيلا المتكاملة من طابقين على أرضها المشجّرة.') },
]

/** Built area: indoor rooms (+ outdoor ones for the terrace and roof zones; the full villa adds the balcony). */
export const zoneArea = (z: Zone) => {
  if (z.area) return z.area
  const list = z.id === 'full' ? rooms.filter((r) => r.zone === 'ground' || r.zone === 'first') : (z.roomIds ?? []).map((id) => roomById(id)!)
  return list.filter((r) => !r.outdoor || z.id !== 'ground' && z.id !== 'first').reduce((s, r) => s + roomArea(r), 0)
}

export const zoneRoomCount = (z: Zone) =>
  z.roomIds ? z.roomIds.length : rooms.filter((r) => !r.outdoor && r.zone !== 'roof').length

// ───────────── Camera presets (see three/cameraPresets.ts) ─────────────
export const SITE = { name: 'Palm', wordmark: 'VILLA PALM', studio: 'Atelier Palm' }

/** PDF floor plan for a room (generated by `npm run plans`). */
export const planFile = (r: Room) => `plans/${{ ground: 'ground-floor', first: 'first-floor', roof: 'roof', terrace: 'terrace-pool' }[r.zone]}.pdf`

export const roomDims = (r: Room) => (r.area ? null : `${(r.rect[1] - r.rect[0]).toFixed(1)} × ${(r.rect[3] - r.rect[2]).toFixed(1)} m`)

// ═════════════════════════════════════════════════════════════════════════════
// Site content. EN + AR. All values are PLACEHOLDERS (names, numbers, contacts).
// Shaped so the whole `site` object could come from an API: `fetch('/api/villa')`.
// Arabic copy should be reviewed by a native speaker before launch.
// ═════════════════════════════════════════════════════════════════════════════

export const site = {
  brand: { wordmark: 'VILLA PALM', studio: 'Atelier Palm' },
  nav: [
    { id: 'layouts', label: l('Layouts', 'المخططات') },
    { id: 'gallery', label: l('Gallery', 'المعرض') },
    { id: 'location', label: l('Location', 'الموقع') },
    { id: 'specifications', label: l('Specifications', 'المواصفات') },
  ],
  contactCta: l('Contact us', 'تواصل معنا'),
  hero: {
    title: l('Living, layered in light', 'حياة تتشكّل بالضوء'),
    line1: l('A two-storey contemporary villa of oak, stone and glass, opening onto a turquoise pool and tropical garden.', 'فيلا معاصرة من طابقين من خشب البلوط والحجر والزجاج، تنفتح على مسبح فيروزي وحديقة استوائية.'),
    line2: l('Explore every floor, room and terrace in 3D.', 'استكشف كل طابق وكل غرفة وكل شرفة بتقنية ثلاثية الأبعاد.'),
    cta: l('Explore the layouts', 'استكشف المخططات'),
    pin: l('Palm Jumeirah, Dubai', 'نخلة جميرا، دبي'),
    scroll: l('Scroll', 'مرّر'),
    stats: [
      { value: '0.8', unit: l('km', 'كم'), label: l('to the beach', 'إلى الشاطئ') },
      { value: '3.2', unit: l('km', 'كم'), label: l('to the mall', 'إلى المركز التجاري') },
      { value: '18', unit: l('km', 'كم'), label: l('to the airport', 'إلى المطار') },
    ],
  },
  layouts: {
    eyebrow: l('01 — Layouts', '01 — المخططات'),
    title: l('Walk every floor', 'تجوّل في كل طابق'),
    lead: l('Choose a level to cut the villa open from above, then select a room to see its size, step inside, or download the plan.', 'اختر طابقًا لقطع الفيلا من الأعلى، ثم اختر غرفة لترى مساحتها أو ادخل إليها أو حمّل المخطط.'),
    rooms: l('rooms', 'غرف'),
    hint: l('Drag to orbit · click, then scroll to zoom', 'اسحب للتدوير · انقر ثم مرّر للتكبير'),
    loading: l('Loading 3D', 'جارٍ تحميل المجسم'),
    back: l('← Back to layouts', 'العودة إلى المخططات →'),
    viewInside: l('View inside', 'عرض من الداخل'),
    exitInside: l('Exit interior view', 'الخروج من العرض الداخلي'),
    plan: l('Floor plan (PDF)', 'المخطط (PDF)'),
    book: l('Book a viewing', 'احجز معاينة'),
    area: l('m² area', 'م² المساحة'),
    dims: l('dimensions', 'الأبعاد'),
    irregular: l('irregular', 'غير منتظم'),
    level: l('level', 'الطابق'),
    levels: [l('Ground floor', 'الطابق الأرضي'), l('First floor', 'الطابق الأول'), l('Roof', 'السطح'), l('Outdoor', 'خارجي')],
    presets: { front: l('Front', 'أمامي'), rear: l('Rear', 'خلفي'), left: l('Left', 'يسار'), right: l('Right', 'يمين'), top: l('Top', 'علوي'), orbit: l('Orbit', 'دوران') },
    day: l('Day', 'نهار'),
    night: l('Night', 'ليل'),
    quality: l('Quality', 'الجودة'),
    high: l('High', 'عالية'),
    low: l('Low', 'منخفضة'),
    qualityTip: l('Graphics quality (auto-detected). Low turns off glass refraction, ambient occlusion and bloom.', 'جودة الرسوميات (تُكتشف تلقائيًا). الجودة المنخفضة تُعطّل انكسار الزجاج والتظليل المحيطي والتوهج.'),
  },
  loader: { title: l('Loading the villa', 'جارٍ تحميل الفيلا'), assets: l('textures, lighting and geometry', 'الخامات والإضاءة والمجسم') },
  gallery: {
    eyebrow: l('02 — Gallery', '02 — المعرض'),
    title: l('Light, stone and oak', 'ضوء وحجر وخشب'),
    lead: l('Exterior and interior impressions.', 'لمحات من الخارج والداخل.'),
    tabs: { exterior: l('Exterior', 'خارجي'), interior: l('Interior', 'داخلي'), all: l('All', 'الكل') },
    prev: l('Previous', 'السابق'),
    next: l('Next', 'التالي'),
    close: l('Close', 'إغلاق'),
    open: l('View fullscreen', 'عرض بملء الشاشة'),
    // images live in public/images (WebP, watermark-cropped)
    items: [
      { id: 'front', tab: 'exterior', src: 'images/exterior/front.webp', w: 1920, h: 986, alt: l('Front facade at dusk', 'الواجهة الأمامية عند الغسق') },
      { id: 'aerial', tab: 'exterior', src: 'images/exterior/aerial.webp', w: 1920, h: 986, alt: l('Aerial view of the pool, garden and roof', 'منظر جوي للمسبح والحديقة والسطح') },
      { id: 'living', tab: 'interior', src: 'images/interior/living-room.webp', w: 1920, h: 986, alt: l('Double-height living room with oak slat fireplace wall', 'غرفة معيشة بارتفاع مزدوج مع جدار موقد من شرائح البلوط') },
      { id: 'kitchen', tab: 'interior', src: 'images/interior/kitchen.webp', w: 1920, h: 986, alt: l('Kitchen with stone waterfall island', 'مطبخ مع جزيرة حجرية متدفقة') },
      { id: 'master', tab: 'interior', src: 'images/interior/master-bedroom.webp', w: 1920, h: 986, alt: l('Master bedroom with oak slat headboard wall', 'غرفة النوم الرئيسية مع جدار رأس سرير من شرائح البلوط') },
    ] as { id: string; tab: 'exterior' | 'interior'; src: string; w: number; h: number; alt: L }[],
  },
  location: {
    eyebrow: l('03 — Location', '03 — الموقع'),
    title: l('Everything within minutes', 'كل شيء على بُعد دقائق'),
    lead: l('Beaches, marinas, schools and shopping close by, with the airport under twenty minutes away.', 'شواطئ ومراسٍ ومدارس ومتاجر قريبة، والمطار على بُعد أقل من عشرين دقيقة.'),
    address: l('Frond N, Palm Jumeirah, Dubai', 'الجذع شمال، نخلة جميرا، دبي'),
    // placeholder map query: swap for the real plot
    mapQuery: 'Palm Jumeirah, Dubai',
    mapTitle: l('Map showing the villa location', 'خريطة توضح موقع الفيلا'),
    openMap: l('Open in Google Maps', 'افتح في خرائط جوجل'),
    unit: l('km', 'كم'),
    places: [
      { icon: 'beach', name: l('Beach', 'الشاطئ'), km: 0.8 },
      { icon: 'school', name: l('School', 'المدرسة'), km: 1.6 },
      { icon: 'mall', name: l('Mall', 'المركز التجاري'), km: 3.2 },
      { icon: 'hospital', name: l('Hospital', 'المستشفى'), km: 4.1 },
      { icon: 'airport', name: l('Airport', 'المطار'), km: 18 },
      { icon: 'metro', name: l('Metro', 'المترو'), km: 2.4 },
      { icon: 'park', name: l('Park', 'الحديقة'), km: 0.6 },
      { icon: 'marina', name: l('Marina', 'المرسى'), km: 2 },
    ],
  },
  specs: {
    eyebrow: l('04 — Specifications', '04 — المواصفات'),
    title: l('Built to last', 'مبنيّة لتدوم'),
    lead: l('The systems and materials behind the design.', 'الأنظمة والمواد وراء التصميم.'),
    items: [
      { icon: 'walls', title: l('Walls', 'الجدران'), text: l('Reinforced concrete frame with insulated block infill, finished in mineral render and board-formed charcoal concrete.', 'هيكل خرساني مسلّح مع جدران بلوك معزولة، بتشطيب بياض معدني وخرسانة فحمية.') },
      { icon: 'insulation', title: l('Insulation', 'العزل'), text: l('Continuous exterior insulation and thermal-break details keep wall U-values below 0.25 W/m²K.', 'عزل خارجي متواصل وتفاصيل قاطعة للجسور الحرارية تُبقي معامل انتقال الحرارة للجدران دون 0.25 واط/م²·ك.') },
      { icon: 'glazing', title: l('Glazing', 'الزجاج'), text: l('Slim black aluminium frames with laminated low-E double glazing and floor-to-ceiling sliding doors.', 'إطارات ألمنيوم سوداء رفيعة وزجاج مزدوج مطبّق منخفض الانبعاثية وأبواب منزلقة من الأرض إلى السقف.') },
      { icon: 'roof', title: l('Roof', 'السقف'), text: l('Flat inverted roof with a waterproof membrane, concealed drainage and deep oak-soffit overhangs.', 'سقف مستوٍ معكوس بغشاء مانع للماء وتصريف مخفي وبروزات عميقة بباطن من البلوط.') },
      { icon: 'facade', title: l('Facade', 'الواجهة'), text: l('A charcoal concrete frame, beige render, and thermally treated oak slats and fins.', 'إطار خرساني فحمي وبياض بيج وشرائح وزعانف من البلوط المعالج حراريًا.') },
      { icon: 'cooling', title: l('Cooling', 'التبريد'), text: l('Variable-refrigerant HVAC with concealed cassettes, heat-recovery ventilation and a solar-ready plant room.', 'تكييف متغير التدفق بوحدات مخفية وتهوية باسترداد الحرارة وغرفة معدات جاهزة للطاقة الشمسية.') },
      { icon: 'smart', title: l('Smart home', 'المنزل الذكي'), text: l('Lighting scenes, climate, shading, pool and security on one system, controlled from an app.', 'مشاهد إضاءة ومناخ وتظليل ومسبح وأمن على نظام واحد يُدار عبر تطبيق.') },
      { icon: 'installations', title: l('Installations', 'التمديدات'), text: l('Pre-wired for EV charging and a pool heat pump, with rainwater harvesting and underfloor heating.', 'تمديدات مسبقة لشحن السيارات الكهربائية ومضخة حرارية للمسبح، مع حصاد مياه الأمطار وتدفئة أرضية.') },
      { icon: 'slabs', title: l('Slabs', 'البلاطات'), text: l('Post-tensioned concrete slabs enable the 2.5 m cantilever and open spans of up to 8 m.', 'بلاطات خرسانية مسبقة الإجهاد تتيح كابولي بطول 2.5 م وبحورًا مفتوحة تصل إلى 8 م.') },
    ],
  },
  contact: {
    eyebrow: l('05 — Contact', '05 — تواصل'),
    title: l("Let's talk", 'لنتحدّث'),
    lead: l('Tell us what you are looking for. We reply within one working day.', 'أخبرنا بما تبحث عنه. نردّ خلال يوم عمل واحد.'),
    name: l('Name', 'الاسم'),
    email: l('Email', 'البريد الإلكتروني'),
    message: l('Message', 'الرسالة'),
    attach: l('Attachment', 'مرفق'),
    attachHint: l('PDF, image or Word · max 5 MB', 'PDF أو صورة أو Word · الحد الأقصى 5 ميغابايت'),
    choose: l('Choose file', 'اختر ملفًا'),
    remove: l('Remove', 'إزالة'),
    send: l('Send', 'إرسال'),
    sending: l('Sending…', 'جارٍ الإرسال…'),
    bookCall: l('Book a call', 'احجز مكالمة'),
    consent: l('I agree that Atelier Palm may contact me about my enquiry and store my details for that purpose. My data will not be shared with third parties.', 'أوافق على أن تتواصل معي Atelier Palm بخصوص استفساري وأن تحتفظ ببياناتي لهذا الغرض. لن تُشارك بياناتي مع أطراف أخرى.'),
    errors: {
      name: l('Please enter your name.', 'يرجى إدخال اسمك.'),
      email: l('Please enter a valid email address.', 'يرجى إدخال بريد إلكتروني صحيح.'),
      message: l('Please write a short message (at least 10 characters).', 'يرجى كتابة رسالة قصيرة (10 أحرف على الأقل).'),
      file: l('This file is too large. The maximum is 5 MB.', 'الملف كبير جدًا. الحد الأقصى 5 ميغابايت.'),
      fileType: l('Unsupported file type. Use PDF, JPG, PNG, WebP or Word.', 'نوع الملف غير مدعوم. استخدم PDF أو JPG أو PNG أو WebP أو Word.'),
      consent: l('Please accept the consent statement to continue.', 'يرجى الموافقة على إقرار الموافقة للمتابعة.'),
      failed: l('Something went wrong. Please try again.', 'حدث خطأ ما. يرجى المحاولة مرة أخرى.'),
    },
    success: { title: l('Thank you', 'شكرًا لك'), text: l('Your message is on its way. We will be in touch within one working day.', 'رسالتك في الطريق. سنتواصل معك خلال يوم عمل واحد.'), callText: l('We will call you to arrange a time.', 'سنتصل بك لتحديد موعد.'), again: l('Send another message', 'إرسال رسالة أخرى') },
    viewingPrefill: l('I would like to book a viewing of: ', 'أرغب في حجز معاينة لـ: '),
    blocks: {
      write: { title: l('Write to us', 'راسلنا'), value: 'hello@villapalm.example' },
      call: { title: l('Call us', 'اتصل بنا'), value: '+971 4 000 0000' },
      address: { title: l('Address', 'العنوان'), value: l('Atelier Palm, Frond N, Palm Jumeirah, Dubai', 'أتيليه بالم، الجذع شمال، نخلة جميرا، دبي') },
    },
  },
  projects: {
    eyebrow: l('06 — Other projects', '06 — مشاريع أخرى'),
    title: l('More from the studio', 'المزيد من الاستوديو'),
    // placeholder projects
    items: [
      { name: 'Villa Cedar', type: l('5-bedroom villa', 'فيلا 5 غرف نوم'), area: 620, status: l('Under construction', 'قيد الإنشاء') },
      { name: 'Villa Dune', type: l('4-bedroom villa', 'فيلا 4 غرف نوم'), area: 480, status: l('Completed', 'مكتمل') },
      { name: 'Villa Marina', type: l('6-bedroom villa', 'فيلا 6 غرف نوم'), area: 790, status: l('Planned', 'قيد التخطيط') },
      { name: 'Villa Orchid', type: l('3-bedroom townhouse', 'تاون هاوس 3 غرف نوم'), area: 310, status: l('Completed', 'مكتمل') },
    ],
    areaUnit: l('m²', 'م²'),
  },
  footer: {
    rights: l('© 2026 Atelier Palm. All rights reserved.', '© 2026 Atelier Palm. جميع الحقوق محفوظة.'),
    phone: '+971 4 000 0000',
    email: 'hello@villapalm.example',
  },
  a11y: { menu: l('Menu', 'القائمة'), closeMenu: l('Close menu', 'إغلاق القائمة'), skip: l('Skip to content', 'انتقل إلى المحتوى'), language: l('Language', 'اللغة') },
}
