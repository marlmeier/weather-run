// Real GPS-coordinate routes for the two terrain modes.
// City: Embarcadero waterfront loop, San Francisco, CA
// Trail: Tennessee Valley Trail, Marin Headlands, CA

// ─── Embarcadero Loop, San Francisco (~5.2 km) ───────────────────────────────
// Ferry Building → Pier 39 → Fisherman's Wharf → Aquatic Park → return inland
export const CITY_PATH = [
  [37.7956, -122.3937], //  0: Ferry Building (START)
  [37.7971, -122.3950], //  1
  [37.7990, -122.3963], //  2: Pier 7
  [37.8009, -122.3990], //  3
  [37.8026, -122.4017], //  4: Pier 17
  [37.8046, -122.4050], //  5
  [37.8065, -122.4074], //  6: Pier 33
  [37.8085, -122.4097], //  7: Pier 39
  [37.8079, -122.4132], //  8: Fisherman's Wharf
  [37.8063, -122.4176], //  9: Hyde St Pier
  [37.8059, -122.4215], // 10: Aquatic Park (far end)
  [37.8040, -122.4198], // 11
  [37.8020, -122.4163], // 12: Columbus Ave
  [37.8001, -122.4119], // 13: North Beach
  [37.7981, -122.4073], // 14: Broadway
  [37.7964, -122.4026], // 15
  [37.7956, -122.3937], // 16: Back to Ferry Building
]
// Which CITY_PATH indices are the 5 segment waypoints
export const CITY_WAYPOINTS = [2, 4, 7, 9, 13]

// Add-loop: extra lasso around the Ferry Plaza / BART plaza
export const CITY_LOOP_PATH = [
  [37.7956, -122.3937],
  [37.7962, -122.3916],
  [37.7950, -122.3907],
  [37.7940, -122.3926],
  [37.7948, -122.3940],
  [37.7956, -122.3937],
]

// Skip-climb bypass: cuts from Pier 17 (index 4) directly to Pier 39 (index 7)
// via an inland road rather than the uphill embankment stretch
export const CITY_SKIP_PATH = [
  [37.8026, -122.4017], // = CITY_PATH[4]
  [37.8038, -122.4032],
  [37.8056, -122.4058],
  [37.8085, -122.4097], // = CITY_PATH[7]
]
// Which segment index is "steepest" in city mode (Short climb, grade 4%)
export const CITY_SUMMIT_SEG = 3

// ─── Tennessee Valley Trail, Marin Headlands, CA (~4.6 km loop) ──────────────
// Trailhead → valley floor → ridge high-point → Tennessee Beach → return loop
export const TRAIL_PATH = [
  [37.8519, -122.5313], //  0: Trailhead parking (START)
  [37.8501, -122.5341], //  1: lower valley
  [37.8480, -122.5368], //  2: valley narrows
  [37.8456, -122.5395], //  3: first switchbacks
  [37.8432, -122.5419], //  4: steeper approach
  [37.8409, -122.5443], //  5: HIGH POINT — ridge summit ~155 m
  [37.8389, -122.5467], //  6: descent begins
  [37.8371, -122.5501], //  7: valley floor
  [37.8357, -122.5531], //  8: Tennessee Beach (far end)
  [37.8374, -122.5493], //  9: return path (north side)
  [37.8397, -122.5458], // 10
  [37.8423, -122.5430], // 11: north ridge
  [37.8451, -122.5401], // 12
  [37.8481, -122.5358], // 13
  [37.8519, -122.5313], // 14: Back to trailhead
]
export const TRAIL_WAYPOINTS = [1, 3, 5, 7, 11]

// Add-loop: small loop around the trailhead meadow
export const TRAIL_LOOP_PATH = [
  [37.8519, -122.5313],
  [37.8531, -122.5294],
  [37.8543, -122.5308],
  [37.8535, -122.5328],
  [37.8519, -122.5313],
]

// Skip-summit bypass: lower traverse from approach (index 4) to descent (index 6)
// avoiding the exposed ridge at index 5
export const TRAIL_SKIP_PATH = [
  [37.8432, -122.5419], // = TRAIL_PATH[4]
  [37.8420, -122.5432], // lower traverse
  [37.8405, -122.5449], // avoids high point
  [37.8389, -122.5467], // = TRAIL_PATH[6]
]
// Which segment index is the summit in trail mode (Summit push, grade 13%)
export const TRAIL_SUMMIT_SEG = 2
