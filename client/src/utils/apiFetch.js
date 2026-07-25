import { defineMockApi } from '../../mock-api-data.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/server';
const mockApi = defineMockApi();

// Precompile routes for key matching exactly like mock-server-plugin.js
const compiledRoutes = Object.keys(mockApi).map(routeKey => {
  const spaceIdx = routeKey.indexOf(' ');
  if (spaceIdx === -1) return null;
  const method = routeKey.slice(0, spaceIdx);
  const pathPattern = routeKey.slice(spaceIdx + 1);
  
  const regexStr = '^' + pathPattern
    .replace(/\/:[a-zA-Z0-9_]+/g, '/([^/]+)')
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

function getMockResponse(path, options = {}) {
  const method = options.method || 'GET';
  // Clean path to extract pathname and query
  const queryStr = path.includes('?') ? path.slice(path.indexOf('?')) : '';
  const cleanPath = path.includes('?') ? path.slice(0, path.indexOf('?')) : path;
  
  const url = new URL(cleanPath, 'http://localhost');
  const pathname = url.pathname.startsWith('/server') ? url.pathname : `/server${url.pathname}`;
  
  const searchParams = new URLSearchParams(queryStr);
  const query = Object.fromEntries(searchParams.entries());
  const key = `${method} ${pathname}`;
  
  let body = {};
  if (options.body) {
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    } catch (e) {
      body = {};
    }
  }
  
  let result = null;
  let found = false;
  
  // 1. Exact match
  if (mockApi[key]) {
    result = mockApi[key]({ query, body, params: {}, headers: options.headers || {} });
    found = true;
  }
  
  // 2. Pattern match
  if (!found) {
    for (const route of compiledRoutes) {
      if (route.method === method) {
        const match = pathname.match(route.regex);
        if (match) {
          const params = {};
          route.paramNames.forEach((name, idx) => {
            params[name] = match[idx + 1];
          });
          result = route.handler({ query, body, params, headers: options.headers || {} });
          found = true;
          break;
        }
      }
    }
  }
  
  // 3. Fallback default
  if (!found) {
    result = { data: [], message: `Mock fallback for ${key}` };
  }
  
  const hasStatus = result && !Array.isArray(result) && typeof result === 'object' && '__status' in result;
  const status = hasStatus ? result.__status : 200;
  const payload = hasStatus ? Object.fromEntries(Object.entries(result).filter(([k]) => k !== '__status')) : result;
  
  return new Response(JSON.stringify(payload), {
    status: status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['jwt_token'] = token;
  }

  const target = String(path || '').startsWith(BASE_URL) ? path : `${BASE_URL}${path}`;
  
  try {
    const res = await fetch(target, { credentials: 'same-origin', ...options, headers });
    const contentType = res.headers.get('content-type') || '';
    
    // If the API call succeeded and returned valid JSON, return it directly
    if (res.ok && contentType.includes('application/json')) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.hash = '/login';
        return null;
      }
      return res;
    }
    
    // Fall back to client-side mock if we get HTML (routing redirect) or standard errors
    if (contentType.includes('text/html') || res.status === 404 || res.status === 502 || res.status === 504) {
      console.warn(`[apiFetch] API returned HTML/error for ${path}. Falling back to mock data.`);
      return getMockResponse(path, options);
    }
    
    return res;
  } catch (err) {
    console.warn(`[apiFetch] Network failure for ${path}. Falling back to mock data.`);
    return getMockResponse(path, options);
  }
}

export default apiFetch;
