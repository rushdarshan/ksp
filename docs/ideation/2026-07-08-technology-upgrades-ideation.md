---
date: 2026-07-08
topic: technology-upgrades
focus: "neo4j graph db and ai decision audit trail"
mode: repo-grounded
---

# Ideation: Technology Upgrades for KSP Dashboard

## Grounding Context

**Current stack:** 23 Catalyst Node.js functions, React 18 SPA (Vite), Leaflet maps, our own force-graph component, Catalyst Data Store (ZCQL), QuickML (Qwen 2.5-14B), Zia (STT/TTS/generateContent), Signals.

**Catalyst constraints:** 30s function timeout (basic I/O), 15min (job functions), 300-row Data Store fetch limit, no WebSocket, no persistent connections. External services accessible via `fetch()` from any function.

**Competitor tech:** ULTRON uses Three.js 3D maps + Cytoscape.js graphs. CrimeScope uses zero-backend simulated AI. Crime Vision uses XGBoost + Leaflet.

## Ranked Ideas

### 1. Neo4j Criminal Knowledge Graph — Network Analysis Upgrade
**Description:** Deploy Neo4j Aura (free serverless tier) alongside Catalyst. Replace our current in-memory force-graph (which only visualizes co-accused links from a single query) with a persistent criminal knowledge graph. Every FIR ingestion writes nodes (accused, victims, locations, phone numbers, vehicles, bank accounts) and edges (KNOWS, LIVES_AT, OWNS, INVOLVED_IN, COMPLAINED_AGAINST) to Neo4j via Bolt protocol from a Catalyst function. Then run Louvain community detection to identify organized crime clusters, PageRank to find operational leaders, and betweenness centrality to find brokers connecting separate criminal cells. Expose via a Catalyst function endpoint: `GET /neo4j/network?accusedId=A123` returns the 2-hop ego network with centrality scores.
**Warrant:** `external:` sandeepvsk10/knowledge-graph-synthesis-for-law-enforcement wires Neo4j + LLM + RAG for exactly this. UIUC/AAAI research confirms Louvain + PageRank on co-offending networks outperforms manual analysis. `direct:` Our current CoAccusedNetworkPanel queries a flat table and renders nodes — no graph algorithms, no persistent graph, no multi-hop queries.
**Rationale:** This transforms our network analysis from "show links from one table" to "discover organized crime structures." Louvain community detection automatically groups co-offending clusters. PageRank identifies kingpins vs foot soldiers. Betweenness centrality finds the cross-cell brokers manual analysis misses. It's the single highest-leverage upgrade for our criminological credibility.
**Downsides:** Neo4j Aura free tier limited to 50K nodes. External service dependency (network latency, auth). Requires schema design upfront.
**Confidence:** 85%
**Complexity:** Medium (~1 week: schema design + ingestion + query endpoints)
**Status:** Unexplored

### 2. AI Decision Audit Trail — Tamper-Evident Decision Receipts
**Description:** Every time any AI function makes a prediction (PredictivePanel crime forecast, VictimRiskShield score, VeracityPanel analysis, DarkFigure estimate), generate a signed receipt using `ai-audit-trail` (MIT, pip-installable Python library). Each receipt contains: timestamp, model used (QuickML/Zia/heuristic), input data hash, output prediction, confidence score, fallback chain level (primary/fallback), and a SHA-256 hash chained to the previous receipt. Receipts stored in Catalyst Data Store (`DecisionAudit` table via ZCQL). A new `AuditTrailPanel.jsx` frontend shows a chronological log with a "Verify Chain" button that recomputes hashes to confirm integrity. Directly addresses the "Explainable AI & Transparent Analytics" requirement from the challenge.
**Warrant:** `external:` `ai-audit-trail` v0.4.7 (May 2026) is MIT-licensed, pip-installable, maps to EU AI Act Article 12 and ISO 42001. `direct:` Our predictive panel returns predictions but has zero audit trail — no record of what was predicted, when, by which model, or whether it fell back to heuristic.
**Rationale:** Every datathon entry will claim AI capabilities. Almost none will have a verifiable audit trail. This is a tangible differentiator that also directly maps to the challenge rubric. The library is ~1KB per receipt, verification <0.1ms.
**Downsides:** Adds ~50ms per AI call for hashing + storage. Receipts accumulate (~2KB/day).
**Confidence:** 95%
**Complexity:** Low (~3 hours: library + Data Store table + audit panel frontend)
**Status:** Unexplored

### 3. Qdrant Vector Search for FIR Similarity
**Description:** Deploy Qdrant (Apache 2.0, Docker or Cloud free tier). Create a Catalyst job function that embeds FIR narratives + crime metadata using Sentence-Transformers (BGE-M3, MIT) and upserts vectors into Qdrant. Expose: `POST /vector/similar?firId=XYZ` returns top-10 semantically similar FIRs, `POST /vector/search?q=stabbing+market+night` for free-text search. Frontend `SimilarCasesPanel.jsx` shows: "This FIR matches Case #4281 (92% similarity) — same MO."
**Warrant:** `external:` Flipkart Trust & Safety uses Qdrant for real-time similarity, reducing batch detection 9h→1min. Qdrant has built-in geo-filtering (district + vector). `direct:` Our current similar case capability is zero — nothing links related FIRs beyond the same CrimeHeadID.
**Rationale:** The challenge asks for "hidden correlations" and "case linkage." Vector similarity over FIR narratives is the most direct way to find semantically similar cases not linked by any common field.
**Downsides:** Embedding model needs ~500MB RAM. Batch re-indexing required. Semantic search can return false positives.
**Confidence:** 80%
**Complexity:** Medium (~5 days: Qdrant + embedding pipeline + search + frontend)
**Status:** Unexplored

### 4. GraphRAG — Natural Language Queries Over Knowledge Graph
**Description:** Combine #1 with neo4j-graphrag (Apache 2.0). User asks "Who are the known associates of accused A123 involved in property crimes?" → LLM translates to Cypher → executes against Neo4j → retrieves subgraph → LLM summarizes. Multi-hop queries across entity types without writing queries.
**Warrant:** `external:` GraphAware Hume Maestro (2025) deploys LLM→Cypher→graph→answer with ~2,100 agencies. Neo4j's neo4j-graphrag package is production-ready. `reasoned:` Our network panel requires visual tracing. Multi-hop queries impossible beyond 2-3 hops visually.
**Rationale:** This is "conversational AI" grounded in a knowledge graph instead of flat tables. More powerful than a raw-SQL chatbot because it answers relationship queries across entity types.
**Downsides:** Requires #1 (Neo4j) first. LLM Cypher can be incorrect — validation layer needed.
**Confidence:** 70%
**Complexity:** High (~2 weeks)
**Status:** Unexplored

### 5. kepler.gl 3D Geospatial Map Upgrade
**Description:** Replace/augment Leaflet HotspotMap with kepler.gl (MIT, Uber). GPU-accelerated via deck.gl: 3D extruded crime columns, time playback slider, heat+point+cluster layers simultaneously, 10M+ points. Drop-in React component, ~2h wiring.
**Warrant:** `external:` kepler.gl v3.3.0 (June 2026), GPU-powered, drop-in React, built-in time animation. `direct:` Our HotspotMap is flat Leaflet. Competitor ULTRON has Three.js 3D extruded map.
**Rationale:** In a 5-min demo, the map is on screen 60+ seconds. Flat heatmap vs 3D extruded columns + time animation is the difference between functional and impressive.
**Downsides:** +500KB bundle. Learning curve for layer config. May conflict with existing Leaflet styling.
**Confidence:** 85%
**Complexity:** Low-Medium (~4 hours)
**Status:** Unexplored

### 6. opensmith LLM Trace Dashboard
**Description:** Deploy opensmith (MIT, SQLite-backed LangSmith alternative) to capture every QuickML/Zia call: prompt, response, latency, tokens, fallback status. Frontend "AI Ops" panel shows: "Last 24h: 47 calls, 3 fallbacks, avg 2.3s, 12,847 tokens."
**Warrant:** `external:` opensmith (MIT, May 2026) is the open-source LangSmith alternative, 100% local. `direct:` Zero observability into AI function behavior — no way to know if QuickML is silently falling back.
**Rationale:** When a judge asks "how often does AI actually work vs fall back?" we currently cannot answer. opensmith gives operational credibility.
**Downsides:** Separate process (not inside Catalyst). Would need AppSail or external host.
**Confidence:** 75%
**Complexity:** Low-Medium (~1 day)
**Status:** Unexplored

## Rejection Summary

| # | Idea | Reason Rejected |
|---|------|-----------------|
| 1 | Siamese Autoencoder for case linkage | Research code, needs labeled data, too complex for timeline |
| 2 | ShotSpotter gunshot detection | Hardware + paid API, not feasible for prototype |
| 3 | WhatsApp bot for officers | No demo path, deviates from web dashboard |
| 4 | MLflow for model tracking | Overkill for 3 models; opensmith is lighter for LLM tracing |
| 5 | ChromaDB as vector DB | No geo-filtering; Qdrant is strictly better |
| 6 | Social media monitoring | Legal/privacy gray area for police prototype |
