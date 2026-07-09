# Arrest Vector — The Geography of Capture

## 1. What It Is

A spatial analytics panel that visualizes the geographic displacement between where a crime occurs (incident GPS from CaseMaster) and where the arrest is recorded (station jurisdiction from ArrestSurrender). Every case acquires a vector — drawn as an arc on a map, colored by offence severity, and scaled by distance. The panel surfaces three signals at once: **on-scene arrests** (zero-length vectors), **cross-district captures** (long vectors revealing jurisdictional friction or offender mobility), and **recurring sink stations** (the same station receiving arrests from far-flung crime locations — a proxy for habitual safe-houses or systematic transfer patterns).

## 2. Who Uses It & What Decision They Make

| Role | Decision |
|------|----------|
| **DySP** | Which stations are doing disproportionate cross-district arrest work → resource imbalance, need for inter-district coordination |
| **Inspector** | Whether a specific investigating officer's cases show a pattern of off-scene arrests → quality-of-investigation red flag |
| **Sub-Inspector** | On-scene vs. follow-up arrest ratio for their own station → performance metric for beat officer effectiveness |
| **SCRB Analyst** | Identify habitual safe-houses — clusters where arrests concentrate from multiple distant crime locations → target for surveillance |

The common thread: *"Is the arrest happening where the crime happened, and if not, why?"*

## 3. Data Flow

**Schema tables involved:**
- `CaseMaster` — `latitude`, `longitude` (incident GPS origin)
- `ArrestSurrender` — `ArrestSurrenderStateId` (FK→State), `ArrestSurrenderDistrictId` (FK→District), `PoliceStationID` (FK→Unit), `ArrestSurrenderDate`, `AccusedMasterID`, `CaseMasterID`
- `GravityOffenceID` — severity grading for color mapping
- `District` — `DistrictName`
- `Unit` — `UnitName` (police station name for arrest-location label)

**Join logic:** `ArrestSurrender.CaseMasterID → CaseMaster.ID` to pair incident GPS with arrest station. `ArrestSurrender.PoliceStationID → Unit.ID` to resolve the station name and jurisdiction district. `GravityOffenceID` on the case for severity.

**Query (pseudocode):**
```sql
SELECT
  cm.latitude AS incident_lat,
  cm.longitude AS incident_lng,
  u.UnitName AS arrest_station,
  d.DistrictName AS arrest_district,
  asd.ArrestSurrenderDate,
  cm.GravityOffenceID,
  ST_Distance(
    ST_MakePoint(cm.longitude, cm.latitude)::geography,
    ST_MakePoint(u.longitude, u.latitude)::geography
  ) AS vector_km
FROM ArrestSurrender ars
JOIN CaseMaster cm ON ars.CaseMasterID = cm.ID
JOIN Unit u ON ars.PoliceStationID = u.ID
LEFT JOIN District d ON ars.ArrestSurrenderDistrictId = d.ID
```

**Mock API endpoint:**
```
GET /server/arrest_vector/vectors?district=1&from=2025-01&to=2025-12&minDistance=0
```

**Returns:**
```json
{
  "summary": {
    "total": 384,
    "onScene": 142,
    "crossDistrict": 67,
    "avgDistanceKm": 4.2,
    "maxDistanceKm": 38.1
  },
  "vectors": [
    {
      "caseId": 1042,
      "firNo": "KSP-2026-0142",
      "incident": { "lat": 12.9762, "lng": 77.6033 },
      "arrestStation": "Brigade Road PS",
      "arrestDistrict": "Bangalore Urban",
      "vectorKm": 0.3,
      "gravity": "felony",
      "date": "2026-03-18",
      "officer": "PI Dharmendra"
    }
  ],
  "sinkStations": [
    { "station": "Central Crime Branch", "avgVectorKm": 14.2, "captureCount": 23, "sourceDistricts": ["Bangalore Urban", "Bangalore Rural", "Mysuru"] }
  ],
  "officerStats": [
    { "officer": "PI Dharmendra", "cases": 42, "onScene": 31, "crossDistrict": 11, "avgVector": 3.8 }
  ]
}
```

**Implementation note:** Map the station GPS via Unit.latitude/Unit.longitude (if available) or derive from the centroid of the arrest district's boundary. For the mock, we embed station coordinates via a synthetic `Unit` table extended with lat/lng.

## 4. UI Sketch

A single-panel layout, clear in 5 seconds:

```
┌─────────────────────────────────────────────────────────┐
│ Arrest Vector                              [District ▼] │
│ The Geography of Capture              [Date Range ▼]    │
│                                                         │
│  ┌──────────Summary Stats Bar──────────┐               │
│  │ ● 384 arrests  ● 37% on-scene       │               │
│  │ ● 4.2 km avg vector  ● 38.1 km max  │               │
│  │ ● 17% cross-district              │               │
│  └──────────────────────────────────────┘               │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │   Map (Leaflet)     │  │ Vector Detail Table  │      │
│  │                     │  │                      │      │
│  │   Crime ●━━━→■      │  │ FIR    | km | Type   │      │
│  │   Station           │  │ KSP442 | 0.3 | on-sc │      │
│  │   arcs colored by   │  │ KSP789 |12.1 | cross │      │
│  │   severity          │  │ KSP012 | 0.0 | on-sc │      │
│  │                     │  │ ...                  │      │
│  │   Click arc → FIR   │  │                      │      │
│  │   detail drill-down │  │                      │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                         │
│  ┌───Sink Stations (bar chart)──────────────────────┐  │
│  │  CCB        ████████████ 14.2 km avg  23 cases  │  │
│  │  Brigade Rd ██████       6.1 km avg   15 cases  │  │
│  │  Mysuru PS  ███          3.2 km avg    8 cases  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Color semantics:**
- Green arc — on-scene (vector ≤ 1 km)
- Amber arc — short displacement (1–5 km)
- Red arc — long displacement (>5 km)
- Arc opacity scales with GravityOffenceID severity

**Map behavior:**
- Incident point: filled circle, same color as arc
- Arrest station: square marker with station label
- Arc drawn as great-circle bezier between the two, curved upward proportional to distance (prevents occlusion at short vectors)

## 5. Key Interactions

| Interaction | Behavior |
|-------------|----------|
| **District filter** | Dropdown scopes vectors to cases where *either* the incident district or arrest district matches |
| **Date range** | Slider or month-picker (reuses pattern from TopologyPanel's temporal slider) |
| **Min distance toggle** | "On-scene only" / "Cross-district only" / "All" — instantly filters visible arcs |
| **Severity filter** | Checkbox group: felony / misdemeanour / petty — color feedback on map |
| **Click arc** | Opens FIR detail overlay (reuses existing DetailedFir component) |
| **Hover station** | Tooltip: station name, avg vector, case count, source district list |
| **Drill-down → officer** | Click officer name in summary → filter vectors to that officer's cases |
| **Toggle heatmap** | Switch between arc mode and heatmap mode (kernel density of vector endpoints → reveals spatial clusters of "where arrestees are brought from") |

## 6. Demo Narrative (30-Second Pitch)

> "Judge, this is the Arrest Vector panel. It answers one question the current system can't touch: *where do our arrests actually come from?*
>
> Every dot is a crime. Every square is a police station. The line between them is the capture vector. Short line means the beat officer caught them on scene — that's good policing. Long line means someone was arrested far from where they struck — that's either a successful follow-up investigation, or it's a safe-house pattern.
>
> Look at Central Crime Branch — 14-kilometer average vector, pulling cases from three districts. That's not a station, that's a sink. And this bar chart shows you every station that acts like one.
>
> You filter by cross-district only, and suddenly you see which officers are making those long hauls. DySP, this is how you find stations doing work that doesn't belong to them. Inspector, this is how you find the cases where the evidence trail went cold and they picked up someone convenient. Sub-Inspector, this is your on-scene capture rate — your primary metric.
>
> One toggle, one question. Three ranks, three answers."

## 7. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| **Missing incident GPS** | Exclude from map (can't plot vector); show in a "geo-missing" table row below the map with a count badge: "12 cases without GPS" |
| **Arrest at same station (vector = 0)** | These are the on-scene arrests — the most valuable data point. Render as a single dot with a green halo instead of an arc. Count in summary stat. |
| **No arrest record yet** | Not shown on this panel (different panel: Accused-at-Large). Panel shows a banner: "247 cases pending arrest — view in Accused-at-Large panel." |
| **Multiple arrests per case** | If a case has arrests at different stations, show all vectors. Tooltip on the incident dot shows count: "3 arrests from 2 stations." |
| **GPS precision degraded** | If lat/lng has only 2 decimal places (coarse), render with a larger circle with reduced opacity — signals uncertainty to the trained eye |
| **Station GPS not available** | Fall back to district centroid, with a dashed arc styling to indicate the station location is approximate |
| **District filter ambiguity** | An incident in Bangalore Urban arrested by a Mysuru station → which district filter catches it? Answer: the filter ORs the two — if either incident district OR arrest district matches, the vector is shown |
| **Outlier vector (e.g., inter-state arrest)** | Show with a special purple styling and label "INTER-STATE" — too important to hide, but visually distinct from intra-state arcs |

## 8. Cross-Cutting Connections

| Adjacent Feature | Integration |
|------------------|-------------|
| **Accused-at-Large (existing)** | Banner link: "X cases with arrests → see geography of capture." Pending-arrest cases become the incident dots *without* an arc — the absence of a vector is itself a metric ("targets still mobile"). |
| **Co-Accused Network (existing)** | When a vector is clicked, if the accused has co-accused relations in the Network graph, show a "View in Network" link that opens the network panel filtered to that accused's cluster. |
| **Beat Optimizer (existing)** | Stations with high on-scene rates → patrol allocation is working. Stations with low on-scene rates → beats may be misaligned. Surface a correlation card: "Beat Coverage vs. On-Scene Arrest Rate." |
| **Solvability Index (existing)** | Cross-district vectors with high solvability scores → strong investigation overcame geography. Cross-district vectors with low solvability → possible weak case, review for quality. |
| **FIR Quality (existing)** | Cases with missing GPS flagged in FIR Quality panel → the Arrest Vector panel shows the count as a filterable group, creating feedback: "fix the FIR → get the vector." |
| **Exceedance Curve (existing)** | Link vector distance against crime rate exceedance: do cross-district arrests spike when a district is exceeding its crime threshold? Indicates reactive resource borrowing. |

## 9. Complexity Estimate

| Item | Estimate |
|------|----------|
| **New files** | 1 component file (`ArrestVectorPanel.jsx`), 1 mock endpoint entry, 1 route registration |
| **Modified files** | `mock-api-data.js` (+~60 lines for endpoint data), `App.jsx` (+3 lines for lazy import + route), `mock-server-plugin.js` (no change — uses existing `:id` pattern match) |
| **Total lines of code** | ~350–450 JSX (component with map rendering, summary bar, table, sink chart, filters) + ~60 lines mock data = ~450–550 total |
| **Component reuse** | `PanelCard`, `PanelHeader` from shared panels. `PanelChart` for sink bar chart. Leaflet map (already in codebase via `Map2.jsx`/`MapComponent.jsx`). |
| **Key technical block** | Drawing curved arcs on Leaflet — need `L.curve` plugin or `leaflet-routing-machine` (already installed) for the great-circle arc between two points. |
| **Total time** | ~4–6 hours for a single developer: 1 hr mock data, 2 hrs map + arc rendering, 1 hr filters + interactions, 1 hr table + sink chart, 1 hr polish + edge cases |
