# Project Filetree

_Auto-maintained. One-line role summary per file, grouped by directory._

## (root)/

- `README.md`: Project entry doc — KSP Crime Genome for Karnataka Police datathon
- `DESIGN.md`: Design system tokens, color palette, typography, spacing specs
- `PLAN.md`: High-level implementation plan with architecture layers
- `PRODUCT.md`: Product vision — transformation from analytics dashboard to Investigation OS
- `CLAUDE.md`: AI agent workspace instructions and configuration
- `catalyst-research.md`: Zoho Catalyst platform research findings and constraints
- `opencode.json`: OpenCode agent configuration for repo-aware coding
- `catalyst.json`: Zoho Catalyst deployment configuration and function routing
- `.catalystrc`: Catalyst CLI local environment config
- `.gitignore`: Git ignore rules for Node, Vite, Python, and IDE artifacts
- `generate_ksp_data.py`: Synthetic FIR and police data generator script
- `quickml_pipeline.py`: QuickML XGBoost model training and deployment pipeline
- `xgboost_hotspot_model.pkl`: Trained hotspot prediction model artifact

## client/

- `package.json`: Vite React app dependencies, scripts, and version
- `package-lock.json`: Locked dependency tree for reproducible installs
- `vite.config.js`: Vite build config with proxy and plugin setup
- `index.html`: App entry HTML with root mount point
- `.eslintrc.cjs`: ESLint configuration for React/JSX linting
- `.gitignore`: Client-specific git ignore rules
- `README.md`: Client setup instructions and dev guide
- `skills-lock.json`: Pinned skill dependency versions
- `mock-api-data.js`: Mock API response definitions for offline frontend dev
- `mock-server-plugin.js`: Vite plugin that intercepts API calls with mock data

## client/src/

- `main.jsx`: React entry point — renders App with router
- `App.jsx`: Root component — hash router, auth provider, lazy-loaded role dashboards
- `App.scss`: Global styles, CSS custom properties, design token variable definitions
- `AuthContext.jsx`: Auth state provider — login token, user role, session management
- `FilterContext.jsx`: Global date range, station, crime type filter state
- `PanelGuard.jsx`: Role-based route guard restricting admin panels by user role

## client/src/Components/

### Flat panels (analytics dashboard panels)
- `AccusedAtLargePanel.jsx`: Absconding accused tracker with status badges and station filter
- `AgentPanel.jsx`: AI cross-check agent findings — linked FIRs and match dimensions
- `AlertsFeed.jsx`: Real-time alerts feed for crime spikes and anomalies
- `ArrestVectorPanel.jsx`: Arrest timeline map with response tiers and gravity markers
- `BeatOptimizerPanel.jsx`: Patrol beat optimization with district selector and route view
- `ChargesheetClockPanel.jsx`: Chargesheet SLA deadline tracker with overdue flags
- `CoAccusedNetworkPanel.jsx`: Force-directed co-accused relationship graph with gang clustering
- `CounterCrimePanel.jsx`: Crime simulation engine — what-if patrol and resource allocation
- `DarkFigurePanel.jsx`: Estimated unreported crime rate per type with confidence intervals
- `DeterrenceDashboard.jsx`: Deterrence effect analysis — patrol impact on crime rates
- `FairnessAuditPanel.jsx`: ML model fairness audit — demographic parity and bias detection
- `FilterBar.jsx`: Global search/filter bar — station, crime type, date range controls
- `FirQualityPanel.jsx`: FIR quality scoring — completeness, consistency, timeliness metrics
- `GbvPanel.jsx`: Gender-based violence analytics with trend charts and resource finder
- `HotspotMap.jsx`: Leaflet heatmap of crime hotspots powered by predictive risk data
- `MyDayDashboard.jsx`: Priority case queue — urgent, high, medium sorted by severity
- `NetworkGraph.jsx`: Force-directed crime network graph with community color coding
- `NotificationInbox.jsx`: Case management notification inbox with drill-down detail
- `PersonPage.jsx`: Person 360 profile — cases, PII masking, risk scores, cross-case timeline
- `PredictivePanel.jsx`: Crime prediction cards — type, location, confidence, reasoning
- `RetractionRatePanel.jsx`: FIR retraction analysis — per-station and per-officer breakdown
- `SolvabilityBadge.jsx`: Case solvability score badge with color-coded probability
- `TopologyPanel.jsx`: Crime topology graph — inter-crime-type transition probabilities
- `VeracityPanel.jsx`: FIR veracity analyzer — VeriPol-style genuine vs fabricated detection
- `VictimRiskPanel.jsx`: Victim risk scoring — recidivism, flight, retaliation risk metrics
- `VoiceQuery.jsx`: ZIA voice query — Kannada STT, translate, RAG answer, TTS playback

## client/src/Components/CaseWorkspace/

- `CaseWorkspace.jsx`: Investigation case workspace — 8-tab layout with case context provider
- `CaseOverview.jsx`: Case summary — FIR details, status, assigned IO
- `CaseTimeline.jsx`: Chronological case event timeline
- `CaseStrengthMeter.jsx`: CSM score bar with factor breakdown for case strength
- `EvidenceReview.jsx`: Evidence catalog — digital, forensic, witness, physical with AI analysis
- `EntityGraphPanel.jsx`: Entity relationship graph within a single case
- `AIIntelligenceBrief.jsx`: ZIA-generated intelligence brief synthesizing all case signals
- `AIIntelligenceBrief.scss`: Intelligence brief component styles
- `ChargesheetIntelligence.jsx`: Auto-generated chargesheet intelligence with BNS section mapping
- `TheoryBoard.jsx`: Hypothesis tracking board — active, proven, dismissed theories
- `TheoryBoard.scss`: Theory board component styles
- `MemoryNotSearch.jsx`: Memory-not-search evidence — non-digital sources
- `EvidenceClassification.jsx`: Evidence type classification and chain-of-custody viewer
- `CaseNotes.jsx`: Free-form investigation case notes editor

## client/src/Components/ChatPanel/

- `ChatPanel.jsx`: ZIA chat interface — slash commands, case context, markdown responses
- `ChatPanel.scss`: Chat panel component styles

## client/src/Components/CommandPalette/

- `CommandPalette.jsx`: Cmd+K quick search — navigate panels, FIRs, officers, persons

## client/src/Components/Dashboard/

- `Dashboard.jsx`: Shell wrapper for main dashboard (basePath=/dashboard)
- `Components/Body Section/Body.jsx`: Dashboard main body — lazy-loaded panel routing
- `Components/Body Section/body.scss`: Body section styles
- `Components/Body Section/Powerbi/Powerbi.jsx`: PowerBI embedded analytics integration

## client/src/Components/Details/

- `Details.jsx`: Officer detail page — performance metrics, clearance rates, conviction stats
- `ChartOne.jsx`: Reusable data fetch hook and chart component
- `ConvictionChart.jsx`: Conviction rate visualization for officer profiles
- `AnimatedNumber.jsx`: Animated counter for numerical stats display
- `Inspector.png`: Inspector avatar image asset

## client/src/Components/FirDetails/

- `Firdetails.jsx`: FIR list and detail view — data fetching and routing
- `CrimeGenomePanel.jsx`: Full crime genome profile — DNA-style crime signature visualization
- `AddFir.jsx`: New FIR registration form with validation
- `DetailedFir.jsx`: Individual FIR full detail view
- `FirList.jsx`: FIR list outlet wrapper for nested routes

## client/src/Components/InspectorDash/

- `InspectorDash.jsx`: Shell wrapper for inspector role dashboard (basePath=/inspector)
- `Components/Body Section/Body.jsx`: Inspector dashboard body content

## client/src/Components/Login/

- `Login.jsx`: Login page with credentials, role selector, background video
- `Login.css`: Login page styles

## client/src/Components/Map/

- `Map2.jsx`: Crime command map — search, markers, heatmap layers
- `MapComponent.jsx`: Leaflet map with routing, geocoding, custom markers
- `SearchLocation.jsx`: Location search input with geocoding autocomplete
- `map.module.scss`: Map component CSS module styles
- `map.css`: Legacy map styles
- `map.css.map`: CSS source map

## client/src/Components/MyDay/

- `DailyBrief.jsx`: Daily briefing card — priority alerts, stats summary
- `AlertsFeed.jsx`: My Day alerts feed — critical and high-priority notifications
- `CaseCard.jsx`: Case card component for priority queue display
- `myday.scss`: My Day section styles
- `index.js`: My Day module barrel export

## client/src/Components/Officers/

- `Officers.jsx`: Officer roster with search, filter, role-based detail links
- `OfficersList.jsx`: Officer list sub-component
- `Inspectors/inspectors.jsx`: Inspector-specific roster view and assignments
- `Inspectors/Person.png`: Inspector person placeholder image
- `subInspectors/SubInspector.jsx`: Sub-inspector roster view

## client/src/Components/Person360/

- `RiskScores.jsx`: ZIA risk metrics — recidivism, flight, retaliation scores
- `CrossCaseTimeline.jsx`: Cross-case involvement timeline for a person

## client/src/Components/Regsiter/

- `Register.jsx`: User registration page with form validation
- `Register.css`: Registration page styles

## client/src/Components/Shell/

- `Shell.jsx`: App shell — sidebar, top bar, error boundary, right sidebar
- `Sidebar.jsx`: Navigation sidebar — role-based menus, icons, collapse toggle
- `Top.jsx`: Top navigation bar — breadcrumbs, search, user menu
- `RightSidebar.jsx`: Right contextual sidebar (alerts, notifications)
- `ErrorBoundary.jsx`: React error boundary for graceful crash recovery
- `sidebar.scss`: Sidebar component styles
- `top.scss`: Top bar component styles

## client/src/Components/SubInspectorDash/

- `SubinspectorDash.jsx`: Shell wrapper for sub-inspector dashboard
- `Components/Body Section/Body.jsx`: Sub-inspector dashboard body content

## client/src/Components/SubordinateDetails/

- `Details/Details.jsx`: Subordinate officer performance detail view
- `Details/ChartOne.jsx`: Subordinate metrics chart component
- `Details/index.module.css`: Subordinate details CSS module

## client/src/Components/Supervisor/

- `StationOverview.jsx`: Station-level case overview with CSM scores and flags
- `ChargesheetReview.jsx`: Chargesheet review queue — approve, return, feedback
- `StationOverview.scss`: Station overview styles
- `ChargesheetReview.scss`: Chargesheet review styles

## client/src/Components/TheoryBoard/

- `TheoryBoard.jsx`: Investigation theory board — hypothesis cards with evidence links
- `theoryboard.scss`: Theory board component styles

## client/src/Components/panels/

- `index.ts`: Panel component barrel exports (PanelCard, PanelHeader, etc.)
- `PanelCard.tsx`: Reusable card container with title, badge, loading/empty states
- `PanelHeader.tsx`: Panel header with title and action slot
- `PanelChart.tsx`: Panel chart wrapper for consistent chart rendering
- `PanelTable.tsx`: Panel data table with consistent styling
- `PanelBadge.tsx`: Status badge component (good/warning/critical)

## client/src/ui/

- `Dropdown/Dropdown.jsx`: Radix-based dropdown menu (user settings, logout)
- `Dropdown/Loader.jsx`: Loading spinner component
- `Dropdown/RedactionSkeleton.jsx`: Redaction-themed skeleton loader for suspense fallback
- `Dropdown/dropdown.css`: Dropdown component styles
- `Dropdown/redaction-skeleton.css`: Skeleton loader styles
- `Popup/Popup.jsx`: Notification toast popup component
- `Popup/popup.module.css`: Popup component CSS module

## client/src/utils/

- `apiFetch.js`: Authenticated fetch wrapper with Bearer token and 401 redirect
- `piiMask.js`: PII masking utilities — Aadhaar, phone number partial reveal
- `utility.js`: Shared helpers — color gen, element counting, clearance/conviction rates

## client/src/styles/

- `components.css`: Shared component-level CSS tokens and overrides
- `mobile.css`: Mobile-responsive layout breakpoints and adjustments

## client/src/Pages/Homepage/

- `Landingpage.jsx`: Public landing page — navigation, hero, footer sections
- `landingpage.css`: Landing page styles
- `Components/Navigation.jsx`: Top navigation bar with auth links
- `Components/Hero.jsx`: Hero section — workflow steps, features, CTA buttons
- `Components/Footer.jsx`: Landing page footer
- `assets/hero.jpg`: Hero background image
- `assets/logo.png`: KSP Crime Genome logo

## client/src/LoginAssets/

- `logo.png`: Login page logo
- `video.mp4`: Login page background video

## functions/

### Each function is a Zoho Catalyst Node.js serverless function with `index.js` + `package.json`.

- `fir_api/`: FIR CRUD API — list, search, filter cases from Catalyst Data Store
- `agentic_police/`: AI cross-check agent — links related FIRs across matched dimensions
- `veracity_index/`: VeriPol-style FIR veracity analysis — linguistic markers for fabrication
- `victim_risk_shield/`: Victim risk scoring — recidivism, flight, retaliation risk computation
- `solvability_index/`: Case solvability scoring — evidence, witnesses, MO pattern match
- `fir_quality/`: FIR quality scoring — completeness, consistency, timeliness metrics
- `predictive_mode/`: Crime prediction — heuristic forecasts by district with time windows
- `beat_optimizer/`: Patrol beat optimization — crime-weighted routing and resource allocation
- `topology_navigator/`: Crime topology — inter-crime-type transition matrix and cluster maps
- `dark_figure/`: Dark figure estimation — unreported crime rates by district demographics
- `fairness_audit/`: ML fairness audit — demographic parity, disparate impact per model
- `countercrime/`: Counter-crime simulation — what-if resource allocation and hotspot analysis
- `gbv_analytics/`: Gender-based violence analytics — trends, hotspots, resource locator
- `daily_brief/`: Automated daily brief generation — crime stats, anomaly alerts per district
- `alert_job/`: Scheduled alert job — cross-check anomalies and create alerts in Data Store
- `precompute_job/`: Warmer job — precomputes cache for dashboard panels on schedule
- `case_management/`: Case management workflow — stages, checklists, investigation leads
- `legal_rag/`: Legal RAG — BNS section lookup, keyword matching for chargesheet guidance
- `zia_brief/`: ZIA intelligence brief — multi-source synthesis and AI analyst brief generation
- `zia_voice/`: ZIA voice pipeline — Kannada STT, translation, query, TTS responses
- `quickml_predict/`: QuickML XGBoost prediction — hotspot forecasts from trained model
- `transit_detection/`: Transit anomaly detection — BLS algorithm for crime rate surges
- `exceedance_curve/`: Exceedance probability curves — return-period crime level estimates
- `shared/`: Shared utilities — cross-check engine, analyzer, quality score, cache, PII mask

## appsail/

- `batch_veracity/main.py`: Batch veracity processor — scheduled FIR corpus re-analysis
- `network_analysis/app.py`: Network analysis Flask app — graph computation service
- `network_analysis/requirements.txt`: Python dependencies for network analysis service

## synthetic_data/

- `1_State.csv`: State master table (Karnataka state records)
- `2_District.csv`: District master table (10 Karnataka districts)
- `3_UnitType.csv`: Police unit type classification (PS, CCB, etc.)
- `4_Unit.csv`: Police station unit master data
- `5_Rank.csv`: Police rank master (SI, Inspector, etc.)
- `6_Designation.csv`: Officer designation master
- `7_Employee.csv`: Police employee/personnel records
- `8_CaseCategory.csv`: Case category taxonomy
- `9_GravityOffence.csv`: Offence gravity classification (felony/misdemeanour/petty)
- `10_CrimeHead.csv`: Crime head master table (theft, murder, etc.)
- `11_CrimeSubHead.csv`: Crime sub-head categorization
- `12_Act.csv`: Legal Act master (BNS, IPC, CrPC, Special Laws)
- `13_Section.csv`: Legal section master with descriptions
- `14_CrimeHeadActSection.csv`: Crime head to Act/Section mapping join table
- `15_CaseStatusMaster.csv`: Case status lifecycle (filed, investigation, trial, etc.)
- `16_Court.csv`: Court master table (jurisdictions and levels)
- `17_OccupationMaster.csv`: Victim/accused occupation reference data
- `18_ReligionMaster.csv`: Religion reference data
- `19_CasteMaster.csv`: Caste reference data
- `20_CaseMaster.csv`: Core case/FIR master records (500K synthetic cases)
- `21_ComplainantDetails.csv`: Complainant personal and contact details
- `22_Victim.csv`: Victim demographics and relation to accused
- `23_Accused.csv`: Accused records with charges and status
- `24_ActSectionAssociation.csv`: Act-Section legal association lookup
- `25_ArrestSurrender.csv`: Arrest and surrender event records
- `26_ChargesheetDetails.csv`: Chargesheet submission records with dates

## docs/

- `design-language.md`: Design system source of truth — tokens, components, motion rules
- `implementation-plan.md`: Architecture overview — 5-layer stack, function map, data flow
- `quickml-kb-guide.md`: QuickML RAG knowledge base setup for BNS legal corpus

### docs/ideation/

- `2026-07-14-full-product-redesign-ideation.md`: Full redesign ideation — Investigation OS concept
- `2026-07-08-technology-upgrades-ideation.md`: Technology stack upgrade brainstorming
- `2026-07-08-ps2-gap-analysis-ideation.md`: Phase 2 gap analysis and feature priorities
- `2026-07-07-mutual-accusation-signal-ideation.md`: Mutual accusation signal detection ideation
- `2026-07-07-frontend-improvements-ideation.md`: Frontend UX and component improvements
- `2026-07-01-crime-genome-improvements-ideation.md`: Initial crime genome feature brainstorming
- `arrest-vector-brainstorm.md`: Arrest vector visualization and optimization ideas

### docs/plans/

- `2026-07-14-001-feat-hackathon-winning-polish-plan.md`: Hackathon polish — animations, refined UX
- `2026-07-14-002-feat-investigation-os-redesign-plan.md`: Investigation OS redesign — Mission Control, Theory Board
- `2026-07-14-003-fix-critique-anti-patterns-plan.md`: Anti-pattern fixes from design critique
- `2026-07-14-004-refactor-audit-fixes-plan.md`: Code audit and refactoring plan
- `2026-07-07-001-refactor-dashboard-design-system-reconcile-plan.md`: Dashboard refactor and design system reconciliation
- `2026-07-07-002-feat-winning-combination-plan.md`: Winning combination feature — cross-panel signals
- `2026-07-02-001-feat-crime-genome-four-features-plan.md`: Four-feature crime genome enhancement plan
- `2026-07-02-002-feat-direction-plans-agentic-case-court-plan.md`: Agentic case and court workflow plan
- `2026-07-02-003-feat-proactive-agentic-policing-plan.md`: Proactive agentic policing feature plan
- `2026-07-01-001-feat-crime-genome-three-features-plan.md`: Initial three-feature crime genome implementation

### docs/redesign/

- `01-product-strategy.md`: Product strategy audit — from dashboard to Investigation OS
- `02-enterprise-ux-audit.md`: Enterprise UX benchmark — Palantir, Linear, Figma patterns
- `03-design-system.md`: Phase 3 design system tokens — typography, color, spacing, elevation
- `04-motion.md`: Motion system — investigation-metaphor animations and transition specs

### docs/brainstorms/

- `redesign-product-vision.md`: Full product redesign vision and requirements document

## plans/

- `README.md`: Plans directory index and usage guide
- `001-rewrite-readme.md`: README rewrite plan — section-by-section content map

## .opencode/

Skilling and agent configuration files for OpenCode AI coding environment.
