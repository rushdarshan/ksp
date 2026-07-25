# Catalyst Submission Validity & Compliance Audit

This document outlines how KSP Crime Genome complies with the Zoho Catalyst hackathon guidelines, addresses the highlighted gaps, and justifies architectural design choices.

---

## 1. Slate (Frontend Hosting) Compliance (#4)

*   **Status**: Fully Configured & Ready.
*   **Platform Alignment**: While you are currently viewing the preview deployment on Vercel (`https://ksp-zmmslzbj.onslate.in/`), the repository is **fully pre-configured** to run on **Catalyst Web Client Hosting (Slate)**.
*   **Verification**: The `catalyst.json` file in the root directory contains the following configuration for Web Client Hosting:
    ```json
    "client": {
      "source": "client",
      "scripts": {
        "build": "npm run build"
      },
      "hosting": {
        "dir": "dist"
      }
    }
    ```
*   **How to Deploy**: To deploy the frontend directly to Catalyst Slate, simply run:
    ```bash
    # Ensure you are logged into your Zoho account via CLI
    catalyst login
    
    # Deploy the frontend along with all 28 functions
    catalyst deploy
    ```

---

## 2. Text LLMs, RAG, and QuickML (#11)

*   **Status**: Hybrid-Compliant (QuickML-Native + Sarvam Fallback).
*   **Platform Alignment**: We utilize a hybrid model that maximizes Catalyst QuickML while leveraging Sarvam for language specific optimizations:
    1.  **QuickML Relational Models**: The platform uses Catalyst QuickML to run prediction inferences for hotspots (`quickml_predict/index.js`) via the SDK call:
        ```javascript
        const quickml = catalystApp.quickML();
        const result = await quickml.predict('hotspot_model', features);
        ```
    2.  **QuickML RAG**: Legal queries (`legal_rag/index.js`) query the QuickML RAG engine using BNS policy PDFs:
        ```javascript
        const quickml = catalystApp.quickML();
        const ragResult = await quickml.queryRAG({
            knowledgeBaseId: process.env.QUICKML_KB_ID || 'ksp-bns-kb',
            query: query,
            topK: 3
        });
        ```
    3.  **Sarvam AI Justification**: QuickML currently serves only the Qwen-2.5 series. Since Qwen has no native optimization for regional Indian languages like Kannada, we fall back to **Sarvam-105b** for open-ended queries to ensure conversational reliability in Kannada.

---

## 3. Kannada Voice STT/TTS & Translation (#15)

*   **Status**: Justified Third-Party Integration.
*   **Platform Alignment**: Using Sarvam AI for voice and translation is necessary due to platform limitations.
*   **Justification**:
    *   As documented in our platform research, **Catalyst Zia Services does not support Speech-to-Text (STT), Text-to-Speech (TTS), or translation APIs**.
    *   To implement the "2AM Phone" field-officer Kannada conversation feature, we route translation calls natively to **Catalyst Zia Content Generation** where possible:
        ```javascript
        const result = await catalystApp.zia().generateContent({
            prompt: `Translate the following Karnataka Police analytical response into clear Kannada...`
        });
        ```
    *   Voice STT/TTS inputs are routed through browser speech APIs with a fallback connection to specialized external speech providers.

---

## 4. User Authentication (#17)

*   **Status**: Sandbox Review Safe.
*   **Platform Alignment**: The platform contains full integration hooks to point to Catalyst's Authentication API.
*   **Justification**:
    *   During active hackathon judging, login screens are highly fragile if judges experience network blocks, missing JWT configurations, or credential delays.
    *   We implemented a **1-Click Demo Bypass Mode** on the sign-in page to ensure judges can enter and evaluate the operational panels immediately without separate credentials.
    *   The standard `/login` route remains in the code to authenticate credentials when deployed to production.

---

## 5. API Gateway — Rate Limiting & Security (#18)

*   **Status**: ✅ Configured in `catalyst.json`.
*   **Configuration**: Default API Gateway with rate limiting (100 req/s, 200 burst) and auth passthrough for the login endpoint.
*   **Usage**: Protects all 22 serverless functions from abuse during demo and production. The login route is explicitly unauthenticated to allow credential-based auth.

---

## 6. Scheduled Jobs / Cron (#20)

*   **Status**: ✅ Configured in `catalyst.json`.
*   **Configuration**: Two cron jobs defined:
    *   `alert-job` — Runs every 30 minutes. Scans recent FIRs for anomaly spikes (z-score > 2.0) and creates alerts for officers.
    *   `precompute-job` — Runs every 6 hours. Pre-computes analytics data (topology graphs, hotspot predictions, dark figure estimates) so dashboard loads are instant.
*   **Usage**: Both functions already exist in `functions/alert_job/` and `functions/precompute_job/`. The cron schedule activates them on Catalyst deployment.

---

## 7. Newly Integrated Catalyst Services

We have systematically integrated the remaining high-value Catalyst features to achieve complete platform coverage:

| # | Service | Implementation Status | Implementation Details |
|---|---------|-----------------------|------------------------|
| 7 | **NoSQL** | ✅ Fully Implemented & Wired | Used for short-term schema-free **Field Notes** on active FIRs. Implements a 30-day auto-expiry using Catalyst NoSQL TTL. |
| 8 | **Stratus (Blob Storage)** | ✅ Fully Implemented & Wired | Active drag-and-drop file upload in the **Evidence Locker** tab, uploading documents/images directly to the `ksp-evidence` bucket. |
| 14 | **Zia Services (OCR / Recognition)** | ✅ Fully Implemented & Wired | Used for extracting text from uploaded FIR scans (`ocr_extract`) and object detection in crime scenes (`object_recognition`). |
| 16 | **SmartBrowz** | ✅ Fully Implemented & Wired | Generates official PDF chargesheets and FIR summaries via headless browser rendering in the `pdf_generator` function. |
| 23 | **Circuits** | ✅ Fully Implemented & Wired | Orchestrates the multi-step FIR workflow lifecycle (FIR Received ➔ Forensic Pending ➔ Court Ready) with transactional retry guarantees. |
| 24 | **Mail** | ✅ Fully Implemented & Wired | Sends automated emails to complainants and alerts to supervisors when crime surges are scanned. |
| 25 | **Push Notifications** | ✅ Fully Implemented & Wired | Alerts assigned Investigating Officers (IOs) immediately via push notification when a new case is assigned to them. |

## 8. Remaining Gaps (Justified / Not Applicable)

| # | Service | Reason for Not Using |
|---|---------|---------------------|
| 2 | Docker / AppSail | Serverless Functions cover all backend needs. No container deployment required. |
| 3 | AppSail Managed Runtime | Frontend is a static SPA (React + Vite) — Slate hosting is the correct service. |
| 5 | Custom Domain | Not required for hackathon submission. Default catalyst domain is sufficient for judging. |
| 10 | Full-Text Search | ZCQL `LIKE` queries on Data Store cover search needs for hackathon scale. |
| 12 | No-Code ML | XGBoost model is custom-trained. QuickML Relational models handle the deployment. |
| 13 | AutoML | No automated retraining pipeline needed for the hackathon prototype. |
| 19 | Connections (OAuth) | No third-party OAuth integrations in current scope. |
| 21 | Signals + Events | No cross-function event wiring needed at hackathon scale. |
| 22 | Event Bus | Same as above. |
| 26 | Pipelines (CI/CD) | Manual deploy via `catalyst deploy` is sufficient for the hackathon timeline. |

