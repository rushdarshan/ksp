const catalyst = require('zcatalyst-sdk-node');

const ENDPOINTS = [
    { path: '/server/fir_api/alerts', headers: {} },
    { path: '/server/fir_api/firs', headers: { 'x-unit-id': '1' } },
    { path: '/server/topology_navigator/topology?districtId=1', headers: {} },
    { path: '/server/quickml_predict/predict?districtId=1', headers: {} },
    { path: '/server/dark_figure/dark-figure', headers: {} },
    { path: '/server/victim_risk_shield/high-risk', headers: {} },
];

module.exports = async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const baseUrl = process.env.APP_URL || `https://${req.headers?.host || ''}`;

        if (!baseUrl || baseUrl === 'https://') {
            return res.status(200).json({
                status: 'skipped',
                reason: 'APP_URL env var not set — set it to your Catalyst app URL',
                generatedAt: new Date().toISOString()
            });
        }

        const results = await Promise.allSettled(
            ENDPOINTS.map(async ({ path, headers }) => {
                const response = await fetch(baseUrl + path, { headers });
                return { path, ok: response.ok, status: response.status };
            })
        );

        const summary = results.map((r, i) => ({
            endpoint: ENDPOINTS[i].path,
            status: r.status === 'fulfilled' && r.value?.ok ? 'ok' : 'failed',
            detail: r.status === 'fulfilled' ? r.value : r.reason?.message
        }));

        res.status(200).json({
            status: 'complete',
            precomputed: summary.filter(s => s.status === 'ok').length,
            failed: summary.filter(s => s.status === 'failed').length,
            details: summary,
            generatedAt: new Date().toISOString()
        });
    } catch (err) {
        console.error('Precompute job error:', err);
        res.status(500).json({ error: err.message });
    }
};
