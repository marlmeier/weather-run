import React from 'react'

function catmullClosed(p) {
  const n = p.length
  const g = i => p[((i % n) + n) % n]
  let d = `M${g(0)[0].toFixed(1)},${g(0)[1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2)
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d + 'Z'
}

function CityBase({ T, sy, H }) {
  const sl = { stroke: T.base, strokeWidth: 1.4 }
  return (
    <g>
      <g {...sl}>
        {[44, 112, 182, 250].map(x => <line key={'v' + x} x1={x} y1="4" x2={x} y2={H - 4} />)}
        {[46, 104, 158].map(y => <line key={'h' + y} x1="6" y1={y * sy} x2="294" y2={y * sy} />)}
      </g>
      <line x1="6" y1={70 * sy} x2="294" y2={150 * sy} stroke={T.water} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <rect x="150" y={92 * sy} width="74" height={52 * sy} rx="7" fill={T.park} />
    </g>
  )
}

function TrailBase({ T, sy }) {
  const cx = 150, cy = 102 * sy
  return (
    <g fill="none" stroke={T.base} strokeWidth="1.4">
      {[[120, 70], [86, 50], [54, 32], [26, 16]].map(([rx, ry], i) =>
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry * sy} transform={`rotate(-14 ${cx} ${cy})`} />
      )}
    </g>
  )
}

export default function RouteMap({ state, height = 160, theme = {}, mods = {} }) {
  const T = {
    route: '#fff', casing: 'rgba(15,30,45,.4)', steep: '#ffd27d', node: '#fff',
    nodeStroke: 'rgba(15,30,45,.5)', start: '#ffd27d', startText: '#16283a',
    text: 'rgba(255,255,255,.92)', base: 'rgba(255,255,255,.18)', water: 'rgba(255,255,255,.26)',
    park: 'rgba(255,255,255,.1)', strokeW: 3.2,
    ...theme
  }
  const H = height, W = 300
  const city = state.location === 'city'
  const cfg = city
    ? { pts: [[60,150],[60,95],[95,60],[150,55],[215,72],[250,120],[205,165],[120,168]], wp: [1,3,4,6,7] }
    : { pts: [[55,170],[80,135],[60,100],[95,75],[140,55],[195,90],[230,135],[160,172]], wp: [1,2,4,5,7] }
  const sy = H / 200
  const P = cfg.pts.map(p => [p[0], p[1] * sy])
  const n = P.length

  let summit = 0
  state.segments.forEach((s, i) => { if (s.gradePct > state.segments[summit].gradePct) summit = i })
  const summitPi = cfg.wp[summit]
  const pathPts = P.map(p => [...p])

  if (mods.skipSummit) {
    const a = P[(summitPi - 1 + n) % n], b = P[(summitPi + 1) % n]
    pathPts[summitPi] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  }

  const d = catmullClosed(pathPts)
  const st = pathPts[0]

  const marks = cfg.wp.map((pi, i) => {
    const seg = state.segments[i]
    const skipped = mods.skipSummit && i === summit
    const p = pathPts[pi]
    const steep = seg.energyTarget >= 8 && !skipped
    const desc = seg.gradePct < 0
    const r = steep ? 7.5 : 5.5
    const fill = skipped ? 'transparent' : (desc ? T.start : (steep ? T.steep : T.node))
    return (
      <g key={i} opacity={skipped ? 0.45 : 1}>
        <text x={p[0]} y={p[1] - 12} fontFamily="'JetBrains Mono',monospace" fontSize="10"
          fontWeight="700" textAnchor="middle" fill={steep ? T.steep : T.text}>
          {skipped ? 'skip' : (steep ? `${i + 1}▲` : (i + 1))}
        </text>
        <circle cx={p[0]} cy={p[1]} r={r} fill={fill}
          stroke={steep ? T.steep : T.nodeStroke} strokeWidth="2"
          strokeDasharray={skipped ? '3 3' : undefined} />
      </g>
    )
  })

  const ghost = mods.skipSummit ? (() => {
    const a = P[(summitPi - 1 + n) % n], pk = P[summitPi], b = P[(summitPi + 1) % n]
    return <path d={`M${a[0]},${a[1]} Q${pk[0]},${pk[1]} ${b[0]},${b[1]}`}
      fill="none" stroke={T.text} strokeWidth="1.6" strokeDasharray="3 4" opacity="0.45" />
  })() : null

  const loop = mods.loop ? (() => {
    const cx = Math.min(st[0] + 32, W - 26), cy = st[1] - 6, rx = 20, ry = 13 * sy
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={T.casing} strokeWidth={T.strokeW + 4.5} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={T.route} strokeWidth={T.strokeW} />
        <text x={cx} y={cy - ry - 5} fontFamily="'JetBrains Mono',monospace" fontSize="9"
          fontWeight="700" textAnchor="middle" fill={T.route}>+loop</text>
      </g>
    )
  })() : null

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {city ? <CityBase T={T} sy={sy} H={H} /> : <TrailBase T={T} sy={sy} />}
      {ghost}
      <path d={d} fill="none" stroke={T.casing} strokeWidth={T.strokeW + 4.5}
        strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke={T.route} strokeWidth={T.strokeW}
        strokeLinejoin="round" strokeLinecap="round" />
      {loop}
      {marks}
      <circle cx={st[0]} cy={st[1]} r="9" fill={T.start} stroke={T.route} strokeWidth="2.5" />
      <text x={st[0]} y={st[1] + 3.4} fontFamily="'JetBrains Mono',monospace"
        fontSize="9" fontWeight="700" textAnchor="middle" fill={T.startText}>S</text>
    </svg>
  )
}
