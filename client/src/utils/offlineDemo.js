import offlineData from './offlineData'

function matchEndpoint(method, url) {
  const path = url.split('/server')[1]?.split('?')[0]
  if (!path) return null
  const key = `${method} /server${path}`
  return (
    offlineData[key] ??
    offlineData[`${method} /server${path.replace(/\/\d+(\/.*)?$/, '/142$1')}`] ??
    null
  )
}

export function getOfflineData(method, path) {
  const key = `${method.toUpperCase()} ${path}`
  const handler = offlineData[key]
  return typeof handler === 'function' ? handler() : handler
}

export function setupOfflineDemo() {
  window.__OFFLINE_MODE = true

  localStorage.setItem('token', 'mock-jwt-offline-demo-token')
  localStorage.setItem('user', JSON.stringify({
    name: 'Demo Officer',
    role: 'admin',
    area: 'command',
    rank: 'PI',
    kgid: 'KG-OFFLINE-DEMO',
    station: 'Brigade Road PS',
  }))

  const originalFetch = window.fetch
  window.fetch = async function (input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url || ''
    if (url.includes('/server/')) {
      await new Promise(r => setTimeout(r, 50 + Math.random() * 100))
      const method = (init.method || 'GET').toUpperCase()
      const handler = matchEndpoint(method, url)
      if (handler) {
        const body = init.body ? (() => { try { return JSON.parse(init.body) } catch { return {} } })() : {}
        const query = Object.fromEntries(new URL(url, window.location.origin).searchParams.entries())
        const params = { id: url.match(/\/(\d+)/)?.[1] || '142' }
        const data = typeof handler === 'function' ? handler({ body, query, params }) : handler
        return new Response(JSON.stringify(data), {
          status: data?.__status || 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
    return originalFetch.apply(this, arguments)
  }
}
