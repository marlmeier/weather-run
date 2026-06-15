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
    sunny: { dist: 5.2, elev: 14, surface: 'Paved', diff: 'Easy', diffN: 2, effort: 3, pace: 5.5,
      note: 'Clear & dry — full city loop unlocked.', warn: [],
      segs: [['Flat street', 1], ['Gentle rise', 3], ['Riverside path', 1], ['Short climb', 4], ['Flat finish', 1]] },
    rainy: { dist: 4.0, elev: 10, surface: 'Slick paved', diff: 'Moderate', diffN: 3, effort: 5, pace: 6.1,
      note: 'Rain detected — shorter, sheltered reroute active.', warn: ['Underpass flooding avoided', 'Reduced 5.2 → 4.0 km'],
      segs: [['Covered arcade', 1, 'w'], ['Gentle rise', 2], ['Riverside (muddy)', 1, 'w'], ['Underpass reroute', 2, 'w'], ['Flat finish', 1]] },
    windy: { dist: 5.0, elev: 14, surface: 'Paved', diff: 'Moderate', diffN: 3, effort: 4, pace: 5.8,
      note: 'Gusts 28 km/h — headwind segments flagged.', warn: ['Embankment exposed to crosswind'],
      segs: [['Flat street', 1, 'x'], ['Gentle rise', 3, 'x'], ['Exposed embankment', 2, 'x'], ['Short climb', 4], ['Flat finish', 1, 'x']] },
  },
  trail: {
    sunny: { dist: 4.6, elev: 80, surface: 'Rocky', diff: 'Hard', diffN: 4, effort: 7, pace: 7.4,
      note: 'Dry rock — full 80 m summit line open.', warn: [],
      segs: [['Forest approach', 5], ['Switchbacks', 9], ['Summit push', 13], ['Rocky descent', -7], ['Cooldown trail', 3]] },
    rainy: { dist: 3.6, elev: 54, surface: 'Slick rock', diff: 'Severe', diffN: 5, effort: 8, pace: 8.3,
      note: 'Rain on rock — summit scramble CLOSED, safe reroute.', warn: ['Summit scramble closed (wet rock)', 'Elevation cut 80 → 54 m'],
      segs: [['Forest approach', 4, 'w'], ['Lower switchbacks', 7], ['Reroute traverse', 8, 'w'], ['Careful descent', -5, 'w'], ['Cooldown trail', 2]] },
    windy: { dist: 4.4, elev: 80, surface: 'Rocky', diff: 'Hard', diffN: 4, effort: 8, pace: 7.8,
      note: 'Ridge gusts — exposed summit needs extra effort.', warn: ['Summit ridge wind-exposed'],
      segs: [['Forest approach', 5], ['Exposed switchbacks', 9, 'x'], ['Summit push (gusts)', 13, 'x'], ['Rocky descent', -7], ['Cooldown trail', 3, 'x']] },
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
    locationLabel: { city: 'City Streets', trail: 'Steep Rocky Trail' }[location],
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
