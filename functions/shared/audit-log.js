// ponytail: console stub, production uses append-only DB
function logAuditEvent({ timestamp, userId, action, target, details } = {}) {
    console.log(JSON.stringify({
        timestamp: timestamp || new Date().toISOString(),
        userId: userId || 'system',
        action: action || 'unknown',
        target: target || 'none',
        details: details || ''
    }));
}

module.exports = { logAuditEvent };
