import { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { PanelCard } from './panels';

const COMMUNITY_COLORS = ['#1b2c47', '#b8860b', '#6b6b6b', '#a33d32', '#4b79a8', '#7a8f63'];

const NetworkGraph = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [width, setWidth] = useState(760);
  const containerRef = useRef(null);
  const graphRef = useRef(null);

  useEffect(() => {
    fetch('/server/co_accused_network/graph')
      .then(res => res.json())
      .then(data => setGraphData(data))
      .catch(err => console.error("Error fetching graph data:", err));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(300, Math.floor(entry.contentRect.width))));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <PanelCard title="Criminal Network" badge="GRAPH">
      <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: 'var(--size-sub)' }}>
        Synthetic co-accused links from shared FIR records. Select a node to inspect it; links indicate association, not culpability.
      </p>
      <div ref={containerRef} style={{ width: '100%', height: '550px', overflow: 'hidden', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          width={width}
          height={550}
          nodeLabel="id"
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          nodeCanvasObject={(node, ctx) => {
            const size = node.group === 1 ? 8 : 6;
            const color = node.community != null
              ? COMMUNITY_COLORS[node.community % COMMUNITY_COLORS.length]
              : 'var(--accent)';
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#171717';
            ctx.font = '500 4px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(node.label || node.id, node.x, node.y + size + 7);
          }}
          linkColor={() => '#d2d2d7'}
          linkWidth={0.5}
          backgroundColor="#ffffff"
          onEngineStop={() => graphRef.current?.zoomToFit(300, 56)}
        />
      </div>
    </PanelCard>
  );
};

export default NetworkGraph;
