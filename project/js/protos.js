/* ===========================================================================
   PROTOS — 5 distinct PHONE-APP wireframe strategies. Each is { name, tagline,
   intent, render(state)->screenHtml, mount(state, root) }. Low-fi: structure &
   flow, b&w + one safety-orange accent. The running ROUTE is drawn for real.
   =========================================================================== */
(function () {
  'use strict';

  var INK = '#1c1b18', SOFT = '#6b6760', ACC = '#df551d', PAPER = '#f4f3ee', PANEL = '#fbfaf6';

  /* ---------- shared html helpers ---------- */
  function ph(label, h) { return '<div class="ph" style="height:' + h + 'px">[ ' + label + ' ]</div>'; }
  function bar(pct, acc) { return '<div class="bar ' + (acc ? 'acc' : '') + '"><i style="width:' + pct + '%"></i></div>'; }
  function dots(n, max) { var s = ''; for (var i = 0; i < (max || 10); i++) s += '<i class="' + (i < n ? 'f' : '') + '"></i>'; return '<div class="dots">' + s + '</div>'; }
  function energyChip(e) { return '<span class="badge"><b class="num">E' + e + '</b></span>'; }

  // tiny elevation sparkline
  function elevation(segs, w, h, stroke) {
    var cum = [0], y = 0; segs.forEach(function (s) { y += s.gradePct; cum.push(y); });
    var min = Math.min.apply(null, cum), max = Math.max.apply(null, cum), span = (max - min) || 1, n = cum.length, pad = 5;
    var pts = cum.map(function (v, i) {
      var x = pad + (w - 2 * pad) * (i / (n - 1));
      var yy = (h - pad) - (h - 2 * pad) * ((v - min) / span);
      return x.toFixed(1) + ',' + yy.toFixed(1);
    }).join(' ');
    return '<svg width="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none"><polyline points="' + pts + '" fill="none" stroke="' + (stroke || INK) + '" stroke-width="2.5" stroke-linejoin="round"/></svg>';
  }

  /* ---------- THE ROUTE MAP (the thing the user wanted to see) ---------- */
  function routeMap(s, h, opts) {
    opts = opts || {};
    var H = h || 210, W = 300, city = s.location === 'city';
    var pts = city
      ? [[46, H - 40], [46, H - 116], [104, H - 150], [190, H - 142], [244, H - 94], [150, H - 38]]
      : [[58, H - 38], [98, H - 74], [70, H - 110], [126, H - 156], [190, H - 102], [150, H - 42]];
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      if (city) d += ' L' + pts[i][0] + ',' + pts[i][1];
      else { var p = pts[i - 1], c = pts[i]; d += ' Q' + p[0] + ',' + c[1] + ' ' + ((p[0] + c[0]) / 2) + ',' + ((p[1] + c[1]) / 2) + ' T' + c[0] + ',' + c[1]; }
    }
    var close = 'M' + pts[pts.length - 1][0] + ',' + pts[pts.length - 1][1] + ' L' + pts[0][0] + ',' + pts[0][1];
    var marks = '';
    for (var j = 1; j < pts.length; j++) {
      var seg = s.segments[j - 1], steep = seg.energyTarget >= 8, desc = seg.gradePct < 0;
      var r = steep ? 7 : 5, fill = desc ? PAPER : (steep ? ACC : INK);
      marks += '<text x="' + pts[j][0] + '" y="' + (pts[j][1] - 11) + '" font-family="Spline Sans Mono,monospace" font-size="10" text-anchor="middle" fill="' + INK + '">' + j + '</text>';
      marks += '<circle cx="' + pts[j][0] + '" cy="' + pts[j][1] + '" r="' + r + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="1.5"/>';
    }
    var st = pts[0];
    var start = '<circle cx="' + st[0] + '" cy="' + st[1] + '" r="8.5" fill="' + PANEL + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<text x="' + st[0] + '" y="' + (st[1] + 3.5) + '" font-family="Spline Sans Mono,monospace" font-size="9" font-weight="700" text-anchor="middle" fill="' + INK + '">S</text>';
    var playhead = opts.playhead ? '<circle cx="' + pts[2][0] + '" cy="' + pts[2][1] + '" r="4" fill="' + ACC + '"><animate attributeName="r" values="4;9;4" dur="1.4s" repeatCount="indefinite"/></circle>' : '';
    var bg = city
      ? 'repeating-linear-gradient(0deg,rgba(28,27,24,.06) 0 19px,transparent 19px 20px),repeating-linear-gradient(90deg,rgba(28,27,24,.06) 0 19px,transparent 19px 20px)'
      : 'repeating-linear-gradient(58deg,rgba(28,27,24,.05) 0 11px,transparent 11px 24px)';
    return '<div style="position:relative;border:1.5px solid ' + INK + ';border-radius:8px;overflow:hidden;background:' + bg + ',' + PANEL + '">' +
      '<svg width="100%" viewBox="0 0 ' + W + ' ' + H + '" style="display:block">' +
        '<path d="' + close + '" fill="none" stroke="' + SOFT + '" stroke-width="1.5" stroke-dasharray="3 4"/>' +
        '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>' +
        start + marks + playhead +
      '</svg>' +
      (opts.noChips ? '' :
        '<div class="badge" style="position:absolute;left:8px;bottom:7px">' + (city ? '⌗ ' : '⛰ ') + s.locationLabel + '</div>' +
        '<div class="badge on mono" style="position:absolute;right:8px;bottom:7px">' + s.route.distanceKm + ' km · ' + s.route.elevationM + 'm</div>') +
      (opts.legend === false ? '' : '<div class="badge" style="position:absolute;right:8px;top:7px">● steep = orange</div>') +
    '</div>';
  }

  function metricBox(label, val, sub) {
    return '<div class="box tight" style="flex:1;padding:8px 9px;display:flex;flex-direction:column;justify-content:center">' +
      '<div class="tag">' + label + '</div><div class="big" style="font-size:18px;margin:2px 0 1px">' + val + '</div><div class="tag">' + sub + '</div></div>';
  }
  function appbar(title, right) {
    return '<div class="appbar"><h4>' + title + '</h4><div class="row" style="gap:6px;align-items:center">' + (right || '') + '</div></div>';
  }
  function warnStrip(s) {
    if (!s.warnings.length) return '';
    return '<div style="display:flex;flex-direction:column;gap:6px;margin:10px 0">' +
      s.warnings.map(function (w) { return '<div class="badge warn" style="justify-content:flex-start">⚠ ' + w + '</div>'; }).join('') + '</div>';
  }

  /* =========================================================================
     P1 — Functional Dashboard (Strava-style)
     ========================================================================= */
  var P1 = {
    name: 'Functional Dashboard', tagline: 'Strava-style · data-first',
    intent: 'Hi-fi: charcoal dark mode, safety-orange accents, sharp data legibility — route + telemetry front & centre, distraction minimised.',
    render: function (s) {
      var r = s.route;
      var metrics = [['DIST', r.distanceKm + ' km'], ['ELEV', r.elevationM + ' m'], ['EFFORT', r.effort + '/10']]
        .map(function (m) { return '<div class="box tight" style="flex:1;padding:9px 10px;text-align:center"><div class="tag">' + m[0] + '</div><div class="big" style="font-size:21px;margin-top:3px">' + m[1] + '</div></div>'; }).join('');
      var tracks = s.playlist.map(function (p, i) {
        var seg = s.segments[i];
        return '<div class="between" style="padding:8px 0;border-top:1.5px solid var(--muted)">' +
          '<div class="row" style="gap:9px;align-items:center;min-width:0"><span class="num" style="color:var(--accent)">' + (seg.gradePct >= 0 ? '+' : '') + seg.gradePct + '%</span>' +
          '<div style="min-width:0"><div style="font-size:14px">' + p.title + '</div><div class="tag">' + p.lang + ' · ' + p.bpm + ' bpm</div></div></div>' +
          energyChip(p.energy) + '</div>';
      }).join('');
      return appbar('Today\u2019s Route', '<span class="badge mono">GPS ●</span>') +
        routeMap(s, 200) +
        '<div class="row" style="gap:8px;margin-top:12px">' + metrics + '</div>' +
        '<div class="box tight" style="padding:10px 11px;margin-top:10px"><div class="between" style="margin-bottom:6px"><span class="tag">Elevation profile</span><span class="tag">' + r.pace + '</span></div>' +
          '<div style="height:62px">' + elevation(s.segments, 320, 60, ACC) + '</div></div>' +
        '<div class="between" style="margin:14px 0 2px"><span class="tag">Playlist · energy-matched to grade</span><span class="tag">avg ' + r.avgBpm + '</span></div>' +
        tracks +
        '<div class="box" style="position:sticky;bottom:0;margin-top:12px;padding:9px 11px;display:flex;align-items:center;gap:10px;background:var(--ink);color:var(--paper);border-color:var(--ink)">' +
          '<span style="font-size:18px">▶</span><div style="flex:1;min-width:0"><div style="font-size:14px">' + s.playlist[0].title + '</div><div class="tag" style="color:#bdb9b0">seg 1 · ' + s.segments[0].label + '</div></div><span class="mono" style="font-size:12px">' + s.playlist[0].bpm + '</span></div>';
    }
  };

  /* =========================================================================
     P2 — Immersive Audio Feed (Spotify-style)
     ========================================================================= */
  var P2 = {
    name: 'Immersive Audio Feed', tagline: 'Spotify-style · music-first',
    intent: 'Hi-fi: deep-black glassmorphism, neon-green glow tinted by the active song\u2019s language family. Music is the hero — the route lives in a collapsible peek.',
    render: function (s) {
      var now = s.playlist[0];
      var feed = s.segments.map(function (seg, i) {
        var p = s.playlist[i];
        var vibe = seg.gradePct < 0 ? 'Recover' : seg.energyTarget >= 8 ? 'Push' : seg.energyTarget >= 6 ? 'Drive' : 'Cruise';
        return '<div class="box tight" style="padding:11px 12px;margin-bottom:9px">' +
          '<div class="between"><span class="badge">VIBE · ' + vibe + '</span><span class="tag">' + (seg.gradePct >= 0 ? '+' : '') + seg.gradePct + '% · E' + seg.energyTarget + '</span></div>' +
          '<div class="row" style="gap:10px;align-items:center;margin:9px 0 8px"><div class="ph" style="width:42px;height:42px;flex:none">ART</div>' +
            '<div style="flex:1;min-width:0"><div style="font-size:15px">' + p.title + '</div><div class="tag">' + p.lang + ' · ' + p.bpm + ' bpm</div></div>' +
            '<span class="badge on mono">' + p.match + '%</span></div>' +
          '<div class="grid" style="grid-template-columns:1fr 1fr;gap:8px"><div><div class="tag" style="margin-bottom:3px">Dance ' + p.dance + '/10</div>' + bar(p.dance * 10, true) + '</div>' +
            '<div><div class="tag" style="margin-bottom:3px">Familiar · ' + p.familiarity + '</div>' + bar(p.familiarity === 'High' ? 90 : p.familiarity === 'Med' ? 55 : 25) + '</div></div></div>';
      }).join('');
      return appbar('Run Feed', '<span class="badge on">' + now.lang + '</span>') +
        '<div class="box" style="padding:14px;margin-bottom:12px;background:repeating-linear-gradient(135deg,rgba(28,27,24,.05) 0 9px,transparent 9px 20px)">' +
          '<div class="row" style="gap:13px;align-items:center"><div class="ph" style="width:88px;height:88px;flex:none;font-size:10px">album<br/>glow:<br/>' + now.lang + '</div>' +
            '<div style="flex:1;min-width:0"><div class="tag">NOW PLAYING · seg 1</div><div style="font-size:24px;line-height:1.05;margin:3px 0">' + now.title + '</div>' +
            '<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:5px"><span class="badge">' + now.bpm + ' BPM</span>' + energyChip(now.energy) + '</div></div></div></div>' +
        '<details class="box tight" style="padding:10px 12px;margin-bottom:12px"><summary class="mono" style="cursor:pointer;font-size:11px;text-transform:uppercase;letter-spacing:.05em">▸ Route peek (secondary)</summary>' +
          '<div style="margin-top:10px">' + routeMap(s, 150, { legend: false }) + warnStrip(s) + '</div></details>' +
        '<div class="tag" style="margin-bottom:9px">ROUTE AS VIBE SEGMENTS — feel the run ↓</div>' + feed;
    }
  };

  /* =========================================================================
     P3 — Minimalist HUD (Context-alert)
     ========================================================================= */
  var P3 = {
    name: 'Minimalist HUD', tagline: 'Context-alert · safety-first',
    intent: 'Hi-fi: clean light mode, huge type, dynamic status badges. The Environmental Context Tracker reroutes the instant weather changes.',
    render: function (s) {
      var r = s.route, rainy = s.weather === 'rainy';
      return appbar('Companion', '<span class="badge ' + (rainy ? 'warn' : 'on') + '">' + s.weatherLabel + '</span>') +
        '<div class="box" style="border-color:var(--accent);box-shadow:3px 3px 0 var(--accent-soft);padding:13px">' +
          '<div class="between" style="margin-bottom:9px"><span class="tag" style="color:var(--accent)">⬤ CONTEXT TRACKER</span><span class="mono" style="font-size:10px">reroute ' + (rainy ? 'ON' : 'standby') + '</span></div>' +
          '<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:9px"><span class="badge">' + s.locationLabel + '</span><span class="badge">' + r.surface + '</span><span class="badge ' + (r.difficultyN >= 4 ? 'warn' : '') + '">diff ' + r.difficultyN + '/5</span></div>' +
          '<div class="note" style="color:var(--ink)">' + s.weatherNote + '</div>' + warnStrip(s) + '</div>' +
        '<div class="row" style="gap:18px;margin:18px 2px;flex-wrap:wrap;align-items:flex-end">' +
          '<div><div class="tag">DISTANCE</div><div class="big" style="font-size:52px">' + r.distanceKm + '<span style="font-size:18px"> km</span></div></div>' +
          '<div><div class="tag">EFFORT</div><div class="big" style="font-size:52px">' + r.effort + '<span style="font-size:18px">/10</span></div></div></div>' +
        routeMap(s, 180, { legend: false }) +
        '<div class="between" style="margin:14px 0 8px"><span class="tag">PLAYLIST · climbs the energy</span><span class="mono" style="font-size:11px">' + r.avgBpm + ' bpm</span></div>' +
        '<div style="display:flex;gap:7px;overflow-x:auto;padding-bottom:4px">' +
          s.playlist.map(function (p, i) { var seg = s.segments[i]; return '<div class="box tight" style="flex:none;width:128px;padding:9px 10px"><div class="num" style="font-size:12px;color:var(--accent)">' + (seg.gradePct >= 0 ? '+' : '') + seg.gradePct + '%</div><div style="font-size:13px;line-height:1.1;margin:2px 0 3px">' + p.title + '</div><div class="tag">' + p.bpm + ' · E' + p.energy + '</div></div>'; }).join('') + '</div>';
    }
  };

  /* =========================================================================
     P4 — Co-Curation Canvas (Participant-led, drag-reorder)
     ========================================================================= */
  var P4 = {
    name: 'Co-Curation Canvas', tagline: 'Participant-led · high agency',
    intent: 'Hi-fi: editorial soft grid, pastel/clay tones. Handles Familiarity vs Comprehension — boost Roman/Spanish or swap disliked tracks before you run.',
    render: function (s) {
      var cards = s.playlist.map(function (p, i) {
        var seg = s.segments[i];
        return '<div class="box tight curate-card" draggable="true" data-i="' + i + '" style="padding:10px 11px;margin-bottom:8px;cursor:grab;background:#fbf6ee">' +
          '<div class="between"><span class="tag">⠿ seg ' + p.seg + ' · ' + seg.label + '</span><span class="tag">' + (seg.gradePct >= 0 ? '+' : '') + seg.gradePct + '%→E' + seg.energyTarget + '</span></div>' +
          '<div class="between" style="margin-top:6px"><div style="min-width:0"><div style="font-size:15px">' + p.title + '</div><div class="tag">' + p.lang + ' · ' + p.bpm + '</div></div>' +
          '<div class="row" style="gap:5px"><button class="mini-boost badge" data-i="' + i + '">fam ↑</button><button class="mini-swap badge" data-i="' + i + '">swap ✕</button></div></div></div>';
      }).join('');
      var devs = [['+0.6 km river loop', 'flat recovery stretch'], ['Skip steep summit', s.location === 'trail' ? 'cuts ~22 m climb' : 'cuts short climb'], ['Scenic detour', 'viewpoint · +3 min']]
        .map(function (d) { return '<label class="box tight" style="display:flex;gap:9px;align-items:flex-start;padding:9px 11px;margin-bottom:7px;cursor:pointer"><input type="checkbox" style="margin-top:3px;width:15px;height:15px"/><div><div style="font-size:14px">' + d[0] + '</div><div class="tag">' + d[1] + '</div></div></label>'; }).join('');
      var keyMetrics = '<div style="flex:0 0 94px;display:flex;flex-direction:column;gap:7px">' +
        metricBox('LENGTH', s.route.distanceKm + ' km', s.route.durationMin + ' min') +
        metricBox('ELEV', s.route.elevationM + ' m', '↑ gain') +
        metricBox('DIFF', s.route.difficultyN + '/5', s.route.surface) + '</div>';
      return appbar('Build Your Run', '<span class="badge" id="p4-msg">drag to reorder</span>') +
        '<div style="display:flex;gap:9px;align-items:stretch">' + keyMetrics +
          '<div style="flex:1;min-width:0">' + routeMap(s, 150, { legend: false }) + '</div></div>' +
        '<div class="tag" style="margin:12px 0 7px">ROUTE DEVIATIONS · opt in before running</div>' + devs +
        '<div class="box" style="padding:11px 12px;margin:12px 0"><div class="tag" style="margin-bottom:7px">MOTIVATION DIAL · manual language boost</div>' +
          '<div class="row" style="gap:6px;flex-wrap:wrap"><span class="badge on">Roman/ES ↑</span><span class="badge">Roman/IT</span><span class="badge">Roman/FR</span><span class="badge" style="opacity:.5">Nordic/SV ↓</span></div></div>' +
        '<div class="between" style="margin:6px 0 9px"><span class="tag">YOUR PLAYLIST · drag to re-sequence</span><span class="badge">' + s.playlist.length + '</span></div>' +
        '<div id="p4-list">' + cards + '</div>' +
        '<div class="annot note">Re-sequencing overrides the auto energy-match — participant has final say.</div>';
    },
    mount: function (s, root) {
      var list = root.querySelector('#p4-list'), msg = root.querySelector('#p4-msg');
      if (!list) return;
      var dragEl = null;
      list.addEventListener('dragstart', function (e) { var c = e.target.closest('.curate-card'); if (!c) return; dragEl = c; setTimeout(function () { c.style.opacity = '.35'; }, 0); });
      list.addEventListener('dragend', function () { if (dragEl) dragEl.style.opacity = ''; dragEl = null; });
      list.addEventListener('dragover', function (e) {
        e.preventDefault(); if (!dragEl) return;
        var els = [].slice.call(list.querySelectorAll('.curate-card')).filter(function (c) { return c !== dragEl; });
        var after = els.reduce(function (cl, ch) { var b = ch.getBoundingClientRect(); var o = e.clientY - b.top - b.height / 2; return (o < 0 && o > cl.off) ? { off: o, el: ch } : cl; }, { off: -Infinity, el: null }).el;
        if (after == null) list.appendChild(dragEl); else list.insertBefore(dragEl, after);
        if (msg) msg.textContent = 'edited ✓';
      });
      root.querySelectorAll('.mini-boost').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); b.classList.toggle('on'); b.textContent = b.classList.contains('on') ? 'boosted ✓' : 'fam ↑'; }); });
      root.querySelectorAll('.mini-swap').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); var c = b.closest('.curate-card'); c.style.opacity = '.4'; c.style.textDecoration = 'line-through'; if (msg) msg.textContent = 'swapped ✓'; }); });
    }
  };

  /* =========================================================================
     P5 — Analytics Twin (Stage 6 evaluation)
     ========================================================================= */
  var P5 = {
    name: 'Analytics Twin', tagline: 'Stage 6 · stated vs revealed',
    intent: 'Hi-fi: cyberpunk technical layout — mono fonts, wireframe lines, grid backdrop. Tests the Stated-vs-Revealed preference gap; live packets stream to the Data Foundry API.',
    render: function (s) {
      return appbar('Eval Twin', '<span class="badge on mono">REC ●</span>') +
        '<div class="box tight" style="padding:11px 12px;margin-bottom:11px"><div class="tag" style="margin-bottom:8px">◧ SIMULATED RUN · ' + s.locationLabel + ' / ' + s.weatherLabel + '</div>' +
          routeMap(s, 160, { playhead: true, legend: false, noChips: true }) +
          '<div class="mono" style="font-size:11px;margin-top:8px">playhead → seg 2 · ' + s.segments[1].label + ' · ' + s.playlist[1].title + '</div></div>' +
        '<div class="box" style="padding:11px 12px;background:#15140f;color:#e8e6df;border-color:#15140f">' +
          '<div class="between" style="margin-bottom:8px"><span class="tag" style="color:#9be39b">◨ DATA FOUNDRY API</span><span class="mono" style="font-size:10px;color:#7d8a7d" id="p5-count">0 sent</span></div>' +
          '<div id="p5-ticker" class="mono" style="font-size:10.5px;line-height:1.65;height:150px;overflow:hidden;white-space:nowrap"></div></div>' +
        '<button id="p5-end" class="box tight" style="width:100%;margin-top:12px;padding:12px;cursor:pointer;background:var(--accent);color:#fff;border-color:var(--line);font-family:var(--hand);font-size:17px">⏹ End Run → Capture Survey</button>' +
        '<div class="annot note" style="margin-top:10px">Ending the run fires the \u0394-questionnaire to compare what the runner said vs what the data revealed.</div>';
    },
    mount: function (s, root) {
      var ticker = root.querySelector('#p5-ticker'), counter = root.querySelector('#p5-count'), n = 0;
      var kinds = ['gps.fix', 'hr.sample', 'cadence', 'audio.energy', 'grade.delta', 'pref.signal', 'skip.event'];
      function packet() {
        if (!ticker) return; n++;
        var k = kinds[(Math.random() * kinds.length) | 0], seg = s.segments[(Math.random() * s.segments.length) | 0];
        var line = document.createElement('div');
        line.innerHTML = '<span style="color:#7d8a7d">' + String(Date.now()).slice(-6) + '</span> <span style="color:#9be39b">' + k + '</span> seg' + seg.idx + ' v=' + (Math.random() * 100).toFixed(1) + ' <span style="color:#df8a55">⇢ ingest</span>';
        ticker.insertBefore(line, ticker.firstChild);
        while (ticker.childNodes.length > 9) ticker.removeChild(ticker.lastChild);
        if (counter) counter.textContent = n + ' sent';
      }
      for (var i = 0; i < 6; i++) packet();
      var iv = setInterval(packet, 950);
      window.__cleanup = function () { clearInterval(iv); };
      var end = root.querySelector('#p5-end');
      if (end) end.addEventListener('click', function () { openSurvey(s); });
    }
  };

  function openSurvey(s) {
    var scrim = document.getElementById('scrim');
    function slider(id, label, lo, hi) {
      return '<div style="margin-bottom:13px"><div class="between"><span class="tag">' + label + '</span><span class="num" id="' + id + 'v">0</span></div>' +
        '<input type="range" min="-5" max="5" value="0" id="' + id + '" style="width:100%"/>' +
        '<div class="between"><span class="tag">' + lo + '</span><span class="tag">' + hi + '</span></div></div>';
    }
    scrim.innerHTML = '<div class="modal"><div class="between" style="margin-bottom:6px"><h3 class="sec" style="margin:0"><span class="hash">\u0394</span> Post-Run Survey</h3><button id="sv-x" class="badge" style="cursor:pointer">✕</button></div>' +
      '<div class="note" style="margin-bottom:15px">Stage 6 protocol — composite \u0394 vs your stated pre-run baseline. Context: ' + s.locationLabel + ' / ' + s.weatherLabel + '.</div>' +
      slider('dm', '\u0394 Mood', 'worse', 'better') + slider('dmo', '\u0394 Motivation', 'drained', 'driven') + slider('de', '\u0394 Energy', 'depleted', 'charged') +
      '<div class="box tight" style="padding:10px 12px;margin:4px 0 15px;display:flex;justify-content:space-between;align-items:center"><span class="tag">COMPOSITE \u0394 INDEX</span><span class="big" id="sv-comp" style="font-size:24px">0.0</span></div>' +
      '<button id="sv-submit" class="box tight" style="width:100%;padding:11px;cursor:pointer;background:var(--ink);color:var(--paper);border-color:var(--line);font-family:var(--hand);font-size:17px">Log to Data Foundry →</button></div>';
    scrim.classList.add('show');
    var ids = ['dm', 'dmo', 'de'];
    function upd() { var sum = 0; ids.forEach(function (id) { var v = +document.getElementById(id).value; document.getElementById(id + 'v').textContent = (v > 0 ? '+' : '') + v; sum += v; }); document.getElementById('sv-comp').textContent = (sum / 3).toFixed(1); }
    ids.forEach(function (id) { document.getElementById(id).addEventListener('input', upd); });
    document.getElementById('sv-x').addEventListener('click', function () { scrim.classList.remove('show'); });
    scrim.addEventListener('click', function (e) { if (e.target === scrim) scrim.classList.remove('show'); });
    document.getElementById('sv-submit').addEventListener('click', function () {
      document.querySelector('.modal').innerHTML = '<div style="text-align:center;padding:18px"><div class="big" style="font-size:38px;color:var(--accent)">✓</div><h3 class="sec" style="justify-content:center;margin:8px 0">Logged.</h3><div class="note">\u0394 packet sealed → <span class="mono">foundry/ingest/survey</span>. Stated-vs-revealed gap ready for analysis.</div><button id="sv-close" class="box tight" style="margin-top:16px;padding:9px 18px;cursor:pointer;font-family:var(--hand);font-size:16px">Close</button></div>';
      document.getElementById('sv-close').addEventListener('click', function () { scrim.classList.remove('show'); });
    });
  }

  window.PROTOS = [P1, P2, P3, P4, P5];
})();
