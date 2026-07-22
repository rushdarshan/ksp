# Hackathon Readiness

## Winning Position

KSP Genome has a credible finalist surface: conversational investigation, relational network analysis, predictive panels, geospatial views, case workflow, Kannada interaction, and Catalyst functions. It becomes a winning submission only after the live Catalyst deployment and supplied CCTNS import are demonstrated end to end. Breadth alone is not evidence.

## Capability Truth Table

| Capability | Current state | Evidence |
|---|---|---|
| FIR conversational query | Live-ready | `crime_chat` uses whitelisted ZCQL and returns table/record citations |
| Follow-up context | Implemented | Last eight messages persist locally and are sent with each query |
| English/Kannada | Implemented | English query planning plus Zia Kannada translation |
| Conversation PDF | Implemented | Client-side PDF export; sensitive content does not leave the browser |
| Criminal network | Live-ready | Shared-FIR graph from `Accused` and `CaseMaster` |
| Accused at large | Live-ready | `Accused` anti-joined to `ArrestSurrender`; missing warrant/location fields disclosed |
| Voice | Conditional | Browser speech APIs; server STT/TTS requires approved provider URLs |
| Predictive dashboards | Prototype | Several models/panels use synthetic or unvalidated data and must display demo status |
| Governance | Partial | Role checks, PII masking, and append-only audit attempts exist; production role/table setup remains |
| Catalyst deployment | Required gate | Import tables, configure auth/roles, deploy all targets, and record a clean smoke test |

## Five-Minute Judge Demo

1. Ask: `Summarize FIR KSP-2026-0142.` Show cited `CaseMaster`, `Accused`, `Victim`, arrest, and section records.
2. Follow with: `Which accused has no arrest event?` Show retained case context and open the accused ledger.
3. Switch to Kannada and repeat a focused query. Explain browser versus provider voice capability honestly.
4. Open the co-accused graph and trace one shared-FIR connection to its source records.
5. Export the conversation as PDF, then show the audit entry and role restriction.

## Submission Gate

- Deploy the SPA and every configured function through Catalyst.
- Import the 27 synthetic tables and create `AuditLog` with least-privilege access.
- Set `APP_URL`; optionally set `SPEECH_STT_URL`, `SPEECH_TTS_URL`, and `SPEECH_PROVIDER_KEY`.
- Capture one desktop and one mobile walkthrough with no console or network errors.
- Label every synthetic, heuristic, or unvalidated result in the interface and pitch.
- Do not claim statutory deadlines, causation, or offender risk as facts without officer verification.
