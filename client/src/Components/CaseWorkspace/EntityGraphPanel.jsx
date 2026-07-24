import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { PiArrowSquareOut, PiCursorClick } from 'react-icons/pi';
import { ACTIVE_CASE_FACTS } from './caseFacts';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

const ENTITY_COLORS = {
  case: '#26231f',
  person: '#315f91',
  evidence: '#8a5d13',
  location: '#397159',
  phone: '#7a4b8c',
  vehicle: '#b86b3a',
  status: '#a34545',
};

const ENTITY_LABELS = {
  case: 'Case',
  person: 'Person',
  evidence: 'Evidence source',
  location: 'Location',
  phone: 'Phone',
  vehicle: 'Vehicle',
  status: 'Operational status',
};

const FALLBACK_GRAPH = {
  nodes: [
    { id: 'fir', label: ACTIVE_CASE_FACTS.firId, type: 'case', firId: ACTIVE_CASE_FACTS.firId, fx: 0, fy: 0 },
    { id: 'mohan', label: 'Mohan Kumar', type: 'person', firId: ACTIVE_CASE_FACTS.firId, personId: 'mohan-kumar', fx: -145, fy: -105 },
    { id: 'kiran', label: 'Kiran Joseph', type: 'person', firId: ACTIVE_CASE_FACTS.firId, personId: 'kiran-joseph', fx: 135, fy: -105 },
    { id: 'location', label: 'Brigade Road / SH-9', type: 'location', firId: ACTIVE_CASE_FACTS.firId, fx: 0, fy: 135 },
    { id: 'cctv', label: 'SH-9 CCTV source', type: 'evidence', firId: ACTIVE_CASE_FACTS.firId, fx: -165, fy: 220 },
    { id: 'at-large', label: 'At large', type: 'status', firId: ACTIVE_CASE_FACTS.firId, fx: 250, fy: -105 },
  ],
  links: [
    { source: 'fir', target: 'mohan', label: 'lists accused' },
    { source: 'fir', target: 'kiran', label: 'lists accused' },
    { source: 'fir', target: 'location', label: 'occurred at' },
    { source: 'cctv', target: 'location', label: 'source identified at' },
    { source: 'kiran', target: 'at-large', label: 'current status' },
    { source: 'mohan', target: 'kiran', label: 'co-accused' },
  ],
};

const NODE_RADIUS = { case: 13, person: 11, evidence: 9, location: 9, status: 8 };

function drawNode(node, ctx, selected, globalScale) {
  const radius = NODE_RADIUS[node.type] || 8;
  const color = ENTITY_COLORS[node.type] || '#6f6b63';
  const isSelected = selected?.id === node.id;
  const unit = 1 / globalScale;

  if (isSelected) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + (5 * unit), 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(190, 135, 38, 0.18)';
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fffdf8';
  ctx.lineWidth = 2 * unit;
  ctx.stroke();

  const fontSize = 11 * unit;
  ctx.font = `${isSelected ? 700 : 600} ${fontSize}px Inter, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textWidth = ctx.measureText(node.label).width;
  const labelY = node.y + radius + (14 * unit);
  ctx.fillStyle = 'rgba(255, 253, 248, 0.94)';
  ctx.fillRect(node.x - textWidth / 2 - (5 * unit), labelY - (8 * unit), textWidth + (10 * unit), 16 * unit);
  ctx.fillStyle = '#26231f';
  ctx.fillText(node.label, node.x, labelY);
}

export default function EntityGraphPanel({ firId = ACTIVE_CASE_FACTS.firId }) {
  const navigate = useNavigate();
  const graphRef = useRef(null);
  const viewportRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [graphSize, setGraphSize] = useState({ width: 640, height: 500 });
  const [apiNodes, setApiNodes] = useState(null);
  const [apiLinks, setApiLinks] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiUrl}/entity_graph/cross-ref`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId: firId }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (!cancelled && data?.nodes) {
          setApiNodes(data.nodes);
          setApiLinks(data.links);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApiNodes(null);
          setApiLinks(null);
        }
      });
    return () => { cancelled = true; };
  }, [firId]);

  const graphData = useMemo(() => {
    if (apiNodes) {
      return {
        nodes: apiNodes.map(n => ({ ...n, firId })),
        links: apiLinks.map(l => ({ ...l })),
      };
    }
    return {
      nodes: FALLBACK_GRAPH.nodes.map(node => ({ ...node, firId })),
      links: FALLBACK_GRAPH.links.map(link => ({ ...link })),
    };
  }, [firId, apiNodes, apiLinks]);

  const fitGraph = useCallback(() => {
    graphRef.current?.zoomToFit(260, 64);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const measure = () => {
      const width = Math.max(300, Math.floor(viewport.getBoundingClientRect().width));
      const height = Math.max(420, Math.min(540, Math.floor(window.innerHeight * 0.58)));
      setGraphSize(current => current.width === width && current.height === height ? current : { width, height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(fitGraph, 80);
    return () => window.clearTimeout(timer);
  }, [fitGraph, graphSize]);

  const openProfile = () => {
    if (selected?.type === 'person' && selected.personId) {
      navigate(`/dashboard/person/${selected.personId}`);
    }
  };

  return (
    <section className="entity-graph" aria-labelledby="entity-graph-title">
      <div className="entity-graph__main">
        <div className="entity-graph__toolbar">
          <div>
            <h3 id="entity-graph-title">Case entity graph</h3>
            <p>Verified record links and operational status for {firId}</p>
          </div>
          <div className="entity-graph__legend" aria-label="Entity types">
            {Object.entries(ENTITY_COLORS).map(([type, color]) => (
              <span key={type}><i style={{ background: color }} />{ENTITY_LABELS[type]}</span>
            ))}
          </div>
        </div>

        <div className="entity-graph__viewport" ref={viewportRef}>
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={graphSize.width}
            height={graphSize.height}
            backgroundColor="#fffdf8"
            nodeCanvasObject={(node, ctx, globalScale) => drawNode(node, ctx, selected, globalScale)}
            nodePointerAreaPaint={(node, color, ctx) => {
              const radius = (NODE_RADIUS[node.type] || 8) + 8;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
              ctx.fill();
            }}
            linkColor={() => '#b9b4aa'}
            linkWidth={1.3}
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={0.92}
            linkCanvasObjectMode={() => 'after'}
            linkCanvasObject={(link, ctx, globalScale) => {
              if (![link.source?.x, link.source?.y, link.target?.x, link.target?.y].every(Number.isFinite)) return;
              const x = (link.source.x + link.target.x) / 2;
              const y = (link.source.y + link.target.y) / 2;
              const unit = 1 / globalScale;
              ctx.font = `500 ${9 * unit}px Inter, Arial, sans-serif`;
              ctx.textAlign = 'center';
              const labelWidth = ctx.measureText(link.label).width;
              ctx.fillStyle = 'rgba(255, 253, 248, 0.92)';
              ctx.fillRect(x - labelWidth / 2 - (3 * unit), y - (12 * unit), labelWidth + (6 * unit), 13 * unit);
              ctx.fillStyle = '#6f6b63';
              ctx.fillText(link.label, x, y - (5 * unit));
            }}
            onNodeClick={setSelected}
            onEngineStop={fitGraph}
            cooldownTicks={1}
            d3VelocityDecay={0.28}
            minZoom={0.6}
            maxZoom={4}
          />
        </div>
      </div>

      <aside className="entity-graph__details" aria-live="polite">
        {selected ? (
          <>
            <span className="entity-graph__type"><i style={{ background: ENTITY_COLORS[selected.type] }} />{ENTITY_LABELS[selected.type]}</span>
            <h4>{selected.label}</h4>
            <dl>
              <div><dt>FIR</dt><dd>{selected.firId}</dd></div>
              {selected.type === 'status' && <div><dt>Status</dt><dd>{selected.label}</dd></div>}
              {selected.type === 'evidence' && <div><dt>Status</dt><dd>Acquisition pending</dd></div>}
              {selected.type === 'phone' && <div><dt>Type</dt><dd>Phone number</dd></div>}
              {selected.type === 'vehicle' && <div><dt>Type</dt><dd>Vehicle</dd></div>}
            </dl>
            {selected.type === 'person' && (
              <button type="button" onClick={openProfile}>
                Open person record <PiArrowSquareOut aria-hidden="true" />
              </button>
            )}
          </>
        ) : (
          <div className="entity-graph__empty">
            <PiCursorClick aria-hidden="true" />
            <strong>Select an entity</strong>
            <span>Inspect a node without leaving the case workspace.</span>
          </div>
        )}
      </aside>
    </section>
  );
}

EntityGraphPanel.propTypes = {
  firId: PropTypes.string,
};
