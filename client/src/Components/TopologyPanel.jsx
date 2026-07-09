import React, { useState, useEffect, useRef, useCallback } from 'react';

const CRIME_COLORS = {
    theft: '#f59e0b', burglary: '#f97316', robbery: '#ef4444',
    assault: '#dc2626', murder: '#7f1d1d', sexual: '#be185d',
    fraud: '#d97706', cyber: '#7c3aed', drugs: '#059669',
    property: '#0891b2', extortion: '#e11d48', publicorder: '#6366f1'
};

const TopologyPanel = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const [error, setError] = useState('');
    const [months, setMonths] = useState([]);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(-1);
    const [vsBaseline, setVsBaseline] = useState(false);
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const baselineRef = useRef(null);

    useEffect(() => {
        fetch('/server/topology_navigator/topology')
            .then(res => res.json())
            .then(json => {
                setData(json);
                baselineRef.current = json;
                setLoading(false);
            })
            .catch(err => { setError(err.message); setLoading(false); });

        fetch('/server/topology_navigator/topology/months')
            .then(res => res.json())
            .then(json => setMonths(json.months || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (currentMonthIndex < 0 || !months[currentMonthIndex]) return;
        const month = months[currentMonthIndex];
        setLoading(true);
        fetch(`/server/topology_navigator/topology?month=${month}`)
            .then(res => res.json())
            .then(json => { setData(json); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, [currentMonthIndex]);

    useEffect(() => {
        if (!data || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { nodes, edges } = data;
        const W = canvas.width;
        const H = canvas.height;
        const cx = W / 2, cy = H / 2;
        const R = Math.min(W, H) * 0.3;

        const positions = {};
        nodes.forEach((n, i) => {
            const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
            positions[n.id] = { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
        });

        const vel = {};
        nodes.forEach(n => { vel[n.id] = { x: 0, y: 0 }; });

        const selectedEdges = selectedNode
            ? edges.filter(e => e.source === selectedNode || e.target === selectedNode)
            : [];

        let frame = 0;
        const render = () => {
            frame++;
            ctx.clearRect(0, 0, W, H);

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, W, H);

            edges.forEach(e => {
                const src = positions[e.source];
                const dst = positions[e.target];
                if (!src || !dst) return;

                const isHighlighted = selectedNode && (e.source === selectedNode || e.target === selectedNode);
                let edgeColor = '#334155';
                if (vsBaseline && baselineRef.current && !isHighlighted) {
                    const baselineEdge = baselineRef.current.edges.find(be => be.source === e.source && be.target === e.target);
                    if (baselineEdge && e.weight !== baselineEdge.weight) {
                        edgeColor = e.weight > baselineEdge.weight ? '#ef4444' : '#3b82f6';
                    }
                } else if (isHighlighted) {
                    edgeColor = '#60a5fa';
                }
                ctx.beginPath();
                ctx.moveTo(src.x, src.y);
                ctx.lineTo(dst.x, dst.y);
                ctx.strokeStyle = edgeColor;
                ctx.lineWidth = isHighlighted ? e.width * 1.5 + 1 : e.width * 0.8;
                ctx.globalAlpha = isHighlighted ? 0.9 : 0.25;
                ctx.stroke();
                ctx.globalAlpha = 1;

                if (isHighlighted) {
                    const mx = (src.x + dst.x) / 2, my = (src.y + dst.y) / 2;
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(e.label, mx, my - 4);
                }
            });

            nodes.forEach(n => {
                const pos = positions[n.id];
                const r = selectedNode === n.id || (selectedNode && selectedEdges.some(e => e.source === n.id || e.target === n.id))
                    ? n.size * 1.3 + 4 : n.size;
                const color = CRIME_COLORS[n.id] || '#6366f1';

                const pulse = Math.sin(frame * 0.05 + (n.id.charCodeAt(0) || 0) * 0.5) * 2 + 2;

                ctx.beginPath();
                ctx.arc(pos.x, pos.y, r + (selectedNode === n.id ? pulse : 0), 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.globalAlpha = selectedNode && selectedNode !== n.id && !selectedEdges.some(e => e.source === n.id || e.target === n.id)
                    ? 0.3 : 0.85;
                ctx.fill();
                ctx.globalAlpha = 1;

                ctx.strokeStyle = selectedNode === n.id ? '#fbbf24' : 'rgba(255,255,255,0.3)';
                ctx.lineWidth = selectedNode === n.id ? 3 : 1;
                ctx.stroke();

                ctx.fillStyle = '#f8fafc';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(n.label, pos.x, pos.y + r + 14);

                if (n.fsc !== undefined) {
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '9px sans-serif';
                    ctx.fillText(`FSC: ${n.fsc.toFixed(2)}`, pos.x, pos.y + r + 26);
                }
            });

            animRef.current = requestAnimationFrame(render);
        };
        render();

        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [data, selectedNode]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>⏳ Loading topology...</div>;
    if (error) return <div style={{ padding: '40px', color: '#dc2626' }}>Error: {error}</div>;
    if (!data) return null;

    return (
        <div className="panel" style={{ padding: '20px' }}>
            <h2>🔗 Crime Topology Navigator</h2>
            <p style={{ color: '#666', marginBottom: '16px' }}>
                Directed graph of crime-type transitions. Based on Markov chain analysis of offender career patterns (Heiler et al. 2023).
                Higher <strong>FSC</strong> (Forward Specialization Coefficient) = more specialized crime type.
            </p>

            {months.length > 0 && (
                <div style={{ marginBottom: '16px', padding: '12px', background: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>Temporal Mode</span>
                        <span style={{ fontSize: '13px', color: '#60a5fa' }}>
                            {currentMonthIndex >= 0 ? months[currentMonthIndex] : 'Baseline (full year)'}
                        </span>
                    </div>
                    <input
                        type="range" min="-1" max={months.length - 1} step="1"
                        value={currentMonthIndex}
                        onChange={e => setCurrentMonthIndex(parseInt(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        <span>Baseline</span>
                        <span>{months[0] || ''}</span>
                        <span>{months[months.length - 1] || ''}</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={vsBaseline} onChange={e => setVsBaseline(e.target.checked)} />
                        Show color diff vs baseline (red = increase, blue = decrease)
                    </label>
                </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Total crimes: <strong>{data.metadata?.totalCrimes || 'N/A'}</strong>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                    Crime types: <strong>{data.metadata?.crimeTypeCount || 0}</strong>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                    District: <strong>{data.metadata?.districtId || 1}</strong>
                </div>
                {data.metadata?.temporalMode && (
                    <div style={{ fontSize: '13px', color: '#60a5fa', fontWeight: 500 }}>
                        Month: <strong>{data.metadata?.month || 'N/A'}</strong>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <canvas ref={canvasRef} width={700} height={500} style={{ borderRadius: '12px', width: '100%', height: '500px' }}
                        onClick={(e) => {
                            const rect = canvasRef.current.getBoundingClientRect();
                            const x = (e.clientX - rect.left) * (700 / rect.width);
                            const y = (e.clientY - rect.top) * (500 / rect.height);
                            const cx2 = 350, cy2 = 250, R2 = 210;
                            const nodes = data.nodes;
                            let found = null;
                            nodes.forEach((n, i) => {
                                const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
                                const nx = cx2 + R2 * Math.cos(angle);
                                const ny = cy2 + R2 * Math.sin(angle);
                                const dist = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
                                if (dist < n.size + 8) found = n.id;
                            });
                            setSelectedNode(found === selectedNode ? null : found);
                        }}
                    />
                </div>

                {selectedNode && (() => {
                    const node = data.nodes.find(n => n.id === selectedNode);
                    const edges = data.edges.filter(e => e.source === selectedNode || e.target === selectedNode);
                    return (
                        <div style={{ width: '280px', background: '#1e293b', borderRadius: '12px', padding: '16px', color: '#f8fafc', fontSize: '13px', height: 'fit-content' }}>
                            <h3 style={{ margin: '0 0 8px', color: CRIME_COLORS[selectedNode] || '#6366f1' }}>
                                {node?.label || selectedNode}
                            </h3>
                            {node && (
                                <>
                                    <div style={{ marginBottom: '8px' }}>FSC: <strong>{(node.fsc || 0).toFixed(3)}</strong></div>
                                    <div style={{ marginBottom: '12px' }}>FIRs: <strong>{node.crimeCount || 0}</strong></div>
                                </>
                            )}
                            <div style={{ fontWeight: 600, marginBottom: '6px', color: '#94a3b8' }}>Transitions</div>
                            {edges.sort((a, b) => b.weight - a.weight).map((e, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #334155' }}>
                                    <span>{e.source === selectedNode ? '→ ' : '← '}{e.source === selectedNode ? e.target : e.source}</span>
                                    <span>{e.label}</span>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default TopologyPanel;
