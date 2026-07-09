# QuickML RAG Knowledge Base Setup — KSP BNS Legal Corpus

> Follow these steps once to create the legal RAG knowledge base in the QuickML console.
> After setup, the `QUICKML_KB_ID` environment variable must be set in the Catalyst console
> for `functions/legal_rag` to use QuickML RAG instead of TF-IDF.

## Prerequisites

- Access to Zoho Catalyst console → QuickML section
- BNS (Bharatiya Nyaya Sanhita) legal text PDF — must be under **500KB per file**

## Steps

### 1. Prepare the Knowledge Base Document

Chunk the full BNS text into sections that fit under the 500KB limit.

Recommended approach:
- **File 1**: `bns-1-150.pdf` — BNS Sections 1–150 (~400KB)
- **File 2**: `bns-151-300.pdf` — BNS Sections 151–300 (~350KB)
- **File 3**: `bns-301-400.pdf` — BNS Sections 301–400 + Schedule (~300KB)

Each file must be:
- PDF, DOCX, or TXT format
- Clean text (no scanned images — OCR first if needed using Zia OCR)
- Under 500KB

### 2. Create the Knowledge Base

1. Navigate to **QuickML** in Catalyst console
2. Click **Create Knowledge Base**
3. Name: `KSP BNS Legal Corpus`
4. Model: **Qwen 2.5-14B Instruct** (default, required)
5. Upload the first file (`bns-1-150.pdf`)
6. Wait for indexing to complete (~1-2 min)
7. Repeat for remaining files (up to 10 files per KB)

### 3. Get the Knowledge Base ID

1. Open the created Knowledge Base
2. Copy the **Knowledge Base ID** (format: `kb_xxxxxxxxxxxx`)
3. Set as environment variable in Catalyst console:
   - Go to **Functions** → `legal_rag` → **Configuration** → **Environment Variables**
   - Add: `QUICKML_KB_ID = kb_xxxxxxxxxxxx`

### 4. Verify the Setup

Test with a curl request:

```bash
curl -X POST https://<your-catalyst-app>/server/legal_rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the punishment for theft?"}'
```

Expected response (when RAG is working):
```json
{
  "answer": "According to BNS 379...",
  "sources": ["BNS 379"],
  "method": "rag"
}
```

Fallback response (when RAG is unavailable — TF-IDF used):
```json
{
  "answer": "Based on BNS 379...",
  "sources": ["BNS 379"],
  "method": "tfidf"
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `QuickML RAG query failed` error | Verify `QUICKML_KB_ID` env var is set in Catalyst console |
| File exceeds 500KB | Split into multiple files under 500KB each |
| KB not found | Ensure KB was created in the same Catalyst project |
| All responses use `method: 'zia'` | QuickML RAG call failed silently — check Catalyst logs |
| All responses use `method: 'tfidf'` | Both RAG and Zia failed — TF-IDF is the last-resort fallback |

## Re-chunking Notes

If legal text is updated (e.g., new BNS amendments):
1. Create a new KB with the updated files
2. Update `QUICKML_KB_ID` env var
3. Redeploy `legal_rag`
4. Old KB remains in QuickML (will not be auto-deleted)
