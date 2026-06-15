/* style-editorial.jsx — Direction 2: light, typography-led editorial.
   iPhone-17 ratio. Detours reshape the route + metrics live. */

function EditorialScreen({ state }) {
  const { RouteMap, useReorder, weatherMeta, routeMods } = window;
  const C = { bg: '#f5f1e8', ink: '#1a1613', mut: '#8c8579', line: 'rgba(26,22,19,.16)', acc: '#9c4221' };
  const wm = weatherMeta(state.weather);
  const { order, bind, dragPos } = useReorder(state.playlist.length, state.weather + state.location);
  const [dev, setDev] = React.useState({ loop: true, summit: false, scenic: false });
  const toggle = (k) => setDev(s => ({ ...s, [k]: !s[k] }));
  const mods = { loop: dev.loop, skipSummit: dev.summit };
  const adj = routeMods(state, mods);
  const serif = "'Instrument Serif', Georgia, serif";
  const sans = "'Archivo', sans-serif";
  const lab = { fontFamily: sans, fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', color: C.mut, fontWeight: 600 };
  const energyWord = (e) => e >= 8 ? 'Surge' : e >= 6 ? 'Drive' : e >= 4 ? 'Glide' : 'Ease';
  const edevs = [
    { k: 'loop', icon: '+', label: 'Add the river loop', delta: '+0.6 km' },
    { k: 'summit', icon: '\u2212', label: state.location === 'trail' ? 'Skip the steep summit' : 'Skip the climb', delta: state.location === 'trail' ? '\u221222 m' : '\u22128 m' },
    { k: 'scenic', icon: '\u25c7', label: 'Take the scenic viewpoint', delta: '+3 min' }
  ];

  return (
    <div style={{ width: '100%', height: '100%', background: C.bg, color: C.ink, fontFamily: sans, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 22px 2px', fontSize: 11, color: C.ink, fontWeight: 600 }}>
        <span>9:41</span><span style={{ letterSpacing: 1, color: C.mut }}>CO-CURATION</span><span>▮▮▮</span>
      </div>

      <div style={{ padding: '6px 22px 16px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: serif, fontSize: 38, lineHeight: .95, letterSpacing: -0.5 }}>Build your run.</div>
          <div style={lab}>No.05</div>
        </div>
        <div style={{ fontFamily: serif, fontSize: 17, fontStyle: 'italic', color: C.mut, marginTop: 4 }}>{wm.label} · {wm.temp} · {state.locationLabel.toLowerCase()}.</div>

        <div style={{ display: 'flex', borderTop: `1px solid ${C.ink}`, borderBottom: `1px solid ${C.line}`, marginTop: 12 }}>
          {[['Distance', adj.distanceKm, 'km'], ['Ascent', adj.elevationM, 'm'], ['Grade', adj.maxGrade, '%']].map((m, i) => (
            <div key={i} style={{ flex: 1, padding: '9px 0', borderLeft: i ? `1px solid ${C.line}` : 'none', paddingLeft: i ? 14 : 0 }}>
              <div style={{ fontFamily: serif, fontSize: 30, lineHeight: 1 }}>{m[1]}<span style={{ fontSize: 14, color: C.mut, fontStyle: 'italic' }}> {m[2]}</span></div>
              <div style={{ ...lab, marginTop: 3 }}>{m[0]}</div>
            </div>))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <div style={lab}>The loop</div>
          <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: C.mut }}>{state.route.durationMin} min · {state.route.difficulty.toLowerCase()}</div>
        </div>
        <div style={{ marginTop: 4 }}>
          <RouteMap state={state} height={108} mods={mods} theme={{ route: C.ink, casing: C.bg, steep: C.acc, node: C.ink, nodeStroke: C.bg, start: C.bg, startText: C.ink, text: C.mut, base: 'rgba(26,22,19,.13)', water: 'rgba(70,110,150,.22)', park: 'rgba(120,150,90,.15)', strokeW: 2.6 }} />
        </div>

        <div style={{ ...lab, marginTop: 12 }}>Detours · reshape the loop</div>
        <div style={{ marginTop: 1 }}>
          {edevs.map((d) => <EdDetour key={d.k} d={d} C={C} serif={serif} on={dev[d.k]} onToggle={() => toggle(d.k)} />)}
          <div style={{ borderTop: `1px solid ${C.line}` }} />
        </div>

        <div style={{ ...lab, marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span>The sequence</span><span style={{ letterSpacing: 1, fontWeight: 500, textTransform: 'none', fontFamily: serif, fontStyle: 'italic', fontSize: 13, color: C.mut }}>drag to re-order</span>
        </div>
        <div style={{ marginTop: 2 }}>
          {order.map((ti, pos) => {
            const p = state.playlist[ti], seg = state.segments[ti], steep = seg.energyTarget >= 8;
            return (
              <div key={ti} {...bind(pos)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '7px 0', borderTop: `1px solid ${C.line}`, cursor: 'grab', background: dragPos === pos ? 'rgba(156,66,33,.06)' : 'transparent' }}>
                <span style={{ fontFamily: serif, fontSize: 20, color: steep ? C.acc : C.mut, width: 24, fontStyle: 'italic' }}>{String(pos + 1).padStart(2, '0')}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: serif, fontSize: 19, lineHeight: 1.02, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                  <div style={{ ...lab, marginTop: 2, letterSpacing: 1.3, color: steep ? C.acc : C.mut }}>{seg.gradePct >= 0 ? '+' : ''}{seg.gradePct}% · {p.bpm} bpm · {energyWord(p.energy)}</div>
                </div>
                <span style={{ color: C.mut, fontSize: 14 }}>≡</span>
              </div>);
          })}
          <div style={{ borderTop: `1px solid ${C.line}` }} />
        </div>

        <div style={{ flex: 1, minHeight: 6 }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '8px 0 10px', paddingTop: 9, borderTop: `1px solid ${C.ink}` }}>
          <span style={{ fontFamily: serif, fontSize: 22, color: C.acc, lineHeight: 1 }}>▲</span>
          <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 15.5, color: C.ink, lineHeight: 1.22 }}>The set lifts with the land — steeper climbs cue louder, higher-energy tracks.</div>
        </div>
        <button style={{ width: '100%', padding: '13px', background: C.ink, color: C.bg, border: 'none', borderRadius: 2, fontFamily: serif, fontSize: 19, cursor: 'pointer', letterSpacing: .3 }}>Start run →</button>
      </div>
    </div>);
}

function EdDetour({ d, C, serif, on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '9px 0', borderTop: `1px solid ${C.line}`, background: on ? 'rgba(156,66,33,.05)' : 'transparent', cursor: 'pointer' }}>
      <span style={{ width: 24, height: 24, flex: '0 0 auto', borderRadius: '50%', border: `1px solid ${on ? C.ink : C.line}`, background: on ? C.ink : 'transparent', color: on ? C.bg : C.mut, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontSize: 16 }}>{on ? '✓' : d.icon}</span>
      <span style={{ flex: 1, minWidth: 0, fontFamily: serif, fontSize: 18, color: C.ink, lineHeight: 1.05 }}>{d.label}</span>
      <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 15, color: on ? C.acc : C.mut, whiteSpace: 'nowrap' }}>{d.delta}</span>
    </button>);
}

Object.assign(window, { EditorialScreen });
