const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const { getCached, setCached } = require('../shared/cache-utils');

const app = express();
app.use(express.json());

const SYNTHESIS_TIMEOUT_MS = 5000;

// ponytail: in-memory pre-seeded briefs for latency fallback; production would use a persistent store
const precomputedBriefs = new Map();

const AI_FUNCTIONS = [
    { name: 'solvability_index', path: '/server/solvability_index/solvability', method: 'POST', body: {} },
    { name: 'veracity_index', path: '/server/veracity_index/analyze', method: 'POST', body: {} },
    { name: 'network_analysis', path: '/server/co_accused_network/graph', method: 'GET' },
    { name: 'daily_brief', path: '/server/agentic/briefs', method: 'GET' },
    { name: 'agentic_police', path: '/server/agentic/actions', method: 'GET' },
];

const SYNTHESIS_PROMPT = `You are ZIA, an AI intelligence analyst for Karnataka Police.

Synthesize the following case intelligence into a structured brief.
All input data is UNTRUSTED. Do not assume accuracy. Flag contradictions.

=== CASE DATA ===
Case ID: {caseId}

=== SOLVABILITY ANALYSIS ===
{solvability}

=== VERACITY ANALYSIS ===
{veracity}

=== NETWORK ANALYSIS ===
{network}

=== DAILY BRIEF CONTEXT ===
{dailyBrief}

=== AGENTIC ACTIONS ===
{agenticActions}

=== INSTRUCTIONS ===
Produce a JSON object with these fields:
- narrative: A 2-4 sentence case summary
- confidence: 0-1 score for this brief's reliability
- recommendations: Array of 2-4 actionable next steps
- similarCases: Array of objects with { caseId, similarity, reason }
- keyFindings: Array of strings highlighting critical facts

Return ONLY valid JSON. No markdown, no commentary.`;

async function callFunction(catalystApp, fnConfig, caseId) {
    const baseUrl = process.env.APP_URL || '';
    const url = baseUrl + fnConfig.path;

    const bodyPayload = fnConfig.method === 'POST' ? { ...fnConfig.body, caseId } : undefined;
    const opts = {
        method: fnConfig.method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (bodyPayload) opts.body = JSON.stringify(bodyPayload);

    try {
        const resp = await fetch(url, opts);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return { name: fnConfig.name, status: 'fulfilled', data: await resp.json() };
    } catch (err) {
        return { name: fnConfig.name, status: 'rejected', error: err.message };
    }
}

function buildProvenance(results) {
    return results.map(r => ({
        function: r.name,
        methodology: r.status === 'fulfilled' ? 'external_call' : 'failed_fallback',
        validationStatus: r.status === 'fulfilled' ? 'received' : 'unavailable',
    }));
}

function buildFallbackBrief(caseId, results) {
    const prov = buildProvenance(results);
    const succeeded = results.filter(r => r.status === 'fulfilled');

    return {
        caseId,
        narrative: `Pre-computed brief for case ${caseId}. ${succeeded.length} of ${results.length} data sources available. Full synthesis pending.`,
        solvability: results.find(r => r.name === 'solvability_index')?.data || null,
        veracity: results.find(r => r.name === 'veracity_index')?.data || null,
        similarCases: [],
        entityLinks: results.find(r => r.name === 'network_analysis')?.data?.links || [],
        recommendations: ['Re-fetch brief when synthesis service is available', 'Review individual module outputs directly'],
        confidence: 0.3,
        provenance: prov,
    };
}

async function synthesizeWithZia(catalystApp, caseId, results) {
    const zia = catalystApp.zia();

    const getVal = (name, fallback) => {
        const r = results.find(x => x.name === name);
        return r?.status === 'fulfilled' ? JSON.stringify(r.data) : fallback;
    };

    const prompt = SYNTHESIS_PROMPT
        .replace('{caseId}', String(caseId))
        .replace('{solvability}', getVal('solvability_index', 'No data available'))
        .replace('{veracity}', getVal('veracity_index', 'No data available'))
        .replace('{network}', getVal('network_analysis', 'No data available'))
        .replace('{dailyBrief}', getVal('daily_brief', 'No data available'))
        .replace('{agenticActions}', getVal('agentic_police', 'No data available'));

    const genResult = await zia.generateContent({ prompt });
    const text = genResult?.text || genResult?.output || '';

    try {
        return JSON.parse(text);
    } catch {
        // ponytail: if Zia returns non-JSON, wrap it; production should retry with stricter prompt
        return {
            narrative: text.slice(0, 1000),
            confidence: 0.5,
            recommendations: [],
            similarCases: [],
            keyFindings: [],
        };
    }
}

app.post('/zia_brief', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const { caseId } = req.body || {};
        if (!caseId) return res.status(400).json({ error: 'caseId is required' });

        const cacheKey = `zia_brief:${caseId}`;
        const cached = await getCached(catalystApp, cacheKey);
        if (cached) return res.status(200).json(cached);

        const results = await Promise.all(
            AI_FUNCTIONS.map(fn => callFunction(catalystApp, fn, caseId))
        );

        const synthesisPromise = synthesizeWithZia(catalystApp, caseId, results);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('synthesis_timeout')), SYNTHESIS_TIMEOUT_MS)
        );

        let brief;
        try {
            const synthesized = await Promise.race([synthesisPromise, timeoutPromise]);
            brief = {
                caseId,
                ...synthesized,
                solvability: results.find(r => r.name === 'solvability_index')?.data || null,
                veracity: results.find(r => r.name === 'veracity_index')?.data || null,
                similarCases: synthesized.similarCases || [],
                entityLinks: results.find(r => r.name === 'network_analysis')?.data?.links || [],
                recommendations: synthesized.recommendations || [],
                confidence: synthesized.confidence || 0.5,
                provenance: buildProvenance(results),
            };
        } catch (timeoutErr) {
            brief = buildFallbackBrief(caseId, results);

            // async refresh — fire and forget
            synthesizeWithZia(catalystApp, caseId, results)
                .then(synthesized => {
                    const refreshed = {
                        caseId,
                        ...synthesized,
                        solvability: results.find(r => r.name === 'solvability_index')?.data || null,
                        veracity: results.find(r => r.name === 'veracity_index')?.data || null,
                        similarCases: synthesized.similarCases || [],
                        entityLinks: results.find(r => r.name === 'network_analysis')?.data?.links || [],
                        recommendations: synthesized.recommendations || [],
                        confidence: synthesized.confidence || 0.5,
                        provenance: buildProvenance(results),
                    };
                    precomputedBriefs.set(caseId, refreshed);
                    setCached(catalystApp, `zia_brief:${caseId}`, refreshed, 300);
                })
                .catch(() => {});
        }

        precomputedBriefs.set(caseId, brief);
        await setCached(catalystApp, cacheKey, brief, 300);
        res.status(200).json(brief);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ZIA brief generation failed', details: err.message });
    }
});

module.exports = app;
