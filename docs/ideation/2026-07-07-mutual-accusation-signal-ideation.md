---
date: 2026-07-07
topic: mutual-accusation-signal
idea-number: 18
status: unexplored
---

# Mutual Accusation Signal — IsComplainantAccused as Contested-Crime Detector

## 1. What It Is

A panel that detects and visualizes mutual-accusation clusters — cases where the same person appears as both complainant in one FIR and accused in another. The `Accused.IsComplainantAccused` BIT flag exists in the schema because this pattern is common enough to warrant a column, yet no dashboard surface mines it. These mutual-accusation pairs fall into distinct behavioral categories: property-for-dowry cross-FIRs (498A + counter-FIR), self-defense flips (victim becomes accused in a cross-case), and malicious-prosecution cycles (serial mutual filers). The signal is not an accusation of misuse — it is a triage flag that tells an investigator "these two FIRs are connected and should be read together."

## 2. Who Uses It

| Role | Decision | Sensitivity |
|------|----------|-------------|
| **SHO / Investigating Officer** | "Are these two FIRs cross-complaints? Read them together before filing a chargesheet." | Low — case-level triage |
| **ACP / DCP (Crime)** | "Station X has 8 mutual-accusation clusters this month. Are these genuine or coordinated counter-filing?" | Medium — station supervision |
| **Human Rights / Women's Cell** | "Of 498A cases flagged as mutual, what proportion result in conviction vs withdrawal?" | **High** — touches 498A misuse debate, dowry death patterns, trafficking-camouflage |
| **Legal / Prosecution** | "This accused filed a counter-FIR citing self-defense. Do the injury timelines match?" | Low — evidentiary cross-check |

**Political sensitivity note:** The panel must be framed as a *case-connectedness triage tool*, not a *false-case detector*. 498A misuse is a politically charged topic in India. The value proposition is "read connected FIRs together for better investigation" — not "count how many 498A cases are fake." The framing determines whether a judge sees an investigative aid or a political statement.

## 3. Data Flow

### Schema Tables

| Table | Key Columns | Role |
|-------|-------------|------|
| `Accused` | `AccusedMasterID`, `CaseMasterID`, `AccusedName`, `PersonID`, `IsComplainantAccused` (BIT), `IsAccused` (BIT) | Primary — flag source |
| `ComplainantDetails` | `ComplainantID`, `CaseMasterID`, `ComplainantName` | Cross-reference — match names |
| `CaseMaster` | `CaseMasterID`, `CrimeNo`, `CrimeMajorHeadID`, `CrimeMinorHeadID`, `PoliceStationID`, `CrimeRegisteredDate` | Case context |
| `CrimeSubHead` | `CrimeSubHeadID`, `CrimeHeadID`, `CrimeHeadName` | Crime type label |
| `Unit` | `UnitID`, `UnitName`, `DistrictID` | Geography |
| `ChargesheetDetails` | `CaseMasterID`, `cstype` (A/B/C) | Outcome tracking |

### Query

```sql
-- Find mutual-accusation clusters: same person appears as complainant in one
-- case and accused (with IsComplainantAccused=1) in another
SELECT
  a.IsComplainantAccused,
  cm.CaseMasterID,
  cm.CrimeNo,
  cm.CrimeRegisteredDate,
  cd.ComplainantName AS complainant,
  a.AccusedName AS accused,
  a.PersonID,
  csh.CrimeHeadName,
  u.UnitName,
  u.DistrictID
FROM Accused a
JOIN CaseMaster cm ON a.CaseMasterID = cm.CaseMasterID
LEFT JOIN ComplainantDetails cd ON cm.CaseMasterID = cd.CaseMasterID
LEFT JOIN CrimeSubHead csh ON cm.CrimeMinorHeadID = csh.CrimeSubHeadID
LEFT JOIN Unit u ON cm.PoliceStationID = u.UnitID
WHERE a.IsComplainantAccused = 1
ORDER BY cm.CrimeRegisteredDate DESC;
```

Secondary query — pair-finding for network edges:

```sql
-- Find cross-FIR pairs: person X accused in FIR A, person Y complainant in FIR A;
-- person Y accused (IsComplainantAccused=1) in FIR B, person X complainant in FIR B
-- SQL logic handled in application layer (name + district matching + date proximity)
```

### Querying the `IsComplainantAccused` Flag

The simplest approach queries Catalyst Data Store with an indexed filter on the Accused table:

```js
// mutual-accusation-pairs endpoint
app.get('/mutual-accusation/pairs', async (req, res) => {
  const catalystApp = catalyst.initialize(req);
  const zcql = catalystApp.zcql();

  const { district, crimeHeadId, months } = req.query;
  const filters = [`a.IsComplainantAccused = 1`];
  if (district) filters.push(`u.DistrictID = ${district}`);
  if (months) filters.push(`cm.CrimeRegisteredDate >= ADD_MONTHS(CURRENT_DATE, -${months})`);

  const query = `
    SELECT a.AccusedMasterID, a.CaseMasterID, a.AccusedName, a.PersonID,
           cm.CrimeNo, cm.CrimeRegisteredDate,
           cd.ComplainantName,
           csh.CrimeHeadName, csh.CrimeHeadID,
           u.UnitName, u.DistrictID
    FROM Accused a
    JOIN CaseMaster cm ON a.CaseMasterID = cm.CaseMasterID
    LEFT JOIN ComplainantDetails cd ON cm.CaseMasterID = cd.CaseMasterID
    LEFT JOIN CrimeSubHead csh ON cm.CrimeMinorHeadID = csh.CrimeSubHeadID
    LEFT JOIN Unit u ON cm.PoliceStationID = u.UnitID
    WHERE ${filters.join(' AND ')}
    ORDER BY cm.CrimeRegisteredDate DESC
    LIMIT 300`;

  const data = await zcql.executeZCQLQuery(query);
  // → name-matching pass to build mutual-accusation pairs
  res.json(buildPairs(data));
});
```

### Mock API Endpoint

Added to `client/mock-api-data.js`:

```js
// === Mutual Accusation ===
'GET /server/mutual_accusation/summary': () => ({
  totalMutualCases: 47,
  totalPairs: 31,
  byCrimeType: [
    { crimeHeadName: 'Cruelty by Husband or Relatives (498A)', count: 18, pairCount: 14 },
    { crimeHeadName: 'Hurt / Grievous Hurt', count: 9, pairCount: 6 },
    { crimeHeadName: 'Criminal Trespass / House-trespass', count: 7, pairCount: 4 },
    { crimeHeadName: 'Theft', count: 6, pairCount: 3 },
    { crimeHeadName: 'Criminal Intimidation', count: 4, pairCount: 2 },
    { crimeHeadName: 'Dowry Death / Dowry Prohibition', count: 3, pairCount: 2 },
  ],
  byStation: [
    { stationName: 'Bengaluru Urban - MG Road PS', mutualCases: 8, pairs: 6, totalCases: 145 },
    { stationName: 'Mysuru - Kuvempunagar PS', mutualCases: 6, pairs: 4, totalCases: 98 },
    { stationName: 'Mangaluru - City PS', mutualCases: 5, pairs: 3, totalCases: 76 },
  ],
  trend: Array.from({ length: 12 }, (_, i) => ({
    month: `2025-${String(i + 1).padStart(2, '0')}`,
    mutualCases: Math.floor(Math.random() * 8 + 2),
    totalCases: Math.floor(Math.random() * 60 + 30),
  })),
}),

'GET /server/mutual_accusation/pairs': ({ query }) => {
  const pairs = [
    {
      pairId: 1,
      personName: 'Sunita Devi',
      firA: { caseId: 101, crimeNo: 'KSP-2025-0142', crimeHead: 'Cruelty by Husband or Relatives', date: '2025-11-15', complainant: 'Sunita Devi', accused: 'Rajesh Kumar' },
      firB: { caseId: 102, crimeNo: 'KSP-2025-0148', crimeHead: 'Hurt / Grievous Hurt', date: '2025-11-20', complainant: 'Rajesh Kumar', accused: 'Sunita Devi' },
      dateDelta: 5,
      sameStation: true,
      is498A: true,
      matchedByName: true,
    },
    {
      pairId: 2,
      personName: 'Mohammed Iqbal',
      firA: { caseId: 201, crimeNo: 'KSP-2025-0217', crimeHead: 'Criminal Trespass', date: '2025-12-01', complainant: 'Mohammed Iqbal', accused: 'Ali Khan' },
      firB: { caseId: 202, crimeNo: 'KSP-2025-0223', crimeHead: 'Criminal Intimidation', date: '2025-12-04', complainant: 'Ali Khan', accused: 'Mohammed Iqbal' },
      dateDelta: 3,
      sameStation: true,
      is498A: false,
    },
    // ... more synthetic pairs
  ];

  let filtered = [...pairs];
  if (query.crimeHeadId) filtered = filtered.filter(p => query.crimeHeadId === '498a' ? p.is498A : !p.is498A);
  if (query.minDateDelta) filtered = filtered.filter(p => p.dateDelta >= parseInt(query.minDateDelta));
  if (query.personName) filtered = filtered.filter(p => p.personName.toLowerCase().includes(query.personName.toLowerCase()));

  return { pairs: filtered, total: filtered.length };
},
```

## 4. UI Sketch

The panel has two coordinated views:

### Left: Mutual-Accusation Network (force-directed graph)

- **Nodes:** persons detected in mutual-accusation pairs (name labels)
- **Edges:** pairs of cross-FIRs between two persons; edge width = number of mutual FIRs
- **Node color:** by role balance — red-tinted if mostly accused, blue-tinted if mostly complainant, purple if balanced
- **Edge color:** orange if 498A-involved, gray if other crime type
- **Click node →** opens pair detail card (both FIRs side-by-side)
- **Cluster detection:** Louvain community detection on the mutual-accusation graph reveals serial filer rings (same person paired with many different counterparts)
- **Layout hint:** Charge density — nodes with high accusation degree pushed outward, nodes with high complaint degree pulled inward, balanced nodes centralized

### Right Top: Time Series — Mutual-Accusation Rate

- Bar chart: `(mutual-accusation cases / total cases)` per station per month
- Overlay line: citywide average mutual rate
- **Color rule:** orange bar when station rate > 2x city average
- **X-axis:** last 12 months
- **Y-axis:** percentage

### Right Bottom: Pair Detail Panel (appears on node click)

Split into two columns:

| FIR A (Complainant's FIR) | FIR B (Counter-FIR) |
|---------------------------|---------------------|
| CrimeNo, date, crime head | CrimeNo, date, crime head |
| Complainant: Sunita Devi | Complainant: Rajesh Kumar |
| Accused: Rajesh Kumar | Accused: Sunita Devi |
| Station, IO name | Station, IO name |
| **Status** (investigation/chargesheet/closed) | **Status** |
| **csType** (A/B/C) if chargesheeted | **csType** |

Delta badge: `Filed 5 days apart · Same station`

### Summary header cards

- **Mutual accusation rate:** 9% of all FIRs detected as paired
- **498A-linked pairs:** 14 of 31 pairs
- **Repeat mutual filers:** 3 persons in ≥2 pairs
- **Highest density station:** MG Road PS (8 mutual cases)

## 5. Key Interactions

| Interaction | Behavior |
|-------------|----------|
| **Filter by crime type** | Dropdown of CrimeSubHead names. Selecting "Cruelty by Husband or Relatives" filters graph to only pairs where at least one FIR is 498A. Graph dims non-matching nodes, scales matching nodes. |
| **Filter by station** | Sidebar station list with mutual-case count. Click → graph zoom to that station's pairs. |
| **Filter by date range** | Slider or date picker. Graph filters to pairs whose most recent FIR falls in range. |
| **Drill to case pairs** | Clicking a pair card has two sub-actions: (a) "Open both FIRs" — opens side-by-side FIR detail (reuses existing DetailedFir component), (b) "Show chargesheet outcomes" — expands each FIR's csType + conviction status. |
| **Person search** | Type-ahead search by name. Returns all pairs involving that person. Highlights their node and connected edges. |
| **Threshold slider: minimum date delta** | Slider controlling minimum gap between paired FIRs (1-90 days). 1-day delta = likely same-day counter-filing; 30-day delta = more deliberated response. Default: 7 days. |
| **Toggle: same-station pairs only** | Checkbox. When checked, only shows pairs where both FIRs filed at the same station. Increases confidence that match is genuine (same jurisdiction). |

## 6. Demo Narrative (30-second judge pitch)

**Frame:** "This is not a misuse detector. It's a **connected-cases triage tool**."

**Script:**

> "Every FIR is treated as a standalone event. But in cases like 498A, the accused often files a counter-FIR claiming hurt or trespass — the same facts, two stories.
>
> The schema has a flag for this: `IsComplainantAccused`. It's been there all along, but nobody reads it.
>
> This panel surfaces every mutual-accusation pair in the district. Two FIRs, same people, opposite roles. The network graph shows who's at the center of serial cross-filing. The time series shows which stations have unusual rates.
>
> For the investigator, it's one click to see both FIRs side by side. For the supervisor, it's a triage signal — not 'this case is false,' but 'these cases are connected, investigate them together.'
>
> What you can't see in a single FIR, you can see in the pair."

**Key framing rules:**
- Never say "false case," "fake FIR," or "misuse"
- Always say "connected cases," "cross-FIR pair," "read together"
- The political sensitivity makes framing the entire demo's make-or-break factor

## 7. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| **Legitimate mutual accusations** | Two people who genuinely assaulted each other in a single incident, each filing an FIR. The panel shows these as pairs — the network view doesn't imply wrongdoing, only connection. Date delta < 1 day and same-station filter identifies these. |
| **Same-name false matches** | Common Indian names (Sunita Devi, Rajesh Kumar, Mohammed Iqbal) appear independently in unrelated FIRs. Mitigation: **pair matching requires name match AND same-district AND date proximity threshold AND same-station (optional toggle)**. For production: cross-reference PersonID or Aadhaar-linked entity resolution. Demo uses unique synthetic names to avoid false matches. |
| **Family-wide multi-FIR cycles** | Extended family disputes (property disputes, dowry conflicts) produce multi-party cross-FIRs — complainant A→accused B, C, D and counter-FIR B→A, C. The network graph handles this naturally (multi-edge clusters). |
| **Missing IsComplainantAccused flag** | If data entry missed the flag, the panel can fall back to name-matching across Accused and ComplainantDetails tables (same name + same case cluster ± date proximity). Accuracy degrades but coverage improves. UI shows a "flag-based" vs "name-match-based" toggle. |
| **One FIR chargesheeted, one not** | Asymmetric pair: FIR A reaches chargesheet type A (genuine), FIR B is still pending. This is a high-interest outcome signal — may indicate which FIR had stronger evidence. Color-code by chargesheet symmetry. |
| **Both FIRs withdrawn** | Pairs where both cases end in csType B (false case) or are withdrawn. These are the "mutual retraction" subset — may indicate family-negotiated settlement. Worth tracking separately. |
| **Accused-at-large in one FIR** | If accused in FIR A is arrested but accused in FIR B (who is also the complainant in FIR A) is not — reveals asymmetric enforcement. Link to Accused-at-Large Ledger (S20). |

## 8. Cross-Cutting

| Connection | How |
|------------|-----|
| **Co-Accused Network (S22)** | A mutual-accusation pair may share a co-accused (both FIRs list a third person as A2). Cross-wiring: clicking a pair node shows that person's co-accused graph. Compounds: mutual accusation + co-accused hierarchy = full relational context. |
| **Charge-Bundle Graph** | If person A is 498A-accused in FIR X and 323 IPC (hurt)-complainant in FIR Y, the charge bundle {498A, 323} is structurally linked. Cross-referencing mutual accusation pairs by charge bundle reveals predictable counter-FIR pattern templates. |
| **GBV Analytics Hub** | Mutual-accusation flag integrates into GBV analytics as a contextual filter: "show 498A cases with vs without counter-FIR" — conviction rate comparison. GBV panel could show a "counter-filed" badge on cases with detected mutual pairs. |
| **Retraction Rate (S16)** | Cross-reference mutual accusation pairs with ChagesheetDetails.csType = B (false case). High overlap = counter-FIRs collapsing during investigation. "What fraction of mutual-accusation pairs end with at least one FIR declared false?" is a prosecution-intelligence query. |
| **Veracity Index** | Apply VeriPol scoring to both FIRs in a mutual pair. If one scores genuine and the other fabricated, the asymmetry is itself a signal. "Genuine FIR + fabricated counter-FIR" suggests malicious prosecution. "Fabricated + fabricated" suggests a staged dispute. Add as a filter in the panel when both FIRs have been scored. |
| **Victim Risk Shield** | A person listed as accused in one FIR and complainant in another is a special risk profile — they're both perpetrator- and victim-identified. Risk score should account for positional ambiguity. |
| **Case Management / Golden Timer** | Mutual-accusation pairs share a statute-of-limitations dependency — chargesheet on one often triggers preclusive effect on the other (issue estoppel). Golden timer should track paired cases as a unit. |

## 9. Complexity Estimate

| Component | Lines | Risk |
|-----------|-------|------|
| **Catalyst Function** — `mutual_accusation` with 2 endpoints: GET /pairs, GET /summary | ~90 lines JS | Low — single-table filter + name-matching in app layer. Catalyst 300-row limit may require pagination for large districts. |
| **Mock API data** — add to `mock-api-data.js` | ~70 lines | None — follows existing `'GET /server/mutual_accusation/*'` pattern |
| **Frontend panel** — `MutualAccusationPanel.jsx` | ~260 lines JSX | Low — reuses PanelCard, PanelHeader, PanelTable patterns. Force graph via canvas (like TopologyPanel) or a lightweight D3-force wrapper. |
| **Force graph (canvas)** — custom or mini-D3 | ~80 lines | Medium — need minimal force layout; TopologyPanel uses circular layout, this needs force-directed. Either embed d3-force (already in bundle via react-force-graph-2d dependency) or write a simple force simulation. |
| **Sidebar integration** — route + lazy import in App.jsx | ~5 lines | None |
| **Total** | **~505 lines** | **Low-Medium** — largest chunk is frontend graph + interaction wiring |

**Effort estimate:** 1.5-2 days for one developer familiar with the codebase.

**Dependencies:** None on other panels. Can be built independently. `react-force-graph-2d` is already in `package.json` (used by `NetworkGraph.jsx`) — reuse its D3-force layout for the mutual-accusation graph.

**Implementation order:**
1. Mock API data + Catalyst function (parallel-friend)
2. Frontend panel shell (PanelCard + summary header cards)
3. Canvas force graph (nodes = persons, edges = pairs)
4. Pair detail card (side-by-side FIR view on node click)
5. Filters (crime type, station, date range, date delta)
6. Time-series chart
7. Cross-wiring hooks to GBV Panel and Veracity Panel
