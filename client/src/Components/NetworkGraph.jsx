import React, { useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { PanelCard } from './panels';

const COMMUNITY_COLORS = ['var(--accent)', '#b8860b', '#6b6b6b', '#d1cec9', '#1a2a3f', '#8a6a1a'];

const NetworkGraph = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    fetch('/server/co_accused_network/graph')
      .then(res => res.json())
      .then(data => setGraphData(data))
      .catch(err => console.error("Error fetching graph data:", err));
  }, []);

  return (
    <PanelCard title="Criminal Network" badge="GRAPH">
      <div style={{ width: '100%', height: '550px', overflow: 'hidden' }}>
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="id"
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          nodeCanvasObject={(node, ctx) => {
            const size = 4;
            const color = node.community != null
              ? COMMUNITY_COLORS[node.community % COMMUNITY_COLORS.length]
              : 'var(--accent)';
            ctx.fillStyle = color;
            ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size);
          }}
          linkColor={() => '#d2d2d7'}
          linkWidth={0.5}
          backgroundColor="#ffffff"
        />
      </div>
    </PanelCard>
  );
};

export default NetworkGraph;
