import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ForceGraph2D from 'react-force-graph-2d'

const PERSON_COLORS = { A1: 'var(--color-red)', A2: '#d97706', A3: '#6b7280' }
const LINK_COLORS = { 'A1-A1': 'var(--color-red)', 'A1-A2': '#d97706', 'A1-A3': '#9ca3af' }
const PERSON_LABELS = { A1: 'Primary Accused', A2: 'Co-Accused', A3: 'Mentioned' }

export default function CoAccusedNetworkPanel({ focusPersonName = null, limitToFirNo = null, hideHeader = false }) {
  const [data, setData] = useState(null)
  const [selected, setSelected] = useState(null)
  const [gangFilter, setGangFilter] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = e => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    fetch('/server/co_accused_network/graph')
      .then(r => r.json())
      .then(d => {
        setData(d)
        const person = focusPersonName || searchParams.get('person')
        if (person) {
          const match = d.nodes.find(n => n.id.toLowerCase() === person.toLowerCase())
          if (match) setSelected(match)
        }
      })
      .catch(() => {})
  }, [searchParams, focusPersonName])

  const filtered = useMemo(() => {
    if (!data) return null;
    let n = data.nodes;
    let l = data.links;

    if (gangFilter !== 0) {
      n = n.filter(node => node.community === gangFilter);
      l = l.filter(link => {
        const s = data.nodes.find(node => node.id === link.source)
        const t = data.nodes.find(node => node.id === link.target)
        return s?.community === gangFilter && t?.community === gangFilter
      });
    }

    if (limitToFirNo) {
      // Normalize FIR Numbers, e.g. "KSP-2026-0142" vs "142/2026"
      const cleanFir = limitToFirNo.replace('KSP-', '').replace('/', '-'); // e.g. "142-2026" or "2026-142"
      const matchKey = cleanFir.split('-')[0]; // e.g. "142" or "2026"
      const isMatch = (firList) => {
        if (!firList) return false;
        return firList.some(f => {
          const cleanF = f.replace('KSP-', '').replace('/', '-');
          return cleanF.includes(matchKey) || limitToFirNo.includes(cleanF) || cleanF.includes(limitToFirNo);
        });
      };
      
      n = n.filter(node => isMatch(node.firNos));
      l = l.filter(link => isMatch(link.firNos));
    }

    return { ...data, nodes: n, links: l };
  }, [data, gangFilter, limitToFirNo]);

  if (!data) return <div className="panel"><div className="panel-box"><p style={{ color: 'var(--text-secondary)' }}>Loading...</p></div></div>

  return (
    <div className="panel" style={hideHeader ? { border: 'none', background: 'transparent', padding: 0 } : {}}>
      <div className="panel-box" style={hideHeader ? { border: 'none', background: 'transparent', padding: 0 } : {}}>
        {!hideHeader && (
          <>
            <h2 style={{ marginBottom: 4 }}>Co-Accused Network</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--size-sub)', marginBottom: 20, maxWidth: 600 }}>
              Force-directed graph of accused linked by shared FIRs. A1 nodes (red) = primary accused.
              Red edges = A1-A1 links — the strongest gang signal.
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', minWidth: 100 }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>ACCUSED</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{data.summary.totalAccused}</div>
              </div>
              <div style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid #dc262640', background: 'var(--color-red)08', minWidth: 100 }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>A1 (PRIMARY)</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-red)', fontFamily: 'var(--font-mono)' }}>{data.summary.A1Count}</div>
              </div>
              <div style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', minWidth: 100 }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>GANGS</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{data.summary.gangs}</div>
              </div>
              <div style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', minWidth: 100 }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>LINKS</div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{data.links.length}</div>
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[{ k: 0, l: 'All Networks' }, { k: 1, l: 'Gang 1' }, { k: 2, l: 'Gang 2' }].map(({ k, l }) => (
            <button key={k} onClick={() => setGangFilter(k)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)', border: `1px solid ${gangFilter === k ? 'var(--accent)' : 'var(--border)'}`,
                background: gangFilter === k ? 'var(--accent)' : 'transparent',
                color: gangFilter === k ? '#fff' : 'var(--text-secondary)',
                fontSize: 'var(--size-caption)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >{l}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 16 }}>
          <div style={{ height: isMobile ? 250 : 500, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
            <ForceGraph2D
              graphData={filtered}
              nodeCanvasObject={(node, ctx) => {
                const r = node.personId === 'A1' ? 8 : node.personId === 'A2' ? 5 : 3
                const color = PERSON_COLORS[node.personId] || 'var(--color-gray-500)'
                ctx.beginPath()
                ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
                ctx.fillStyle = selected?.id === node.id ? '#fff' : color
                ctx.fill()
                ctx.strokeStyle = selected?.id === node.id ? 'var(--accent)' : color
                ctx.lineWidth = selected?.id === node.id ? 3 : 1
                ctx.stroke()
                if (node.personId === 'A1') {
                  ctx.fillStyle = '#000'
                  ctx.font = '6px sans-serif'
                  ctx.textAlign = 'center'
                  ctx.fillText(node.id[0], node.x, node.y + 2)
                }
              }}
              linkColor={l => LINK_COLORS[l.role] || '#d2d2d7'}
              linkWidth={l => Math.min(l.cases, 3)}
              linkDirectionalArrowLength={3}
              linkDirectionalArrowRelPos={1}
              backgroundColor="var(--surface)"
              onNodeClick={setSelected}
              width={undefined}
              height={isMobile ? 250 : 500}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              {Object.entries(PERSON_COLORS).map(([k, c]) => (
                <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
                  {PERSON_LABELS[k]}
                </span>
              ))}
            </div>
            {selected ? (
              <div style={{ padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', background: 'var(--surface)' }}>
                <div style={{ fontSize: 'var(--size-sub)', fontWeight: 600, marginBottom: 8 }}>{selected.id}</div>
                <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Role: {PERSON_LABELS[selected.personId]}
                </div>
                <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Cases: {selected.cases}
                </div>
                <div style={{ fontSize: 'var(--size-caption)', color: 'var(--text-secondary)' }}>
                  FIRs: {selected.firNos?.join(', ')}
                </div>
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--size-caption)' }}>
                Click a node to see details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
