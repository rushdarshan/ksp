const BASE_URL = import.meta.env.VITE_API_URL || '/server';

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
    const res = await fetch(target, { credentials: 'same-origin', ...options, headers });

    if (res && res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.hash = '/login';
        return null;
    }

    return res;
}

export default apiFetch;
