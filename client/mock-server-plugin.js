import { defineMockApi } from './mock-api-data.js';

export default function mockServerPlugin() {
  const mockApi = defineMockApi();

  // Precompile route patterns for key matching
  const compiledRoutes = Object.keys(mockApi).map(routeKey => {
    const spaceIdx = routeKey.indexOf(' ');
    if (spaceIdx === -1) return null;
    const method = routeKey.slice(0, spaceIdx);
    const pathPattern = routeKey.slice(spaceIdx + 1);
    
    // Convert e.g., /server/cases/:id/stage to regex
    const regexStr = '^' + pathPattern
      .replace(/\/:[a-zA-Z0-9_]+/g, '/([^/]+)') // match parameters
      .replace(/\*/g, '.*') + '$';
    
    const paramNames = (pathPattern.match(/:[a-zA-Z0-9_]+/g) || []).map(p => p.slice(1));
    
    return {
      routeKey,
      method,
      regex: new RegExp(regexStr),
      paramNames,
      handler: mockApi[routeKey]
    };
  }).filter(Boolean);

  return {
    name: 'mock-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/server/')) return next();

        const url = new URL(req.url, 'http://localhost');
        const path = url.pathname;
        const method = req.method;
        const query = Object.fromEntries(url.searchParams);
        const key = `${method} ${path}`;

        let body = {};
        if (method === 'POST' || method === 'PUT') {
          await new Promise(resolve => {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => {
              try { body = JSON.parse(data); } catch { body = {}; }
              resolve();
            });
          });
        }

        // Try exact match first
        const exactHandler = mockApi[key];
        if (exactHandler) {
          try {
            const result = exactHandler({ query, body, params: {} });
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // Try precompiled route pattern matching
        for (const route of compiledRoutes) {
          if (route.method === method) {
            const match = path.match(route.regex);
            if (match) {
              const params = {};
              route.paramNames.forEach((name, idx) => {
                params[name] = match[idx + 1];
              });
              
              try {
                const result = route.handler({ query, body, params });
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify(result));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
              return;
            }
          }
        }

        // Fallback: return empty but valid JSON
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ data: [], message: `Mock fallback for ${key}` }));
      });
    }
  };
}
