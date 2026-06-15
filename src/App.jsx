import React, { useState, useEffect, useRef } from 'react'
import RouteMap from './RouteMap.jsx'
import { derive, routeMods } from './engine.js'

/* ─── Animated weather backgrounds ─── */
const CSS_ANIM = `
@keyframes wxRain { from { background-position-y: 0 } to { background-position-y: 21px } }
@keyframes wxRain2 { from { background-position-y: 0 } to { background-position-y: 33px } }
@keyframes wxDrift { from { background-position-x: 0 } to { background-position-x: 280px } }
@keyframes wxFloat { from { transform: translateX(-26px) } to { transform: translateX(26px) } }
@keyframes wxFloat2 { from { transform: translateX(20px) } to { transform: translateX(-20px) } }
@keyframes wxSpin { to { transform: rotate(360deg) } }
@keyframes wxPulse { 0%,100% { opacity: .75 } 50% { opacity: 1 } }
@media (prefers-reduced-motion: no-preference) {
  .wx-rain { animation: wxRain .6s linear infinite }
  .wx-rain2 { animation: wxRain2 1s linear infinite }
  .wx-wind { animation: wxDrift 7s linear infinite }
  .wx-cloud { animation: wxFloat 16s ease-in-out infinite alternate }
  .wx-cloud2 { animation: wxFloat2 20s ease-in-out infinite alternate }
  .wx-rays { animation: wxSpin 120s linear infinite }
  .wx-sun-pulse { animation: wxPulse 4s ease-in-out infinite }
}
`

function StyleTag() {
  return <style>{CSS_ANIM}</style>
}

function Cloud({ top, left, width, opacity = 0.8, blur = 10, color = '#fff', cls }) {
  return (
    <div className={cls} style={{
      position: 'absolute', top, left,
      width, height: width * 0.42,
      borderRadius: '50%',
      background: color, opacity,
      filter: `blur(${blur}px)`,
      pointerEvents: 'none',
    }} />
  )
}

function SunnyBg() {
  return (
    <>
      {/* Sun glow */}
      <div style={{ position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,247,214,.95), rgba(255,228,170,0) 68%)', pointerEvents: 'none' }} />
      {/* Rays */}
      <div className="wx-rays" style={{ position: 'absolute', top: -120, right: -100, width: 340, height: 340,
        transformOrigin: 'center', pointerEvents: 'none',
        background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,.07) 0deg 5deg, transparent 5deg 15deg)' }} />
      {/* Sun disc */}
      <div className="wx-sun-pulse" style={{ position: 'absolute', top: 24, right: 30, width: 48, height: 48,
        borderRadius: '50%', background: '#fff9d6', filter: 'blur(1px)',
        boxShadow: '0 0 40px 14px rgba(255,242,196,.8)', pointerEvents: 'none' }} />
      {/* Horizon warm haze */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        background: 'linear-gradient(0deg, rgba(255,208,158,.35), transparent)', pointerEvents: 'none' }} />
      <Cloud top={160} left={-38} width={160} opacity={0.85} blur={12} />
      <Cloud top={220} left={160} width={130} opacity={0.65} blur={10} />
    </>
  )
}

function RainyBg() {
  return (
    <>
      <Cloud top={-40} left={-34} width={200} opacity={0.55} blur={20} color="#34424f" />
      <Cloud top={-22} left={130} width={190} opacity={0.5} blur={22} color="#2a3744" />
      <Cloud top={30} left={60} width={160} opacity={0.35} blur={18} color="#2e3d4a" />
      {/* Heavy rain streaks */}
      <div className="wx-rain" style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(101deg, transparent 0 7px, rgba(180,210,230,.28) 7px 8px)',
        opacity: 0.65 }} />
      <div className="wx-rain2" style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(101deg, transparent 0 12px, rgba(200,225,240,.16) 12px 13px)',
        opacity: 0.7 }} />
      {/* Dark puddle sheen at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%',
        background: 'linear-gradient(0deg, rgba(10,18,28,.45), transparent)', pointerEvents: 'none' }} />
    </>
  )
}

function WindyBg() {
  return (
    <>
      <Cloud cls="wx-cloud" top={50} left={-34} width={190} opacity={0.55} blur={16} />
      <Cloud cls="wx-cloud2" top={130} left={160} width={160} opacity={0.44} blur={15} />
      <Cloud cls="wx-cloud" top={280} left={20} width={140} opacity={0.32} blur={18} />
      <div className="wx-wind" style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(87deg, transparent 0 27px, rgba(255,255,255,.09) 27px 28px)' }} />
    </>
  )
}

/* ─── Weather icon ─── */
function WeatherIcon({ weather, size = 26, color = '#fff', strokeWidth = 2 }) {
  const s = size
  if (weather === 'sunny') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      <circle cx="12" cy="12" r="4.4" fill={color} stroke="none" />
      {[0,45,90,135,180,225,270,315].map(a => {
        const r1=7.5,r2=10.2,rad=a*Math.PI/180
        return <line key={a} x1={12+r1*Math.cos(rad)} y1={12+r1*Math.sin(rad)} x2={12+r2*Math.cos(rad)} y2={12+r2*Math.sin(rad)} />
      })}
    </svg>
  )
  if (weather === 'rainy') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M7 13a4 4 0 0 1 .4-8 5 5 0 0 1 9.5 1.3A3.4 3.4 0 0 1 17 13H7Z" />
      <line x1="8.5" y1="16" x2="7.5" y2="19" />
      <line x1="12" y1="16" x2="11" y2="19.5" />
      <line x1="15.5" y1="16" x2="14.5" y2="19" />
    </svg>
  )
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M3 9h11a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M3 13h14a2.5 2.5 0 1 1-2.5 2.5" />
      <path d="M3 17h7" />
    </svg>
  )
}

/* ─── Drag-to-reorder hook ─── */
function useReorder(n, resetKey) {
  const [order, setOrder] = useState(() => Array.from({ length: n }, (_, i) => i))
  useEffect(() => { setOrder(Array.from({ length: n }, (_, i) => i)) }, [resetKey, n])
  const from = useRef(null)
  const [dragPos, setDragPos] = useState(null)

  const bind = (pos) => ({
    draggable: true,
    onDragStart: (e) => {
      from.current = pos
      setDragPos(pos)
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(pos)) } catch (_) {}
    },
    onDragOver: (e) => {
      e.preventDefault()
      const f = from.current
      if (f == null || f === pos) return
      setOrder(o => {
        const a = [...o]; const [m] = a.splice(f, 1); a.splice(pos, 0, m)
        from.current = pos; return a
      })
      setDragPos(pos)
    },
    onDragEnd: () => { from.current = null; setDragPos(null) },
  })
  return { order, bind, dragPos }
}

/* ─── Context sheet (bottom drawer) ─── */
function ContextSheet({ weather, setWeather, location, setLocation, onClose }) {
  const pill = (val, cur, set, label) => (
    <button onClick={() => set(val)} style={{
      flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
      borderRadius: 12, fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
      background: cur === val ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.14)',
      color: cur === val ? '#1d2a38' : 'rgba(255,255,255,.8)',
      transition: 'background .15s, color .15s',
    }}>{label}</button>
  )
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 430, margin: '0 auto',
        background: 'rgba(20,30,42,.92)', backdropFilter: 'blur(24px)',
        borderRadius: '24px 24px 0 0', padding: '20px 20px 40px',
        border: '1px solid rgba(255,255,255,.14)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.3)', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)',
          fontWeight: 800, marginBottom: 10 }}>Sky conditions</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {pill('sunny', weather, setWeather, '☀ Sunny')}
          {pill('rainy', weather, setWeather, '🌧 Rainy')}
          {pill('windy', weather, setWeather, '💨 Windy')}
        </div>
        <p style={{ fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)',
          fontWeight: 800, marginBottom: 10 }}>Terrain</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {pill('city', location, setLocation, '🏙 City')}
          {pill('trail', location, setLocation, '⛰ Trail')}
        </div>
      </div>
    </div>
  )
}

/* ─── Main app ─── */
const WEATHER_GRADIENTS = {
  sunny: 'linear-gradient(180deg, #175fce 0%, #3a80e4 26%, #74a9e9 50%, #b6d4ee 72%, #ffe1b0 92%, #ffd09e 100%)',
  rainy: 'linear-gradient(180deg, #0f151d 0%, #1b2530 38%, #2a3947 70%, #384b5b 100%)',
  windy: 'linear-gradient(180deg, #324d58 0%, #54737d 40%, #88a4a9 74%, #bccfd0 100%)',
}

const WEATHER_META = {
  sunny: { temp: '24°', label: 'Sunny', sub: 'Clear skies' },
  rainy: { temp: '13°', label: 'Rain', sub: 'Steady rain' },
  windy: { temp: '17°', label: 'Windy', sub: 'Strong breeze' },
}

function load(k, d) { try { return localStorage.getItem(k) || d } catch (_) { return d } }
function save(k, v) { try { localStorage.setItem(k, v) } catch (_) {} }

export default function App() {
  const [weather, setWeatherS] = useState(() => load('wr-weather', 'sunny'))
  const [location, setLocationS] = useState(() => load('wr-location', 'trail'))
  const [dev, setDev] = useState({ loop: true, summit: false, scenic: false })
  const [showContext, setShowContext] = useState(false)

  const setWeather = v => { setWeatherS(v); save('wr-weather', v) }
  const setLocation = v => { setLocationS(v); save('wr-location', v) }

  const state = derive(weather, location)
  const mods = { loop: dev.loop, skipSummit: dev.summit }
  const adj = routeMods(state, mods)
  const wm = WEATHER_META[weather]
  const { order, bind, dragPos } = useReorder(state.playlist.length, weather + location)

  const toggleDev = k => setDev(s => ({ ...s, [k]: !s[k] }))

  const glass = {
    background: 'rgba(255,255,255,.13)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,.22)',
    borderRadius: 20,
    boxShadow: '0 8px 30px rgba(0,0,0,.18)',
  }
  const lab = { fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', fontWeight: 800 }

  const devOptions = [
    { k: 'loop', icon: '+', label: 'Add loop', delta: '+0.6 km' },
    { k: 'summit', icon: '−', label: location === 'trail' ? 'Skip summit' : 'Skip climb', delta: location === 'trail' ? '−22 m' : '−8 m' },
    { k: 'scenic', icon: '◇', label: 'Scenic', delta: '+3 min' },
  ]

  /* status-bar time */
  const [time, setTime] = useState(() => {
    const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
  })
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date(); setTime(`${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`)
    }, 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      <StyleTag />

      {/* Full-bleed weather background */}
      <div style={{
        position: 'fixed', inset: 0,
        background: WEATHER_GRADIENTS[weather],
        transition: 'background 0.8s ease',
        zIndex: 0,
      }}>
        {weather === 'sunny' && <SunnyBg />}
        {weather === 'rainy' && <RainyBg />}
        {weather === 'windy' && <WindyBg />}
      </div>

      {/* Scrollable screen content — max 430px, full height */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 430,
        height: '100dvh',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        fontFamily: "'Nunito', system-ui, sans-serif",
        color: '#fff',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '0 16px 32px' }}>

          {/* Status bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 6px 0', fontSize: 13, fontWeight: 700 }}>
            <span>{time}</span>
            <span style={{ fontSize: 12 }}>▮▮▮ 82%</span>
          </div>

          {/* Weather hero — tap to change context */}
          <button onClick={() => setShowContext(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#fff', fontFamily: 'inherit', textAlign: 'center',
            padding: '6px 0 4px', width: '100%',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: .2 }}>{state.locationLabel}</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ fontSize: 56, fontWeight: 300, lineHeight: 1 }}>{wm.temp}</div>
              <div style={{ marginTop: 10 }}><WeatherIcon weather={weather} size={28} /></div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{wm.label}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.72)', marginTop: 1 }}>{wm.sub}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', marginTop: 6, letterSpacing: .8 }}>TAP TO CHANGE CONDITIONS</div>
          </button>

          {/* Route map card */}
          <div style={{ ...glass, padding: 14, marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={lab}>Your route</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{adj.distanceKm} km · {state.route.durationMin} min</span>
            </div>
            <div style={{ borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,.07)' }}>
              <RouteMap state={state} height={108} mods={mods} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {[['Distance', adj.distanceKm + ' km'], ['Ascent', adj.elevationM + ' m'], ['Max grade', adj.maxGrade + '%']].map(([label, val], i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 4px',
                  background: 'rgba(255,255,255,.1)', borderRadius: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{val}</div>
                  <div style={{ ...lab, fontSize: 8, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
            {state.warnings.length > 0 && (
              <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(255,200,100,.15)',
                borderRadius: 10, border: '1px solid rgba(255,200,100,.3)' }}>
                {state.warnings.map((w, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#ffe1a0', fontWeight: 700 }}>⚠ {w}</div>
                ))}
              </div>
            )}
          </div>

          {/* Adjust route */}
          <div style={{ ...glass, padding: 12, marginTop: 10 }}>
            <div style={{ ...lab, marginBottom: 8 }}>Adjust route · reshapes the map</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {devOptions.map(d => (
                <button key={d.k} onClick={() => toggleDev(d.k)} style={{
                  flex: 1, cursor: 'pointer', textAlign: 'center', padding: '10px 4px',
                  borderRadius: 14, fontFamily: 'inherit', color: '#fff',
                  border: `1px solid ${dev[d.k] ? 'rgba(255,255,255,.65)' : 'rgba(255,255,255,.18)'}`,
                  background: dev[d.k] ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.08)',
                  transition: 'background .15s, border-color .15s',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{dev[d.k] ? '✓' : d.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, marginTop: 5, lineHeight: 1.2 }}>{d.label}</div>
                  <div style={{ fontSize: 9.5, opacity: .8, marginTop: 2 }}>{d.delta}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Playlist */}
          <div style={{ ...glass, padding: 13, marginTop: 10, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={lab}>Playlist · matched to terrain</span>
              <span style={{ ...lab, fontSize: 8, fontWeight: 600 }}>drag ↕</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginBottom: 9, lineHeight: 1.35 }}>
              Louder where it climbs — <span style={{ color: '#ffe1ad', fontWeight: 800 }}>▲ steep</span> sections get a high-energy push.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {order.map((ti, pos) => {
                const p = state.playlist[ti]
                const seg = state.segments[ti]
                const steep = seg.energyTarget >= 8
                return (
                  <div key={ti} {...bind(pos)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                    borderRadius: 13, cursor: 'grab', userSelect: 'none',
                    background: dragPos === pos ? 'rgba(255,255,255,.24)' : (steep ? 'rgba(255,220,150,.1)' : 'rgba(255,255,255,.1)'),
                    border: steep ? '1px solid rgba(255,220,150,.25)' : '1px solid transparent',
                    transition: 'background .1s',
                  }}>
                    <span style={{ opacity: .6, fontSize: 14 }}>⠿</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: 10, color: steep ? '#ffe1ad' : 'rgba(255,255,255,.68)', marginTop: 2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {seg.gradePct >= 0 ? '+' : ''}{seg.gradePct}% · {p.bpm} bpm{steep ? ' · push zone' : ''}
                      </div>
                    </div>
                    {/* energy dots */}
                    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                      {Array.from({ length: 5 }).map((_, k) => (
                        <div key={k} style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: k < Math.round(p.energy / 2) ? (steep ? '#ffd27d' : '#fff') : 'rgba(255,255,255,.25)',
                        }} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Start Run button */}
          <button style={{
            width: '100%', marginTop: 14,
            padding: '16px', border: 'none', borderRadius: 18,
            background: 'rgba(255,255,255,.92)', color: '#1d2a38',
            fontFamily: 'inherit', fontWeight: 800, fontSize: 17,
            cursor: 'pointer', letterSpacing: .3,
            boxShadow: '0 4px 24px rgba(0,0,0,.2)',
            transition: 'transform .1s, box-shadow .1s',
          }}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(.97)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Start Run
          </button>
        </div>
      </div>

      {/* Context sheet */}
      {showContext && (
        <ContextSheet
          weather={weather} setWeather={setWeather}
          location={location} setLocation={setLocation}
          onClose={() => setShowContext(false)}
        />
      )}
    </>
  )
}
