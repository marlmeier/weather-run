import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import {
  CITY_PATH, CITY_WAYPOINTS, CITY_LOOP_PATH, CITY_SKIP_PATH, CITY_SUMMIT_SEG,
  TRAIL_PATH, TRAIL_WAYPOINTS, TRAIL_LOOP_PATH, TRAIL_SKIP_PATH, TRAIL_SUMMIT_SEG,
} from './routes.js'

// CartoDB Dark Matter — free, no API key, looks great behind white route lines
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

export default function RouteMap({ state, height = 210, mods = {} }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    import('leaflet').then(({ default: L }) => {
      if (cancelled || !containerRef.current) return

      // Tear down any previous instance
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }

      const isCity    = state.location === 'city'
      const basePath  = isCity ? CITY_PATH       : TRAIL_PATH
      const waypoints = isCity ? CITY_WAYPOINTS   : TRAIL_WAYPOINTS
      const loopPath  = isCity ? CITY_LOOP_PATH   : TRAIL_LOOP_PATH
      const skipPath  = isCity ? CITY_SKIP_PATH   : TRAIL_SKIP_PATH
      const summitSeg = isCity ? CITY_SUMMIT_SEG  : TRAIL_SUMMIT_SEG

      // Find which segment is steepest for this weather/location combo
      let summitSegIdx = summitSeg
      state.segments.forEach((s, i) => {
        if (s.energyTarget > state.segments[summitSegIdx].energyTarget) summitSegIdx = i
      })

      const map = L.map(containerRef.current, {
        scrollWheelZoom:    false,
        dragging:           false,
        doubleClickZoom:    false,
        keyboard:           false,
        zoomControl:        false,
        attributionControl: false,
        tap:                false,
        touchZoom:          false,
        boxZoom:            false,
      })

      L.tileLayer(TILE_URL, { subdomains: 'abcd', maxZoom: 20 }).addTo(map)

      // ── Skip-summit: ghost original line + dashed bypass ───────────────────
      if (mods.skipSummit) {
        const fromIdx  = waypoints[summitSegIdx - 1] ?? 0
        const toIdx    = waypoints[summitSegIdx + 1] ?? basePath.length - 1
        const ghostPts = basePath.slice(fromIdx, toIdx + 1)

        L.polyline(ghostPts, {
          color: 'rgba(255,255,255,.28)', weight: 3,
          dashArray: '4 7', lineCap: 'round',
        }).addTo(map)

        L.polyline(skipPath, { color: 'rgba(0,0,0,.55)', weight: 9, lineCap: 'round' }).addTo(map)
        L.polyline(skipPath, {
          color: '#ffffff', weight: 3.5, dashArray: '7 5', lineCap: 'round',
        }).addTo(map)
      }

      // ── Main route (casing + white line) ───────────────────────────────────
      L.polyline(basePath, { color: 'rgba(0,0,0,.55)', weight: 9,   lineCap: 'round' }).addTo(map)
      L.polyline(basePath, { color: '#ffffff',         weight: 3.5, lineCap: 'round', lineJoin: 'round' }).addTo(map)

      // ── Add-loop: dashed lasso at the start ────────────────────────────────
      if (mods.loop) {
        L.polyline(loopPath, { color: 'rgba(0,0,0,.55)', weight: 9,   lineCap: 'round' }).addTo(map)
        L.polyline(loopPath, { color: '#ffffff',          weight: 3.5, dashArray: '6 5', lineCap: 'round' }).addTo(map)

        const midPt = loopPath[Math.floor(loopPath.length / 2)]
        L.marker(midPt, {
          icon: L.divIcon({
            html: `<span style="color:#fff;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9)">+loop</span>`,
            className: '', iconSize: [38, 12], iconAnchor: [19, 12],
          }),
        }).addTo(map)
      }

      // ── Waypoint markers ───────────────────────────────────────────────────
      waypoints.forEach((pathIdx, segIdx) => {
        const seg     = state.segments[segIdx]
        if (!seg) return
        const steep   = seg.energyTarget >= 8
        const skipped = mods.skipSummit && segIdx === summitSegIdx
        const pt      = basePath[pathIdx]

        L.circleMarker(pt, {
          radius:      steep ? 7 : 5,
          fillColor:   skipped ? 'transparent' : (steep ? '#ffd27d' : '#ffffff'),
          color:       steep ? '#ffd27d' : 'rgba(0,0,0,.5)',
          weight:      2,
          fillOpacity: skipped ? 0 : 1,
          opacity:     skipped ? 0.4 : 1,
          dashArray:   skipped ? '3 3' : null,
        }).addTo(map)

        if (steep || skipped) {
          const txt = skipped ? 'skip' : `${segIdx + 1}▲`
          const col = skipped ? 'rgba(255,255,255,.45)' : '#ffd27d'
          L.marker(pt, {
            icon: L.divIcon({
              html: `<span style="color:${col};font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.9);white-space:nowrap">${txt}</span>`,
              className: '', iconSize: [30, 12], iconAnchor: [-4, 12],
            }),
          }).addTo(map)
        }
      })

      // ── Start marker ───────────────────────────────────────────────────────
      L.marker(basePath[0], {
        icon: L.divIcon({
          html: `<div style="width:18px;height:18px;border-radius:50%;background:#ffd27d;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;color:#16283a;box-shadow:0 2px 8px rgba(0,0,0,.55);text-align:center;line-height:18px">S</div>`,
          className: '', iconSize: [18, 18], iconAnchor: [9, 9],
        }),
      }).addTo(map)

      // ── Fit view to route ──────────────────────────────────────────────────
      const allPts = [...basePath, ...(mods.loop ? loopPath : [])]
      map.fitBounds(L.latLngBounds(allPts), { padding: [22, 22] })
      setTimeout(() => { if (!cancelled) map.invalidateSize() }, 80)

      mapRef.current = map
    })

    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [state.location, state.weather, mods.loop, mods.skipSummit])

  return (
    <div style={{ position: 'relative', borderRadius: 13, overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height }} />
      <div style={{
        position: 'absolute', bottom: 4, right: 6, zIndex: 1000,
        fontSize: 9, color: 'rgba(255,255,255,.45)', pointerEvents: 'none',
      }}>
        © OpenStreetMap · © CARTO
      </div>
    </div>
  )
}
