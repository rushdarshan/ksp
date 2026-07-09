import { useState, useEffect } from "react";
import { formatString } from "../../utils/utility";
import { useFetchData } from "./Firdetails";
import styles from "./firdetails.module.css";
import { useParams } from "react-router-dom";
import Loader from "../../ui/Dropdown/Loader";
import SolvabilityBadge from '../SolvabilityBadge';
const apiUrl = import.meta.env.VITE_API_URL;

function QualityBadge({ firData }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchScore = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(apiUrl ? `${apiUrl}/fir_quality/fir-quality` : `/server/fir_quality/fir-quality`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firNo: firData?.FIRNo || '',
                    narrative: firData?.Narrative || firData?.narrative || '',
                    evidenceTypes: [],
                    witnessCount: 0,
                    propertyValue: 0,
                    delayReason: '',
                    accusedCount: 0,
                    accusedDescription: '',
                    crimeType: ''
                })
            });
            if (!res.ok) throw new Error('Quality analysis unavailable');
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { if (firData) fetchScore(); }, [firData]);
    if (loading) return <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
        <div style={{ height: '16px', width: '200px', background: '#e5e7eb', borderRadius: '8px', marginBottom: '8px' }} />
    </div>;
    if (error) return <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2' }}>
        <p style={{ color: '#dc2626', margin: '0 0 8px 0', fontSize: '14px' }}>Quality analysis unavailable</p>
        <button onClick={fetchScore} style={{ padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Retry</button>
    </div>;
    if (!result) return null;
    const { qualityScore, uncertaintyBand, dimensions, flags } = result;
    const color = qualityScore >= 70 ? '#16a34a' : qualityScore >= 40 ? '#ca8a04' : '#dc2626';
    return <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>FIR Quality Score</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '160px', height: '20px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${qualityScore}%`, height: '100%', background: color, borderRadius: '10px' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '18px', color }}>{qualityScore} ± {uncertaintyBand}</span>
            <span style={{ fontSize: '13px', color, fontWeight: 500 }}>{qualityScore >= 70 ? 'Complete' : qualityScore >= 40 ? 'Needs review' : 'Incomplete'}</span>
        </div>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>10-dimension heuristic quality score</p>
        <details>
            <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#374151' }}>Dimension breakdown</summary>
            <ul style={{ margin: '8px 0 0 0', padding: '0 0 0 16px', fontSize: '13px', color: '#4b5563' }}>
                {dimensions.map((d, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{d.name}: {d.score}/{d.max}</li>
                ))}
            </ul>
            {flags.length > 0 && <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626' }}>Flags: {flags.join('; ')}</div>}
        </details>
    </div>;
}

export default function DetailedFir() {
  const { FirNo ,FirYear} = useParams();
  const [editingId, setEditingId] = useState(null);
  const [editingDescription, setEditingDescription] = useState('');
  const { data, isLoading, error } = useFetchData(
    `${apiUrl}/getfirdetails_withid`,
    {
      FirNo: `${FirNo}/${FirYear}`,
    },
    {
      headers: {
        jwt_token: localStorage.getItem("token"),
      },
    }
  );
    // const startEditing = (id, description) => {
    //   setEditingId(id);
    //   setEditingDescription(description);
    // };

    // const cancelEditing = () => {
    //   setEditingId(null);
    //   setEditingDescription('');
    // };

    // const saveEditing = async () => {
    //   if(!editingDescription){
    //     cancelEditing();
    //     return;
    //   }
    //   const res = await axios.put(`http://localhost:5000/api/todos/${editingId}`, { description: editingDescription });
    //   setTodos(todos.map(todo => (todo.id === editingId ? res.data : todo)));
    //   setEditingId(null);
    //   setEditingDescription('');
    // };
  if (isLoading) {
    return <Loader/>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }
  if (!data) {
    return <p>No data available.</p>;
  }
  return (
    <div className={styles.detailed_fir_bg_wrapper}>
      <div className={styles.detailed_fir_container}>
        {Object.entries(data[0]).map(([key, value]) => (
          <div className={styles.detailed_fir_cont}>
            <div className={styles.fir_col_heading}>{formatString( key) }</div>
            <div className={styles.fir_col_content}>{value}</div>
          </div>
        ))}
      </div>
      <SolvabilityBadge firData={data[0]} />
      <QualityBadge firData={data[0]} />
    </div>
  );
}
