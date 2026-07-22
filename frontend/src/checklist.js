// Ported 1:1 from the prototype's tagsFor/itemsFor/roomStat (PRD §9).

const ROOM_TAGS = {
  entrance: ['ENTRANCE', 'DRY'],
  living: ['DRY'],
  dining: ['DRY'],
  bedroom: ['DRY'],
  toilet: ['WET'],
  kitchen: ['KITCHEN'],
  utility: ['UTILITY'],
  balcony: ['BALCONY'],
}

export const ROOM_ICON = {
  entrance: 'ph ph-door-open',
  living: 'ph ph-couch',
  dining: 'ph ph-fork-knife',
  kitchen: 'ph ph-cooking-pot',
  utility: 'ph ph-washing-machine',
  bedroom: 'ph ph-bed',
  toilet: 'ph ph-toilet',
  balcony: 'ph ph-tree',
}

export const CAT_ICON = {
  'Doors': 'ph ph-door',
  'Windows': 'ph ph-app-window',
  'Flooring': 'ph ph-grid-nine',
  'Walls & Painting': 'ph ph-paint-roller',
  'Electrical': 'ph ph-lightning',
  'Plumbing': 'ph ph-drop',
  'Granite/Stone': 'ph ph-diamond',
  'Skirting': 'ph ph-ruler-horizontal',
  'Kitchen': 'ph ph-cooking-pot',
  'Balcony': 'ph ph-tree',
}

export function tagsFor(type) {
  return ['ALL', ...(ROOM_TAGS[type] || [])]
}

export function itemsFor(room, checklist) {
  const tags = tagsFor(room.type)
  return checklist.filter((m) => m.applies.some((a) => tags.includes(a)))
}

export function roomStat(room, checklist, responses) {
  const cells = responses[room.key] || {}
  const items = itemsFor(room, checklist)
  let done = 0
  let issues = 0
  items.forEach((m) => {
    const c = cells[m.id]
    if (c && c.response) done++
    if (c) issues += c.issues.length
  })
  return { total: items.length, done, issues, complete: done === items.length }
}

export function freshResponses(rooms, checklist) {
  const R = {}
  rooms.forEach((room) => {
    R[room.key] = {}
    itemsFor(room, checklist).forEach((m) => {
      R[room.key][m.id] = { response: null, skip_reason: '', issues: [] }
    })
  })
  return R
}
