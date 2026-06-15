/* ===========================================================================
   APP — wires the strategy toggle + shared environment sidebar to the active
   prototype. State persists in localStorage so refreshes keep your place.
   =========================================================================== */
(function () {
  'use strict';

  var KEY = 'run-wf-v1';
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}

  var ui = {
    proto: Number.isInteger(saved.proto) ? saved.proto : 0,
    weather: saved.weather || 'sunny',
    location: saved.location || 'city'
  };
  if (ui.proto < 0 || ui.proto > 4) ui.proto = 0;

  function persist() { try { localStorage.setItem(KEY, JSON.stringify(ui)); } catch (e) {} }

  /* ---------- strategy tabs ---------- */
  function renderTabs() {
    var el = document.getElementById('tabs');
    el.innerHTML = window.PROTOS.map(function (p, i) {
      return '<button class="tab' + (i === ui.proto ? ' active' : '') + '" data-p="' + i + '">' +
        '<div class="tn">PROTO ' + (i + 1) + '</div>' +
        '<div class="tt">' + p.name + '</div>' +
        '<div class="tn" style="font-weight:400;text-transform:none;letter-spacing:0">' + p.tagline + '</div>' +
        '</button>';
    }).join('');
    el.querySelectorAll('.tab').forEach(function (b) {
      b.addEventListener('click', function () { ui.proto = +b.dataset.p; persist(); renderAll(); });
    });
  }

  /* ---------- shared environment sidebar ---------- */
  function dotsRow(n, max) {
    var s = ''; for (var i = 0; i < (max || 10); i++) s += '<i class="' + (i < n ? 'f' : '') + '"></i>'; return '<div class="dots">' + s + '</div>';
  }

  function renderEnv(state) {
    var r = state.route;
    var weatherBtns = [['sunny', '☀ Sunny'], ['rainy', '☂ Rainy'], ['windy', '≋ Windy']].map(function (w) {
      return '<button class="' + (ui.weather === w[0] ? 'sel' : '') + '" data-w="' + w[0] + '">' + w[1] + '</button>';
    }).join('');
    var locBtns = [['city', 'City Streets'], ['trail', 'Steep Trail']].map(function (l) {
      return '<button class="' + (ui.location === l[0] ? 'sel' : '') + '" data-l="' + l[0] + '">' + l[1] + '</button>';
    }).join('');

    var env = document.getElementById('env');
    env.innerHTML = '' +
      '<h2>Environment</h2>' +
      '<div class="sub">Wizard-of-Oz · drives all 5 protos</div>' +

      '<div class="ctl"><div class="lab">Weather</div><div class="seg">' + weatherBtns + '</div></div>' +
      '<div class="ctl"><div class="lab">Location / Terrain</div><div class="seg bw">' + locBtns + '</div></div>' +

      '<div class="readout">' +
        '<div class="lab" style="font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-soft);margin-bottom:8px">Generated telemetry →</div>' +
        roRow('Distance', r.distanceKm + ' km') +
        roRow('Length / time', r.durationMin + ' min · ' + r.pace) +
        roRow('Elevation', r.elevationM + ' m ↑') +
        roRow('Surface', r.surface) +
        roRow('Difficulty', r.difficultyN + ' / 5') +
        '<div class="ro-row"><span class="k">Incline (max)</span><span class="v">' + maxGrade(state) + '%</span></div>' +
        '<div class="ro-row"><span class="k">Effort</span><span class="v" style="display:flex;align-items:center;gap:7px">' + r.effort + '/10 ' + dotsRow(r.effort) + '</span></div>' +
        roRow('Avg tempo', r.avgBpm + ' bpm') +
      '</div>' +

      '<div class="ro-note box tight" style="padding:10px 11px;margin-top:14px">' +
        '<div class="tag" style="margin-bottom:5px">CONTEXT</div>' +
        '<div class="note" style="color:var(--ink)">' + state.weatherNote + '</div>' +
        (state.warnings.length ? '<div style="margin-top:8px;display:flex;flex-direction:column;gap:5px">' +
          state.warnings.map(function (w) { return '<div class="note" style="color:#8a330c;font-size:12.5px">⚠ ' + w + '</div>'; }).join('') + '</div>' : '') +
      '</div>' +

      '<div class="ro-note" style="margin-top:14px">' +
        '<div class="tag" style="margin-bottom:6px">RUNNER PROFILE</div>' +
        '<div class="note" style="color:var(--ink-soft);font-size:13px">' + state.profile.level + ' · ' + state.profile.weeklyKm + ' km/wk · likes ' + state.profile.fav + '</div>' +
      '</div>';

    env.querySelectorAll('[data-w]').forEach(function (b) {
      b.addEventListener('click', function () { ui.weather = b.dataset.w; persist(); renderAll(); });
    });
    env.querySelectorAll('[data-l]').forEach(function (b) {
      b.addEventListener('click', function () { ui.location = b.dataset.l; persist(); renderAll(); });
    });
  }

  function roRow(k, v) { return '<div class="ro-row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
  function maxGrade(state) {
    return state.segments.reduce(function (m, s) { return Math.max(m, s.gradePct); }, 0);
  }

  /* ---------- phone shell ---------- */
  function statusbar(state) {
    var g = { sunny: '☀', rainy: '☂', windy: '≋' }[state.weather];
    return '<div class="statusbar"><span>9:41</span><span>' + g + ' ' + state.weatherLabel + ' · ' + state.locationLabel + '</span><span class="mono">▮▮▮ 82%</span></div>';
  }
  function phoneShell(p, state, idx) {
    return '<div class="phone-wrap">' +
      '<div class="phone"><div class="screen" id="screen">' + statusbar(state) +
        '<div class="screen-body" id="screen-body">' + p.render(state) + '</div></div>' +
        '<div class="home-ind"></div></div>' +
      '<div class="caption box" style="padding:12px 15px">' +
        '<div class="between"><strong style="font-weight:400;font-size:16px">Proto ' + (idx + 1) + ' — ' + p.name + '</strong>' +
        '<span class="badge">' + p.tagline + '</span></div>' +
        '<div class="annot note" style="margin-top:8px">' + p.intent + '</div></div>' +
    '</div>';
  }

  /* ---------- master render ---------- */
  function renderAll() {
    if (typeof window.__cleanup === 'function') { window.__cleanup(); window.__cleanup = null; }
    var state = window.ENGINE.derive(ui.weather, ui.location);
    renderTabs();
    renderEnv(state);
    var stage = document.getElementById('stage');
    var p = window.PROTOS[ui.proto];
    stage.innerHTML = phoneShell(p, state, ui.proto);
    var body = stage.querySelector('#screen-body');
    if (typeof p.mount === 'function') p.mount(state, body || stage);
    var scrim = document.getElementById('scrim');
    if (scrim) scrim.classList.remove('show');
  }

  document.addEventListener('DOMContentLoaded', renderAll);
})();
