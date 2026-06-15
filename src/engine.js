const SONGS = [
  { title: 'Sprint Anthem',  bpm: 178, energy: 9 },
  { title: 'Power Push',     bpm: 172, energy: 8 },
  { title: 'Climb Driver',   bpm: 164, energy: 8 },
  { title: 'Steady Groove',  bpm: 150, energy: 6 },
  { title: 'Cruise Pop',     bpm: 138, energy: 5 },
  { title: 'Flow State',     bpm: 126, energy: 4 },
  { title: 'Cooldown Calm',  bpm: 108, energy: 3 },
]

const TEMPLATES = {
  city: {
    // Embarcadero Loop, San Francisco
    sunny: { dist: 5.2, elev: 14, surface: 'Paved', diff: 'Easy', diffN: 2, effort: 3, pace: 5.5,
      note: 'Clear skies — full Embarcadero loop to Aquatic Park unlocked.', warn: [],
      segs: [['Ferry Bldg → Pier 7', 1], ['Pier 17 rise', 3], ['Pier 39 stretch', 1], ['Wharf → Aquatic Park', 4], ['Columbus return', 1]] },
    rainy: { dist: 4.0, elev: 10, surface: 'Slick paved', diff: 'Moderate', diffN: 3, effort: 5, pace: 6.1,
      note: 'Rain off the Bay — sheltered arcade reroute active.', warn: ['Waterfront exposed — staying inland', 'Loop shortened 5.2 → 4.0 km'],
      segs: [['Covered Ferry arcade', 1, 'w'], ['Pier 7 rise', 2], ['Sheltered mid-section', 1, 'w'], ['Taylor St reroute', 2, 'w'], ['Beach St finish', 1]] },
    windy: { dist: 5.0, elev: 14, surface: 'Paved', diff: 'Moderate', diffN: 3, effort: 4, pace: 5.8,
      note: 'Bay gusts 28 km/h — exposed pier sections flagged.', warn: ['Embarcadero open to Bay crosswind'],
      segs: [['Ferry Bldg → Pier 7', 1, 'x'], ['Pier 17 rise', 3, 'x'], ['Exposed piers', 2, 'x'], ['Pier 39 stretch', 4], ['Columbus return', 1, 'x']] },
  },
  trail: {
    // Tennessee Valley Trail, Marin Headlands
    sunny: { dist: 4.6, elev: 80, surface: 'Packed dirt', diff: 'Hard', diffN: 4, effort: 7, pace: 7.4,
      note: 'Dry trail — full ridge summit to Tennessee Beach open.', warn: [],
      segs: [['Valley floor', 5], ['Lower switchbacks', 9], ['Summit push', 13], ['Ridge descent', -7], ['Beach flats', 3]] },
    rainy: { dist: 3.6, elev: 54, surface: 'Muddy trail', diff: 'Severe', diffN: 5, effort: 8, pace: 8.3,
      note: 'Rain on trail — upper ridge CLOSED, valley reroute active.', warn: ['Upper scramble closed (mud/slick)', 'Elevation cut 80 → 54 m'],
      segs: [['Valley floor', 4, 'w'], ['Lower switchbacks', 7], ['Reroute traverse', 8, 'w'], ['Careful descent', -5, 'w'], ['Beach flats', 2]] },
    windy: { dist: 4.4, elev: 80, surface: 'Packed dirt', diff: 'Hard', diffN: 4, effort: 8, pace: 7.8,
      note: 'Ridge gusts — summit exposed, high effort required.', warn: ['Summit ridge wind-exposed'],
      segs: [['Valley floor', 5], ['Exposed switchbacks', 9, 'x'], ['Summit push (gusts)', 13, 'x'], ['Ridge descent', -7], ['Beach flats', 3, 'x']] },
  },
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

function energyTarget(grade, flag, baseEffort) {
  let e = grade < 0 ? 3 + Math.abs(grade) * 0.2 : 3 + grade * 0.55
  if (flag === 'x') e += 1.5
  e += (baseEffort - 3) * 0.22
  return clamp(Math.round(e), 1, 10)
}

function assignSongs(segs) {
  const pool = SONGS.map((s, i) => ({ i, s }))
  const used = {}, map = {}
  const order = [...segs].sort((a, b) => b.energyTarget - a.energyTarget)
  order.forEach(seg => {
    let best = -1, bestD = 1e9
    pool.forEach(p => {
      if (used[p.i]) return
      const d = Math.abs(p.s.energy - seg.energyTarget)
      if (d < bestD) { bestD = d; best = p.i }
    })
    used[best] = 1
    map[seg.idx] = SONGS[best]
  })
  return segs.map(seg => {
    const s = map[seg.idx]
    return { seg: seg.idx, title: s.title, bpm: s.bpm, energy: s.energy }
  })
}

export function derive(weather, location) {
  const cfg = TEMPLATES[location][weather]
  const segs = cfg.segs.map((row, i) => {
    const grade = row[1], flag = row[2] || null
    return { idx: i + 1, label: row[0], gradePct: grade, flag,
      energyTarget: energyTarget(grade, flag, cfg.effort), warning: flag === 'w' }
  })
  const playlist = assignSongs(segs)
  const durationMin = Math.round(cfg.dist * cfg.pace)
  return {
    weather, location,
    locationLabel: location === 'city' ? 'Embarcadero Loop' : 'Tennessee Valley Trail',
    locationSub:   location === 'city' ? 'San Francisco, CA' : 'Marin Headlands, CA',
    weatherNote: cfg.note,
    warnings: cfg.warn,
    route: { distanceKm: cfg.dist, elevationM: cfg.elev, surface: cfg.surface,
      difficulty: cfg.diff, durationMin },
    segments: segs,
    playlist,
  }
}

export function routeMods(state, mods = {}) {
  let maxG = 0, second = 0
  state.segments.forEach(s => {
    if (s.gradePct > maxG) { second = maxG; maxG = s.gradePct }
    else if (s.gradePct > second) second = s.gradePct
  })
  const dist = +(state.route.distanceKm + (mods.loop ? 0.6 : 0)).toFixed(1)
  const elev = state.route.elevationM - (mods.skipSummit ? (state.location === 'trail' ? 22 : 8) : 0)
  return { distanceKm: dist, elevationM: Math.max(0, elev), maxGrade: mods.skipSummit ? second : maxG }
}
