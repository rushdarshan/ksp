import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';

const ENTITY_COLORS = {
  person: '#60a5fa',
  phone: '#a78bfa',
  vehicle: '#f59e0b',
  location: '#4ade80',
};

const ENTITY_LABELS = {
  person: 'Person',
  phone: 'Phone',
  vehicle: 'Vehicle',
  location: 'Location',
};

// ponytail: hardcoded mock, swap for API when backend is ready
const MOCK_DATA = {
  nodes: [
    { id: 'p1', label: 'Ravi Kumar', type: 'person', firId: 'KSP-2026-0142', personId: 'ravi-kumar' },
    { id: 'ph1', label: '98450XXXXX', type: 'phone', firId: 'KSP-2026-0142' },
    { id: 'v1', label: 'KA-01-AB-1234', type: 'vehicle', firId: 'KSP-2026-0142' },
    { id: 'l1', label: 'SH-9 Junction', type: 'location', firId: 'KSP-2026-0142' },
    { id: 'p2', label: 'Arun Nair', type: 'person', firId: 'KSP-2026-0142', personId: 'arun-nair' },
    { id: 'p3', label: 'Lakshmi Devi', type: 'person', firId: 'KSP-2026-0142', personId: 'lakshmi-devi' },
  ],
  links: [
    { source: 'p1', target: 'ph1', label: 'owns', crossCase: false },
    { source: 'p1', target: 'v1', label: 'drives', crossCase: false },
    { source: 'p1', target: 'l1', label: 'present_at', crossCase: false },
    { source: 'p1', target: 'p2', label: 'co_accused', crossCase: false },
    { source: 'p2', target: 'ph1', label: 'contacts', crossCase: false },
    { source: 'p3', target: 'l1', label: 'victim_at', crossCase: false },
    { source: 'p1', target: 'p3', label: 'accused_of', crossCase: false },
    // cross-case example
    { source: 'p1', target: 'p-cross-1', label: 'linked_via_phone', crossCase: true, crossCaseId: 'KSP-2025-0098' },
  ],
  extraNodes: [
    { id: 'p-cross-1', label: 'Deepak S.', type: 'person', firId: 'KSP-2025-0098', personId: 'deepak-s' },
  ],
};

const NODE_R = { person: 10, phone: 7, vehicle: 7, location: 7 };

export default function EntityGraphPanel({ firId = 'KSP-2026-0142' }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const graphData = useMemo(() => ({
    nodes: [...MOCK_DATA.nodes, ...MOCK_DATA.extraNodes],
    links: MOCK_DATA.links,
  }), []);

  const onNodeClick = useCallback((node) => {
    if (node.type === 'person' && node.personId) {
      navigate(`/dashboard/person/${node.personId}`);
    } else {
      setSelected(prev => prev?.id === node.id ? null : node);
    }
  }, [navigate]);

  const onLinkClick = useCallback((link) => {
    if (link.crossCaseId) {
      navigate(`/dashboard/case/${link.crossCaseId}`);
    }
  }, [navigate]);

  return (
    <div className="panel" style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>
      <div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          {Object.entries(ENTITY_COLORS).map(([k, c]) => (
            <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              {ENTITY_LABELS[k]}
            </span>
          ))}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
            <span style={{ width: 16, height: 0, borderTop: '2px dashed #f87171' }} />
            Cross-case
          </span>
        </div>

        {/* Graph */}
        <div style={{ height: 480, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
          <ForceGraph2D
            graphData={graphData}
            nodeCanvasObject={(node, ctx) => {
              const r = NODE_R[node.type] || 6;
              const color = ENTITY_COLORS[node.type] || '#6b7280';
              const isSelected = selected?.id === node.id;
              ctx.beginPath();
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
              ctx.fillStyle = isSelected ? '#fff' : color;
              ctx.fill();
              ctx.strokeStyle = isSelected ? 'var(--accent)' : color;
              ctx.lineWidth = isSelected ? 2.5 : 1;
              ctx.stroke();
              ctx.fillStyle = '#fff';
              ctx.font = 'bold 9px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(node.label.length > 12 ? node.label.slice(0, 11) + '…' : node.label, node.x, node.y + r + 11);
            }}
            linkCanvasObject={(link, ctx) => {
              const sx = link.source.x, sy = link.source.y;
              const tx = link.target.x, ty = link.target.y;
              ctx.beginPath();
              ctx.setLineDash(link.crossCase ? [4, 3] : []);
              ctx.moveTo(sx, sy);
              ctx.lineTo(tx, ty);
              ctx.strokeStyle = link.crossCase ? '#f87171' : '#d2d2d7';
              ctx.lineWidth = link.crossCase ? 1.5 : 1;
              ctx.stroke();
              ctx.setLineDash([]);
              // edge label at midpoint
              const mx = (sx + tx) / 2, my = (sy + ty) / 2;
              ctx.fillStyle = 'var(--text-secondary)';
              ctx.font = '8px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(link.label, mx, my - 4);
            }}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={0.9}
            backgroundColor="var(--surface)"
            onNodeClick={onNodeClick}
            onLinkClick={onLinkClick}
            width={undefined}
            height={480}
          />
        </div>
      </div>

      {/* Detail sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'sticky', top: 16 }}>
        {selected ? (
          <div style={{ padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: ENTITY_COLORS[selected.type] }} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>{selected.label}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Type: {ENTITY_LABELS[selected.type]}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
              FIR: {selected.firId}
            </div>
            {selected.type === 'person' && (
              <button
                onClick={() => navigate(`/dashboard/person/${selected.personId}`)}
                style={{
                  marginTop: 8, width: '100%', padding: '6px 0', fontSize: 12, fontWeight: 600,
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                }}
              >View Full Profile →</button>
            )}
          </div>
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
            Click a node to see details
          </div>
        )}
      </div>
    </div>
  );
}
