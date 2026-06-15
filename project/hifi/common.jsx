/* common.jsx — shared hi-fi building blocks for the 3 Proto-4 directions.
   Reuses window.ENGINE (js/engine.js). Exports to window: RouteMap,
   useReorder, weatherMeta, WeatherIcon. */

/* ---- weather → display meta (temps are illustrative) ---- */
function weatherMeta(w) {
  return {
    sunny: { temp: '24°', label: 'Sunny', sub: 'Clear skies' },
    rainy: { temp: '13°', label: 'Rain', sub: 'Steady rain' },
    windy: { temp: '17°', label: 'Windy', sub: 'Strong breeze' }
  }[w];
}

/* ---- tiny weather icons (simple geometry only) ---- */
function WeatherIcon({ w, size = 22, color = 'currentColor', stroke = 2 }) {
  const s = size;
  if (w === 'sunny') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
      <circle cx="12" cy="12" r="4.4" fill={color} stroke="none" />
      {[0,45,90,135,180,225,270,315].map(a => { const r1=7.5,r2=10.2,rad=a*Math.PI/180;
        return <line key={a} x1={12+r1*Math.cos(rad)} y1={12+r1*Math.sin(rad)} x2={12+r2*Math.cos(rad)} y2={12+r2*Math.sin(rad)} />; })}
    </svg>);
  if (w === 'rainy') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
      <path d="M7 13a4 4 0 0 1 .4-8 5 5 0 0 1 9.5 1.3A3.4 3.4 0 0 1 17 13H7Z" />
      <line x1="8.5" y1="16" x2="7.5" y2="19" /><line x1="12" y1="16" x2="11" y2="19.5" /><line x1="15.5" y1="16" x2="14.5" y2="19" />
    </svg>);
  return ( // windy
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
      <path d="M3 9h11a2.5 2.5 0 1 0-2.5-2.5" /><path d="M3 13h14a2.5 2.5 0 1 1-2.5 2.5" /><path d="M3 17h7" />
    </svg>);
}

/* ---- drag-to-reorder hook (HTML5 DnD, live swap on hover) ---- */
function useReorder(n, resetKey) {
  const [order, setOrder] = React.useState(() => Array.from({ length: n }, (_, i) => i));
  React.useEffect(() => { setOrder(Array.from({ length: n }, (_, i) => i)); }, [resetKey, n]);
  const from = React.useRef(null);
  const [dragPos, setDragPos] = React.useState(null);
  const bind = (pos) => ({
    draggable: true,
    onDragStart: (e) => { from.current = pos; setDragPos(pos); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(pos)); } catch (x) {} },
    onDragOver: (e) => {
      e.preventDefault();
      const f = from.current; if (f == null || f === pos) return;
      setOrder((o) => { const a = o.slice(); const [m] = a.splice(f, 1); a.splice(pos, 0, m); from.current = pos; return a; });
      setDragPos(pos);
    },
    onDragEnd: () => { from.current = null; setDragPos(null); }
  });
  return { order, bind, dragPos };
}

/* ---- realistic route map ----
   Smooth GPS-style loop (Catmull-Rom) with a casing stroke, a faint map base
   (streets for city, contour rings for trail), and push-zone flags on the
   steep segments. All colors come from the `theme` object. */
function catmullClosed(p) {
  const n = p.length, g = (i) => p[((i % n) + n) % n];
  let d = `M${g(0)[0].toFixed(1)},${g(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}

function cityBase(T, sy, H) {
  const sl = { stroke: T.base, strokeWidth: 1.4 };
  return (
    <g>
      <g {...sl}>
        {[44, 112, 182, 250].map(x => <line key={'v' + x} x1={x} y1="4" x2={x} y2={H - 4} />)}
        {[46, 104, 158].map(y => <line key={'h' + y} x1="6" y1={y * sy} x2="294" y2={y * sy} />)}
      </g>
      <line x1="6" y1={70 * sy} x2="294" y2={150 * sy} stroke={T.water} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <rect x="150" y={92 * sy} width="74" height={52 * sy} rx="7" fill={T.park} />
    </g>);
}

function trailBase(T, sy, H) {
  const cx = 150, cy = 102 * sy;
  return (
    <g fill="none" stroke={T.base} strokeWidth="1.4">
      {[[120, 70], [86, 50], [54, 32], [26, 16]].map(([rx, ry], i) =>
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry * sy} transform={`rotate(-14 ${cx} ${cy})`} />)}
    </g>);
}

function routeMods(state, mods) {
  mods = mods || {};
  let maxG = 0, second = 0;
  state.segments.forEach(s => { if (s.gradePct > maxG) { second = maxG; maxG = s.gradePct; } else if (s.gradePct > second) second = s.gradePct; });
  const dist = +(state.route.distanceKm + (mods.loop ? 0.6 : 0)).toFixed(1);
  const elev = state.route.elevationM - (mods.skipSummit ? (state.location === 'trail' ? 22 : 8) : 0);
  return { distanceKm: dist, elevationM: Math.max(0, elev), maxGrade: mods.skipSummit ? second : maxG };
}

function RouteMap({ state, height = 160, theme = {}, mods = {} }) {
  const T = Object.assign({
    route: '#111', casing: 'rgba(255,255,255,.75)', steep: '#e8602c', node: '#111', nodeStroke: '#fff',
    start: '#fff', startText: '#111', text: '#333', base: 'rgba(0,0,0,.10)', water: 'rgba(70,120,170,.30)',
    park: 'rgba(120,165,95,.16)', strokeW: 4
  }, theme);
  const H = height, W = 300, city = state.location === 'city';
  const cfg = city
    ? { pts: [[60, 150], [60, 95], [95, 60], [150, 55], [215, 72], [250, 120], [205, 165], [120, 168]], wp: [1, 3, 4, 6, 7] }
    : { pts: [[55, 170], [80, 135], [60, 100], [95, 75], [140, 55], [195, 90], [230, 135], [160, 172]], wp: [1, 2, 4, 5, 7] };
  const sy = H / 200;
  const P = cfg.pts.map(p => [p[0], p[1] * sy]);
  const n = P.length;
  // steepest segment -> its waypoint
  let summit = 0; state.segments.forEach((s, i) => { if (s.gradePct > state.segments[summit].gradePct) summit = i; });
  const summitPi = cfg.wp[summit];
  const pathPts = P.map(p => p.slice());
  if (mods.skipSummit) {
    const a = P[(summitPi - 1 + n) % n], b = P[(summitPi + 1) % n];
    pathPts[summitPi] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  }
  const d = catmullClosed(pathPts);
  const st = pathPts[0];

  const marks = cfg.wp.map((pi, i) => {
    const seg = state.segments[i], skipped = mods.skipSummit && i === summit;
    const p = pathPts[pi], steep = seg.energyTarget >= 8 && !skipped, desc = seg.gradePct < 0;
    const r = steep ? 7.5 : 5.5, fill = skipped ? 'transparent' : (desc ? T.start : (steep ? T.steep : T.node));
    return (
      <g key={i} opacity={skipped ? 0.45 : 1}>
        <text x={p[0]} y={p[1] - 12} fontFamily="'JetBrains Mono',monospace" fontSize="10" fontWeight="700" textAnchor="middle" fill={steep ? T.steep : T.text}>{skipped ? 'skip' : (steep ? (i + 1) + '\u25b2' : (i + 1))}</text>
        <circle cx={p[0]} cy={p[1]} r={r} fill={fill} stroke={steep ? T.steep : T.nodeStroke} strokeWidth="2" strokeDasharray={skipped ? '3 3' : undefined} />
      </g>);
  });

  const ghost = mods.skipSummit ? (() => {
    const a = P[(summitPi - 1 + n) % n], pk = P[summitPi], b = P[(summitPi + 1) % n];
    return <path d={`M${a[0]},${a[1]} Q${pk[0]},${pk[1]} ${b[0]},${b[1]}`} fill="none" stroke={T.text} strokeWidth="1.6" strokeDasharray="3 4" opacity="0.45" />;
  })() : null;

  const loop = mods.loop ? (() => {
    const cx = Math.min(st[0] + 32, W - 26), cy = st[1] - 6, rx = 20, ry = 13 * sy;
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={T.casing} strokeWidth={T.strokeW + 4.5} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={T.route} strokeWidth={T.strokeW} />
        <text x={cx} y={cy - ry - 5} fontFamily="'JetBrains Mono',monospace" fontSize="9" fontWeight="700" textAnchor="middle" fill={T.route}>+loop</text>
      </g>);
  })() : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {city ? cityBase(T, sy, H) : trailBase(T, sy, H)}
      {ghost}
      <path d={d} fill="none" stroke={T.casing} strokeWidth={T.strokeW + 4.5} strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke={T.route} strokeWidth={T.strokeW} strokeLinejoin="round" strokeLinecap="round" />
      {loop}
      {marks}
      <circle cx={st[0]} cy={st[1]} r="9" fill={T.start} stroke={T.route} strokeWidth="2.5" />
      <text x={st[0]} y={st[1] + 3.4} fontFamily="'JetBrains Mono',monospace" fontSize="9" fontWeight="700" textAnchor="middle" fill={T.startText}>S</text>
    </svg>);
}

Object.assign(window, { weatherMeta, WeatherIcon, useReorder, RouteMap, routeMods });
