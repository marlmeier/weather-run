/* ===========================================================================
   ENGINE — Wizard-of-Oz simulation.
   Given (weather, location) produce an illustrative, believable state object
   that every prototype renders. Numbers shift on control changes; songs are
   matched so high-energy tracks land on steep / high-effort segments.
   =========================================================================== */
(function () {
  'use strict';

  var SONGS = [
    { title: 'Sprint Anthem',  bpm: 178, energy: 9, dance: 8, familiarity: 'High', comp: 'Med',  lang: 'Roman / ES' },
    { title: 'Power Push',     bpm: 172, energy: 8, dance: 7, familiarity: 'Med',  comp: 'High', lang: 'Germanic / EN' },
    { title: 'Climb Driver',   bpm: 164, energy: 8, dance: 6, familiarity: 'High', comp: 'Low',  lang: 'Roman / IT' },
    { title: 'Steady Groove',  bpm: 150, energy: 6, dance: 7, familiarity: 'High', comp: 'High', lang: 'Roman / ES' },
    { title: 'Cruise Pop',     bpm: 138, energy: 5, dance: 6, familiarity: 'Med',  comp: 'Med',  lang: 'Slavic / PL' },
    { title: 'Flow State',     bpm: 126, energy: 4, dance: 5, familiarity: 'Low',  comp: 'Low',  lang: 'Nordic / SV' },
    { title: 'Cooldown Calm',  bpm: 108, energy: 3, dance: 4, familiarity: 'Med',  comp: 'High', lang: 'Roman / FR' }
  ];

  // route + segment templates keyed by location → weather
  var T = {
    city: {
      sunny: { dist: 5.2, elev: 14, surface: 'Paved', diff: 'Easy', diffN: 2, effort: 3, pace: 5.5,
        note: 'Clear & dry — full city loop unlocked.', warn: [],
        segs: [ ['Flat street', 1], ['Gentle rise', 3], ['Riverside path', 1], ['Short climb', 4], ['Flat finish', 1] ] },
      rainy: { dist: 4.0, elev: 10, surface: 'Slick paved', diff: 'Moderate', diffN: 3, effort: 5, pace: 6.1,
        note: 'Rain detected — shorter, sheltered reroute active.', warn: ['Underpass flooding avoided', 'Reduced 5.2 → 4.0 km'],
        segs: [ ['Covered arcade', 1, 'w'], ['Gentle rise', 2], ['Riverside (muddy)', 1, 'w'], ['Underpass reroute', 2, 'w'], ['Flat finish', 1] ] },
      windy: { dist: 5.0, elev: 14, surface: 'Paved', diff: 'Moderate', diffN: 3, effort: 4, pace: 5.8,
        note: 'Gusts 28 km/h — headwind segments flagged.', warn: ['Embankment exposed to crosswind'],
        segs: [ ['Flat street', 1, 'x'], ['Gentle rise', 3, 'x'], ['Exposed embankment', 2, 'x'], ['Short climb', 4], ['Flat finish', 1, 'x'] ] }
    },
    trail: {
      sunny: { dist: 4.6, elev: 80, surface: 'Rocky', diff: 'Hard', diffN: 4, effort: 7, pace: 7.4,
        note: 'Dry rock — full 80 m summit line open.', warn: [],
        segs: [ ['Forest approach', 5], ['Switchbacks', 9], ['Summit push', 13], ['Rocky descent', -7], ['Cooldown trail', 3] ] },
      rainy: { dist: 3.6, elev: 54, surface: 'Slick rock', diff: 'Severe', diffN: 5, effort: 8, pace: 8.3,
        note: 'Rain on rock — summit scramble CLOSED, safe reroute.', warn: ['Summit scramble closed (wet rock)', 'Elevation cut 80 → 54 m'],
        segs: [ ['Forest approach', 4, 'w'], ['Lower switchbacks', 7], ['Reroute traverse', 8, 'w'], ['Careful descent', -5, 'w'], ['Cooldown trail', 2] ] },
      windy: { dist: 4.4, elev: 80, surface: 'Rocky', diff: 'Hard', diffN: 4, effort: 8, pace: 7.8,
        note: 'Ridge gusts — exposed summit needs extra effort.', warn: ['Summit ridge wind-exposed'],
        segs: [ ['Forest approach', 5], ['Exposed switchbacks', 9, 'x'], ['Summit push (gusts)', 13, 'x'], ['Rocky descent', -7], ['Cooldown trail', 3, 'x'] ] }
    }
  };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function energyTarget(grade, flag, baseEffort) {
    var e;
    if (grade < 0) e = 3 + Math.abs(grade) * 0.2;            // descent → recovery
    else e = 3 + grade * 0.55;                                // climb → push
    if (flag === 'x') e += 1.5;                               // wind-exposed → more drive
    e += (baseEffort - 3) * 0.22;
    return clamp(Math.round(e), 1, 10);
  }

  function assignSongs(segs) {
    var pool = SONGS.map(function (s, i) { return { i: i, s: s }; });
    var used = {}, map = {};
    // satisfy highest-energy segments first
    var order = segs.slice().sort(function (a, b) { return b.energyTarget - a.energyTarget; });
    order.forEach(function (seg) {
      var best = -1, bestD = 1e9;
      pool.forEach(function (p) {
        if (used[p.i]) return;
        var d = Math.abs(p.s.energy - seg.energyTarget);
        if (d < bestD) { bestD = d; best = p.i; }
      });
      used[best] = 1; map[seg.idx] = SONGS[best];
    });
    return segs.map(function (seg) {
      var s = map[seg.idx];
      return { seg: seg.idx, title: s.title, bpm: s.bpm, energy: s.energy,
        dance: s.dance, familiarity: s.familiarity, comp: s.comp, lang: s.lang,
        match: Math.max(0, 100 - Math.abs(s.energy - seg.energyTarget) * 14) };
    });
  }

  function derive(weather, location) {
    var cfg = T[location][weather];
    var segs = cfg.segs.map(function (row, i) {
      var grade = row[1], flag = row[2] || null;
      return {
        idx: i + 1, label: row[0], gradePct: grade, flag: flag,
        distKm: +(cfg.dist / cfg.segs.length).toFixed(2),
        energyTarget: energyTarget(grade, flag, cfg.effort),
        warning: flag === 'w'
      };
    });
    var playlist = assignSongs(segs);
    var durationMin = Math.round(cfg.dist * cfg.pace);
    var paceMin = Math.floor(cfg.pace), paceSec = Math.round((cfg.pace - paceMin) * 60);
    return {
      weather: weather, location: location,
      weatherLabel: { sunny: 'Sunny', rainy: 'Rainy', windy: 'Windy' }[weather],
      locationLabel: { city: 'City Streets', trail: 'Steep Rocky Trail' }[location],
      weatherNote: cfg.note,
      warnings: cfg.warn,
      route: {
        distanceKm: cfg.dist, elevationM: cfg.elev, surface: cfg.surface,
        difficulty: cfg.diff, difficultyN: cfg.diffN, effort: cfg.effort,
        durationMin: durationMin, calories: Math.round(cfg.dist * 58 * (cfg.effort / 5)),
        pace: paceMin + ':' + String(paceSec).padStart(2, '0') + '/km',
        avgBpm: Math.round(playlist.reduce(function (a, p) { return a + p.bpm; }, 0) / playlist.length)
      },
      segments: segs,
      playlist: playlist,
      profile: { name: 'Runner — [profile]', level: 'Intermediate', weeklyKm: 24, fav: 'Roman / ES tracks' }
    };
  }

  window.ENGINE = { derive: derive, SONGS: SONGS };
})();
