// Dumps room data to JSON so make-plans.py can draw the PDF floor plans from the same source as the 3D model.
import { writeFileSync } from 'node:fs'
import { rooms, roomArea } from '../src/data/villa'
writeFileSync('scripts/.plan-data.json', JSON.stringify(rooms.map((r) => ({ id: r.id, floor: r.floor, zone: r.zone, name: r.name.en, rect: r.rect, area: roomArea(r), outdoor: !!r.outdoor }))))
