/* style-performance.jsx — Direction 1: dark, high-contrast, "performancey".
   iPhone-17 ratio. Deviations reshape the route + metrics live. */

function PerformanceScreen({ state }) {
  const { RouteMap, useReorder, weatherMeta, WeatherIcon, routeMods } = window;
  const C = { bg: '#0b0d10', surf: '#14181d', surf2: '#1b2026', line: '#272e36', ink: '#f2f4f6', mut: '#7e8893', acc: '#ff5a24' };
  const wm = weatherMeta(state.weather);
  const { order, bind, dragPos } = useReorder(state.playlist.length, state.weather + state.location);
  const [dev, setDev] = React.useState({ loop: true, summit: false, scenic: false });
  const toggle = (k) => setDev(s => ({ ...s, [k]: !s[k] }));
  const mods = { loop: dev.loop, skipSummit: dev.summit };
  const adj = routeMods(state, mods);
  const devs = [
    { k: 'loop', icon: '+', label: 'River loop', delta: '+0.6 km' },
    { k: 'summit', icon: '\u2212', label: state.location === 'trail' ? 'Skip summit' : 'Skip climb', delta: state.location === 'trail' ? '\u221222 m' : '\u22128 m' },
    { k: 'scenic', icon: '\u25c7', label: 'Scenic detour', delta: '+3 min' }
  ];
  const vibe = (seg) => seg.gradePct < 0 ? 'RECOVER' : seg.energyTarget >= 8 ? 'PUSH' : seg.energyTarget >= 6 ? 'DRIVE' : 'CRUISE';

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg, color: C.ink, fontFamily: "'Archivo',sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 5px', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.mut }}>
        <span>9:41</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.ink }}><WeatherIcon w={state.weather} size={13} color={C.acc} stroke={2.4} /> {wm.temp}</span>
        <span>5G ▮▮▮</span>
      </div>

      <div style={{ padding: '4px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 24, letterSpacing: -0.5, lineHeight: .98, textTransform: 'uppercase' }}>Build Your Run</div>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: 1, color: C.acc, border: `1px solid ${C.acc}`, borderRadius: 4, padding: '3px 7px', fontWeight: 700 }}>EDIT</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: C.mut, marginTop: -4, letterSpacing: .3 }}>{state.locationLabel.toUpperCase()} · {wm.label.toUpperCase()} · {state.route.surface.toUpperCase()}</div>

        <div style={{ display: 'flex', background: C.surf, border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
          {[['DISTANCE', adj.distanceKm, 'km'], ['ELEV', adj.elevationM, 'm'], ['MAX', adj.maxGrade, '%']].map((m, i) => (
            <div key={i} style={{ flex: 1, padding: '9px 12px', borderRight: i < 2 ? `1px solid ${C.line}` : 'none' }}>
              <div style={{ fontSize: 9, letterSpacing: 1.1, color: C.mut, fontWeight: 700 }}>{m[0]}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 21, marginTop: 2, lineHeight: 1 }}>{m[1]}<span style={{ fontSize: 11, color: C.mut }}>{m[2]}</span></div>
            </div>))}
        </div>

        <div style={{ position: 'relative', background: C.surf, border: `1px solid ${C.line}`, borderRadius: 12, padding: 9, overflow: 'hidden' }}>
          <RouteMap state={state} height={138} mods={mods} theme={{ route: C.acc, casing: '#0b0d10', steep: C.acc, node: '#cdd4db', nodeStroke: '#0b0d10', start: C.acc, startText: '#0b0d10', text: C.mut, base: 'rgba(255,255,255,.07)', water: 'rgba(110,165,235,.22)', park: 'rgba(150,210,160,.08)', strokeW: 3.4 }} />
          <span style={{ position: 'absolute', right: 13, top: 12, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.acc, letterSpacing: .6 }}>▲ PUSH ZONES</span>
        </div>

        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: C.mut, marginBottom: 6 }}>TUNE YOUR ROUTE · TAP TO RESHAPE MAP</div>
          <div style={{ display: 'flex', gap: 7 }}>
            {devs.map((d) => <PerfDevCard key={d.k} d={d} C={C} on={dev[d.k]} onToggle={() => toggle(d.k)} />)}
          </div>
        </div>

        <div style={{ marginTop: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: C.mut }}>PLAYLIST · ENERGY-MATCHED</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.mut }}>{state.route.avgBpm} BPM</span>
          </div>
          <div style={{ fontSize: 10.5, color: C.mut, marginTop: 3, lineHeight: 1.25 }}>Energy ramps with the climb — <span style={{ color: C.acc, fontWeight: 700 }}>▲ steep zones</span> get high-BPM tracks.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {order.map((ti, pos) => {
            const p = state.playlist[ti], seg = state.segments[ti], steep = seg.energyTarget >= 8;
            return (
              <div key={ti} {...bind(pos)} style={{ display: 'flex', alignItems: 'center', gap: 9, background: dragPos === pos ? C.surf2 : C.surf, border: `1px solid ${steep ? 'rgba(255,90,36,.4)' : C.line}`, borderRadius: 9, padding: '7px 10px', cursor: 'grab' }}>
                <span style={{ color: C.mut, fontSize: 14, lineHeight: 1 }}>⠿</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, color: steep ? C.acc : C.mut, marginTop: 1 }}>{seg.gradePct >= 0 ? '+' : ''}{seg.gradePct}% grade · {p.bpm}bpm</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: steep ? C.acc : C.mut, letterSpacing: .5 }}>{vibe(seg)}</div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 3, justifyContent: 'flex-end' }}>
                    {Array.from({ length: 10 }).map((_, k) => <i key={k} style={{ width: 3, height: 8, borderRadius: 1, background: k < p.energy ? (steep ? C.acc : C.ink) : C.line }} />)}
                  </div>
                </div>
              </div>);
          })}
        </div>

        <div style={{ flex: 1, minHeight: 4 }} />
        <button style={{ width: '100%', padding: '13px', background: C.acc, color: '#0b0d10', border: 'none', borderRadius: 12, fontFamily: "'Archivo',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: .5, textTransform: 'uppercase', cursor: 'pointer' }}>Start Run ▸</button>
      </div>
    </div>);
}

function PerfDevCard({ d, C, on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ flex: 1, textAlign: 'left', cursor: 'pointer', fontFamily: "'Archivo',sans-serif",
      background: on ? 'rgba(255,90,36,.12)' : C.surf, border: `1px solid ${on ? C.acc : C.line}`, borderRadius: 11, padding: '9px 10px', color: C.ink }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? C.acc : C.surf2, color: on ? '#0b0d10' : C.mut, fontWeight: 800, fontSize: 14 }}>{d.icon}</span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: on ? C.acc : C.mut }}>{on ? 'ON' : 'ADD'}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8, lineHeight: 1.1 }}>{d.label}</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, color: C.mut, marginTop: 2 }}>{d.delta}</div>
    </button>);
}

Object.assign(window, { PerformanceScreen });
