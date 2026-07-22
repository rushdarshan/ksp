async function logAuditEvent(catalystApp, event) {
    if (!event) {
        event = catalystApp || {};
        catalystApp = null;
    }

    const record = {
        Timestamp: event.timestamp || new Date().toISOString(),
        UserID: String(event.userId || 'system'),
        Action: event.action || 'unknown',
        Target: event.target || 'none',
        Details: typeof event.details === 'string' ? event.details : JSON.stringify(event.details || {}),
    };

    if (catalystApp) {
        try {
            await catalystApp.datastore().table('AuditLog').insertRow(record);
            return { persisted: true, record };
        } catch (error) {
            console.warn('AuditLog Data Store write failed:', error.message);
        }
    }

    console.log(JSON.stringify({ type: 'audit', ...record }));
    return { persisted: false, record };
}

module.exports = { logAuditEvent };
