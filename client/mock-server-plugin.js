import { defineMockApi } from './mock-api-data.js';

export default function mockServerPlugin() {
  const mockApi = defineMockApi();

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

        const handler = mockApi[key];

        // Try exact match first
        if (handler) {
          try {
            const result = handler({ query, body, params: {} });
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // Try pattern match (replace last segment with :id)
        const parts = path.split('/');
        const lastSeg = parts.pop();
        const patternKey = `${method} ${parts.join('/')}/:id`;
        const patternHandler = mockApi[patternKey];
        if (patternHandler) {
          try {
            const result = patternHandler({ query, body, params: { id: lastSeg } });
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        // Fallback: return empty but valid JSON
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ data: [], message: `Mock fallback for ${key}` }));
      });
    }
  };
}
