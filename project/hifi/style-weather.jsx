/* style-weather.jsx — Direction 3: full-bleed weather backdrop (Apple-Weather
   style) that reacts to live weather. iPhone-17 ratio. Deviations reshape the
   route + metrics live. */

if (typeof document !== 'undefined' && !document.getElementById('wx-anim')) {
  const s = document.createElement('style');
  s.id = 'wx-anim';
  s.textContent = `
  @media (prefers-reduced-motion: no-preference){
    .wx-rain{animation:wxRain .6s linear infinite}
    .wx-rain2{animation:wxRain 1s linear infinite}
    .wx-wind{animation:wxDrift 7s linear infinite}
    .wx-cloud{animation:wxFloat 16s ease-in-out infinite alternate}
    .wx-rays{animation:wxSpin 120s linear infinite}
  }
  @keyframes wxRain{from{background-position-y:0}to{background-position-y:21px}}
  @keyframes wxDrift{from{background-position-x:0}to{background-position-x:280px}}
  @keyframes wxFloat{from{transform:translateX(-26px)}to{transform:translateX(26px)}}
  @keyframes wxSpin{to{transform:rotate(360deg)}}`;
  document.head.appendChild(s);
}

function WeatherScreen({ state }) {
  const { RouteMap, useReorder, weatherMeta, WeatherIcon, routeMods } = window;
  const wm = weatherMeta(state.weather);
  const { order, bind, dragPos } = useReorder(state.playlist.length, state.weather + state.location);
  const [dev, setDev] = React.useState({ loop: true, summit: false, scenic: false });
  const toggle = (k) => setDev(s => ({ ...s, [k]: !s[k] }));
  const mods = { loop: dev.loop, skipSummit: dev.summit };
  const adj = routeMods(state, mods);
  const sans = "'Nunito', system-ui, sans-serif";
  const wdevs = [
    { k: 'loop', icon: '+', label: 'Loop', delta: '+0.6 km' },
    { k: 'summit', icon: '\u2212', label: state.location === 'trail' ? 'Skip summit' : 'Skip climb', delta: state.location === 'trail' ? '\u221222 m' : '\u22128 m' },
    { k: 'scenic', icon: '\u25c7', label: 'Scenic', delta: '+3 min' }
  ];

  const grad = {
    sunny: 'linear-gradient(180deg,#175fce 0%,#3a80e4 26%,#74a9e9 50%,#b6d4ee 72%,#ffe1b0 92%,#ffd09e 100%)',
    rainy: 'linear-gradient(180deg,#0f151d 0%,#1b2530 38%,#2a3947 70%,#384b5b 100%)',
    windy: 'linear-gradient(180deg,#324d58 0%,#54737d 40%,#88a4a9 74%,#bccfd0 100%)'
  }[state.weather] || 'linear-gradient(180deg,#324d58,#bccfd0)';

  const glass = { background: 'rgba(255,255,255,.13)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,.18)' };
  const lab = { fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', fontWeight: 700 };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontFamily: sans, color: '#fff', background: grad }}>
      {state.weather === 'sunny' && <>
        <div style={{ position: 'absolute', top: -70, right: -50, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,247,214,.95),rgba(255,228,170,0) 68%)' }} />
        <div className="wx-rays" style={{ position: 'absolute', top: -110, right: -90, width: 320, height: 320, transformOrigin: 'center', background: 'repeating-conic-gradient(from 0deg,rgba(255,255,255,.07) 0deg 5deg,transparent 5deg 15deg)' }} />
        <div style={{ position: 'absolute', top: 22, right: 28, width: 42, height: 42, borderRadius: '50%', background: '#fff4c6', filter: 'blur(1px)', boxShadow: '0 0 34px 12px rgba(255,242,196,.75)' }} />
        <Cloud top={150} left={-34} w={150} o={.9} blur={11} />
        <Cloud top={210} left={150} w={124} o={.72} blur={10} />
      </>}
      {state.weather === 'rainy' && <>
        <Cloud top={-34} left={-30} w={190} o={.55} blur={18} color="#34424f" />
        <Cloud top={-18} left={120} w={180} o={.5} blur={20} color="#2a3744" />
        <div className="wx-rain" style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(101deg,transparent 0 7px,rgba(255,255,255,.22) 7px 8px)', opacity: .5 }} />
        <div className="wx-rain2" style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(101deg,transparent 0 12px,rgba(255,255,255,.13) 12px 13px)', opacity: .55 }} />
      </>}
      {state.weather === 'windy' && <>
        <Cloud cls="wx-cloud" top={44} left={-30} w={180} o={.55} blur={15} />
        <Cloud cls="wx-cloud" top={128} left={150} w={150} o={.46} blur={15} />
        <div className="wx-wind" style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(87deg,transparent 0 27px,rgba(255,255,255,.10) 27px 28px)' }} />
      </>}

      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px 0', fontSize: 11.5, fontWeight: 700 }}>
          <span>9:41</span><span>▮▮▮ 82%</span>
        </div>

        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: .2 }}>{state.locationLabel}</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 5, marginTop: 1 }}>
            <div style={{ fontSize: 52, fontWeight: 300, lineHeight: 1 }}>{wm.temp}</div>
            <div style={{ marginTop: 8 }}><WeatherIcon w={state.weather} size={26} color="#fff" stroke={2} /></div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{wm.label}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.78)' }}>{wm.sub}</div>
        </div>

        <div style={{ ...glass, padding: 12, marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={lab}>Your route</span><span style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', fontWeight: 700 }}>{state.route.durationMin} min</span>
          </div>
          <div style={{ borderRadius: 13, overflow: 'hidden', background: 'rgba(255,255,255,.06)' }}>
            <RouteMap state={state} height={98} mods={mods} theme={{ route: '#fff', casing: 'rgba(15,30,45,.4)', steep: '#ffd27d', node: '#fff', nodeStroke: 'rgba(15,30,45,.5)', start: '#ffd27d', startText: '#16283a', text: 'rgba(255,255,255,.92)', base: 'rgba(255,255,255,.18)', water: 'rgba(255,255,255,.26)', park: 'rgba(255,255,255,.1)', strokeW: 3.2 }} />
          </div>
          <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
            {[['Distance', adj.distanceKm + ' km'], ['Ascent', adj.elevationM + ' m'], ['Max grade', adj.maxGrade + '%']].map((m, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '7px 4px', background: 'rgba(255,255,255,.1)', borderRadius: 11 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{m[1]}</div>
                <div style={{ ...lab, fontSize: 8, marginTop: 2 }}>{m[0]}</div>
              </div>))}
          </div>
        </div>

        <div style={{ ...glass, padding: 11, marginTop: 10 }}>
          <div style={{ ...lab, marginBottom: 7 }}>Adjust route · reshapes the map</div>
          <div style={{ display: 'flex', gap: 7 }}>
            {wdevs.map((d) => <WxDev key={d.k} d={d} on={dev[d.k]} onToggle={() => toggle(d.k)} />)}
          </div>
        </div>

        <div style={{ ...glass, padding: 12, marginTop: 10, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <span style={lab}>Playlist · matched to terrain</span><span style={{ ...lab, fontSize: 8, fontWeight: 600 }}>drag ⇅</span>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.74)', marginBottom: 7, lineHeight: 1.25 }}>Louder where it climbs — <span style={{ color: '#ffe1ad', fontWeight: 800 }}>▲ steep</span> sections get a high-energy push.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {order.map((ti, pos) => {
              const p = state.playlist[ti], seg = state.segments[ti], steep = seg.energyTarget >= 8;
              return (
                <div key={ti} {...bind(pos)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', borderRadius: 12, cursor: 'grab', background: dragPos === pos ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.1)' }}>
                  <span style={{ opacity: .7, fontSize: 12 }}>⠿</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    <div style={{ fontSize: 10, color: steep ? '#ffe1ad' : 'rgba(255,255,255,.74)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{seg.gradePct >= 0 ? '+' : ''}{seg.gradePct}% · {p.bpm} bpm{steep ? ' · push' : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: 5 }).map((_, k) => <i key={k} style={{ width: 4, height: 4, borderRadius: '50%', background: k < Math.round(p.energy / 2) ? (steep ? '#ffd27d' : '#fff') : 'rgba(255,255,255,.3)' }} />)}
                  </div>
                </div>);
            })}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 6 }} />
        <button style={{ width: '100%', padding: '13px', marginTop: 10, background: 'rgba(255,255,255,.92)', color: '#1d2a38', border: 'none', borderRadius: 15, fontFamily: sans, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Start Run</button>
      </div>
    </div>);
}

function WxDev({ d, on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ flex: 1, cursor: 'pointer', textAlign: 'center', padding: '9px 4px', borderRadius: 13, fontFamily: "'Nunito',sans-serif", color: '#fff',
      border: `1px solid ${on ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.18)'}`, background: on ? 'rgba(255,255,255,.26)' : 'rgba(255,255,255,.08)' }}>
      <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{on ? '✓' : d.icon}</div>
      <div style={{ fontSize: 11.5, fontWeight: 800, marginTop: 4, lineHeight: 1.1 }}>{d.label}</div>
      <div style={{ fontSize: 9.5, opacity: .82, marginTop: 1 }}>{d.delta}</div>
    </button>);
}

function Cloud({ top, left, w, o = .8, blur = 10, color = '#fff', cls }) {
  return <div className={cls} style={{ position: 'absolute', top, left, width: w, height: w * 0.42, borderRadius: '50%', background: color, opacity: o, filter: `blur(${blur}px)`, pointerEvents: 'none' }} />;
}

Object.assign(window, { WeatherScreen });
