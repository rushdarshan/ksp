# Zoho Catalyst Platform Research — KSP Dashboard Datathon

> Research date: 2026-07-07 | Platform: Zoho Catalyst (PaaS)

---

## 1. Service Matrix

### Slate (Frontend Hosting)

| Aspect | Detail |
|---|---|
| **Purpose** | Static/SPA hosting — deploy React, Next.js, Vue, Angular, Astro, SolidJS, Svelte, Vite, Nuxt, Preact |
| **Deploy methods** | Git integration (GitHub/GitLab/Bitbucket), CLI (`catalyst deploy slate`), direct ZIP upload, public repo clone |
| **Key features** | Free SSL, custom domain mapping, per-deployment preview URLs, env var management, rollback, auto-deploy on git push |
| **Limitations** | No server-side runtime — purely static build output served via CDN. No custom headers config. No edge functions |
| **Free tier** | 300k requests/mo (via web client hosting bundle) |
| **Pricing** | Pay-as-you-go beyond free tier; $5/mo min billing if exceeded |

### Data Store (Relational DB)

| Aspect | Detail |
|---|---|
| **Engine** | Proprietary cloud relational DB (Catalyst-managed) |
| **Query language** | ZCQL (SQL-like: SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY, WHERE, LIMIT, etc.) |
| **Schema** | Console-driven table/column creation; columns typed (STRING, INTEGER, DECIMAL, DATE, BOOLEAN, etc.) |
| **Scopes & permissions** | Per-table: public (no auth), authenticated (any logged-in user), role-restricted (specific roles only), admin-only. CRUD scopes per role |
| **OLAP** | Built-in OLAP database — run analytics queries without affecting primary DB |
| **SDKs** | Java, Node.js, Python, JS (Web), Flutter, iOS, Android + REST API |
| **Bulk ops** | Bulk Insert/Read/Write/Delete via background queues |
| **Search** | Catalyst Search integration on indexed columns |
| **Free tier** | 2GB storage, 10k SELECT/mo, 5k INSERT/mo, 1k UPDATE/mo, 1k DELETE/mo |
| **Limitations** | No foreign key constraints. No custom indices beyond what the console provides. No stored procedures or triggers (use Event Listeners + Functions instead) |
| **Pricing** | Pay-as-you-go beyond free tier |

### Serverless Functions (FaaS)

| Aspect | Detail |
|---|---|
| **Runtimes** | Node.js (24, 22, 20, 18, 16, 14), Java (25, 21, 17, 11, 8), Python (3.13, 3.12, 3.11, 3.10) |
| **Function types** | Basic I/O (string in/out), Advanced I/O (HTTP req/res), Event (triggered by listeners), Cron (scheduled), Integration (Zoho services), Job (job pool execution), Browser Logic (SmartBrowz) |
| **Execution limit** | Basic/Advanced I/O: **30 seconds**. Event/Cron/Job: **15 minutes** |
| **Memory** | Configurable per function (e.g., 128 MB–1 GB) |
| **Cold starts** | Yes — typical for serverless; no "provisioned concurrency" option |
| **Orchestration** | **Circuits** — DAG-based workflow engine to chain function executions, handle parallelism, retries, error handling |
| **Free tier** | 25k GB-seconds/mo |
| **Pricing** | Pay-as-you-go beyond free tier |

### QuickML — LLM Serving, RAG, AutoML

| Aspect | Detail |
|---|---|
| **LLM Serving models** | Qwen 2.5-14B Instruct (128k context), Qwen 2.5-7B Coder (128k), Qwen 2.5-7B Vision Language (multimodal, ~9k tokens with 3 images) |
| **RAG** | One-click: upload PDF/DOCX/TXT → KB → chat. Uses Qwen 2.5-14B. Supports citations/response breakdown. Zoho WorkDrive/Learn integration. **Early access** |
| **RAG limitations** | Only Qwen 2.5-14B. 500KB max per file upload. Chats not persisted (lost on refresh). User-specific (no shared chats) |
| **AutoML pipelines** | No-code drag-drop. Algorithms: classification, regression, ensemble, recommendation, time series, clustering, anomaly detection, text analytics |
| **Data sources** | Zoho apps (200k records), cloud storage (1GB), databases (100k records), file upload (1GB) |
| **Pipeline limits** | 25 datasets, 25 pipelines, 10 endpoints max |
| **Model prediction** | 500 calls/mo free |
| **Data centers** | US, IN, EU |
| **Note** | No GLM 4.7 — the available LLMs are exclusively Qwen 2.5 series |

### Zia Services (AI Microservices)

| Service | Capabilities | Language support | Free tier |
|---|---|---|---|
| **OCR** | Text detection in images/documents. Handwritten (if legible). PDF, JPEG, PNG, TIFF, BMP | **Kannada** + 10 other Indian langs + 8 international | 100 APIs/mo |
| **Face Analytics** | Face detection, age/gender/emotion, smile, landmarks, up to 10 faces/image | — | 100 APIs/mo |
| **Text Analytics** | Sentiment analysis, NER, keyword extraction | — | 100 APIs/mo |
| **Identity Scanner** | AADHAAR, PAN, CHEQUE, PASSBOOK | — | 100 APIs/mo |
| **Image Moderation** | NSFW/content moderation | — | 100 APIs/mo |
| **Object Recognition** | Detect objects in images | — | 100 APIs/mo |
| **Barcode Scanner** | Scan barcodes in images | — | 100 APIs/mo |
| **Missing** | **No STT (speech-to-text)** | ❌ | ❌ |
| **Missing** | **No TTS (text-to-speech)** | ❌ | ❌ |
| **Missing** | **No translation API** | ❌ | ❌ |

### AppSail (Docker/PaaS)

| Aspect | Detail |
|---|---|
| **Purpose** | Long-running web services/containers. Use for Python ML models, APIs >30s, anything needing persistent process |
| **Runtimes (managed)** | Java (Spring Boot, Jetty, Spring MVC), Node.js (Express, Hapi, Koa, Fastify, Restify), Python (Flask, Django, Bottle, CherryPy, Tornado) |
| **Custom runtimes** | OCI containers from Docker Hub, AWS ECR, Google Artifact Registry, or local (any language: Go, PHP, Ruby, etc.) |
| **Scaling** | Auto-scales instances up/down based on traffic |
| **Free tier** | 15 GB-hours/mo |
| **Limitations** | Only Linux AMD64 OCI images supported |
| **Pricing** | Pay-as-you-go |

### Job Scheduling (Cron + Job Pool)

| Aspect | Detail |
|---|---|
| **Types** | Pre-defined cron (console), Dynamic cron (SDK, runtime) |
| **Targets** | Webhooks (any URL), Circuits, Job Functions, AppSail services |
| **Job timeout** | **15 minutes** max per job execution |
| **Retries** | Up to 10 retries, 1 min–24 hr interval |
| **Cron limit** | 500 executions/day in dev (unlimited in production) |
| **Free tier** | Included in Functions/AppSail tiers |
| **Use case** | Batch ML inference, nightly data pipeline, report generation beyond 30s |

### Authentication & RBAC

| Aspect | Detail |
|---|---|
| **Auth types** | Hosted (Catalyst-managed login UI), Embedded (custom UI with SDK), Third-party (Auth0, Okta, OneLogin), Social (Google, Zoho) |
| **User management** | CRUD users via console or SDK. Enable/disable accounts, reset passwords |
| **Roles** | Custom roles with per-table Data Store scopes (read/write/delete). Role-based Data Store access |
| **Permissions scope** | Public, authenticated user, role-specific, admin-only per table |
| **Free tier** | Unlimited users |

---

## 2. Integration Patterns

### Pattern A: Standard Web App with LLM
```
Slate (React/Next.js UI)
  ↕ HTTP + OAuth
Functions (Node.js 24 — 30s request/response)
  ↕ SDK
Data Store (relational — users, dashboards, scores)
QuickML (LLM Serving API — Qwen 2.5-14B)
Zia OCR (Kannada document scanning)
```

### Pattern B: Long-running ML Pipeline
```
Slate (frontend)
  ↕
Functions (short-lived orchestration, <30s)
  ↕ triggers
Job Scheduling (Cron → Job Pool → 15 min job)
  ↕
AppSail (Python Flask — scikit-learn inference)
  ↕
Data Store + Stratus (object storage for models/data)
```

### Pattern C: RAG-based Knowledge Assistant
```
Slate (chat UI)
  ↕
Functions (auth + query routing)
  ↕
QuickML RAG API (Qwen 2.5-14B + KB documents)
  ↕
Data Store (user sessions, Q&A logs)
Stratus (PDF document storage for KB uploads)
```

### Pattern D: Event-driven Data Pipeline
```
Cron (hourly trigger)
  → Job Pool → Job Function (15 min — fetches + transforms data)
  → Data Store (writes results)
  → QuickML (triggers AutoML retrain)
  → Circuit (orchestrate post-processing)
```

---

## 3. KSP Architecture Map

| KSP Feature | Catalyst Service | Notes |
|---|---|---|
| **User dashboard** | Slate (React) | Full SPA hosting |
| **User auth/login** | Catalyst Authentication | RBAC with custom roles |
| **Kannada document upload** | Slate upload → Stratus (storage) | For document storage |
| **Kannada OCR** | Zia OCR (language: kan) | Supports Kannada! |
| **Financial data storage** | Data Store (relational) | Schema: users, schemes, applications, documents, scores |
| **Scheme eligibility logic** | Functions (Node.js/Python) | <30s execution |
| **Chatbot / Q&A** | QuickML LLM Serving (Qwen 2.5-14B) | Or RAG for policy docs |
| **RAG on KSP policy PDFs** | QuickML RAG | Upload PDFs → query chat |
| **ML model (eligibility prediction)** | QuickML AutoML or AppSail (Python model) | AutoML for no-code; AppSail for custom |
| **Scheduled report generation** | Job Scheduling (Cron → Job Pool) | Up to 15 min |
| **Long-running ML inference** | AppSail (Python Flask/Django) | For >30s tasks |
| **Analytics queries** | Data Store OLAP | Aggregation without affecting primary |
| **Email notifications** | Catalyst Mail | 100 emails/mo free |
| **Document storage (PDFs/images)** | Stratus (object store) | S3-compatible |
| **File storage (temp uploads)** | File Store | 5GB free |
| **API rate limiting/routing** | API Gateway | Throttling, auth |
| **Workflow orchestration** | Circuits | DAG multi-function chaining |
| **Caching** | Catalyst Cache | For frequent lookups |

---

## 4. Pitfalls & Limitations

### Critical
1. **No STT/TTS/Translation** — Zia has no speech or translation services. Kannada voice input/TTS is **not possible** with Catalyst alone. You'd need a third-party API (Google Cloud Speech/Translate, Azure Cognitive Services) called via Functions.
2. **Functions 30s hard limit** — Any HTTP-triggered function crashes at 30s. Use Job Functions (15 min) or AppSail for longer work.
3. **RAG is early access** — Limited to Qwen 2.5-14B, 500KB per file, chats not persisted, user-specific only.
4. **No GLM 4.7** — QuickML uses Qwen 2.5 series exclusively. If GLM was expected, adjust.
5. **Cold starts** — Functions have no warm-from-idle guarantee; expect ~1-3s cold start.

### Moderate
6. **Data Store is not full SQL** — ZCQL is SQL-like but proprietary. No foreign keys, no stored procedures, no triggers.
7. **Slate is static-only** — No SSR (Next.js runs at build time, not at request time on Catalyst). Deploying Next.js means static export mode.
8. **500 cron executions/day in dev** — Fine for dev, but hit this during heavy testing.
9. **$5/mo min billing** — Kicks in if any single free tier is exceeded per project. Plan usage carefully.
10. **Zia OCR free tier** — Only 100 API calls/month. For any real document volume, you'll exceed this quickly.

### Minor
11. **QuickML pipeline limits** — 25 datasets, 25 pipelines, 10 endpoints max.
12. **RAG file upload 500KB** — Larger PDFs must be pre-chunked externally.
13. **No websocket support** — Real-time features need polling or external service.
14. **Zia services limited to IN/US/EU data centers** — Verify KSP datacenter location.

---

## 5. Recommendation

**Start with:**
- **Slate** for the React/Next.js frontend
- **Functions (Node.js)** for all API endpoints (<30s)
- **Data Store** for all structured data
- **Catalyst Authentication** for user roles (citizen, official, admin)
- **Zia OCR** for Kannada document scanning (one-time per doc, stays within free tier for prototype)
- **QuickML LLM Serving** for the chatbot (not RAG for v1 — just prompt engineering on Qwen 2.5-14B)

**Add when needed:**
- **QuickML RAG** for policy document Q&A (after KB is populated)
- **AppSail (Python/Flask)** for custom ML inference if QuickML AutoML can't handle the model type
- **Job Scheduling** for nightly batch processing of applications
- **Stratus** for storing uploaded PDFs/images beyond 5GB

**What you'll need externally:**
- **STT/TTS** — if Kannada voice is required, use Google Cloud Speech-to-Text + Text-to-Speech via Functions
- **Translation** — if needed, third-party API via Functions
- **Realtime** — if needed, external WebSocket provider or polling

**Pricing guard:**
- Free tier is generous for a prototype/demo (2GB DB, 25k GB-sec functions, 500 LLM calls)
- Stay under free tier limits to avoid the $5/mo/project minimum
- $250 new-user credits give buffer for 6 months
