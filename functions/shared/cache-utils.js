const DEFAULT_TTL = 900;

async function getCached(catalystApp, key) {
    try {
        const cache = catalystApp.cache().segment({ id: 'ksp-panel-cache' });
        const val = await cache.get(key);
        return val ? JSON.parse(val) : null;
    } catch (err) {
        console.warn('Cache read failed:', err.message);
        return null;
    }
}

async function setCached(catalystApp, key, value, ttl = DEFAULT_TTL) {
    try {
        const cache = catalystApp.cache().segment({ id: 'ksp-panel-cache' });
        await cache.put(key, JSON.stringify(value), ttl);
    } catch (err) {
        console.warn('Cache write failed:', err.message);
    }
}

module.exports = { getCached, setCached, DEFAULT_TTL };
