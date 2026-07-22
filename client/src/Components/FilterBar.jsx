import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilter, FILTER_KEYS } from '../FilterContext';

const STATIONS = [
  'Brigade Road PS', 'Cubbon Park PS', 'Mysuru North PS', 'Mysuru South PS',
  'Hubli PS', 'Belgaum City PS', 'Mangaluru PS', 'Udupi PS',
  'Central Crime Branch', 'Shivamogga PS', 'Dharwad PS', 'Chitradurga PS',
];

const CRIME_TYPES = [
  'theft', 'burglary', 'assault', 'cyber_fraud', 'robbery',
  'vehicle_theft', 'homicide', 'kidnapping',
];

const FilterBar = () => {
  const { station, dateFrom, dateTo, crimeType, setFilter, clearFilters, activeFilters } = useFilter();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    for (const key of FILTER_KEYS) {
      const val = searchParams.get(key);
      if (val) setFilter(key, val);
    }
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const val = key === 'station' ? station : key === 'dateFrom' ? dateFrom : key === 'dateTo' ? dateTo : key === 'crimeType' ? crimeType : null;
      if (val) next.set(key, val);
    }
    setSearchParams(next, { replace: true });
  }, [station, dateFrom, dateTo, crimeType, setSearchParams]);

  return (
    <div style={styles.bar}>
      <select value={station || ''} onChange={e => setFilter('station', e.target.value)} style={styles.select}>
        <option value="">All stations</option>
        {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <input type="date" aria-label="Date from" value={dateFrom || ''} onChange={e => setFilter('dateFrom', e.target.value)} style={styles.date} />
      <input type="date" aria-label="Date to" value={dateTo || ''} onChange={e => setFilter('dateTo', e.target.value)} style={styles.date} />
      <select value={crimeType || ''} onChange={e => setFilter('crimeType', e.target.value)} style={styles.select}>
        <option value="">All crime types</option>
        {CRIME_TYPES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
      </select>
      {activeFilters.length > 0 && (
        <button onClick={clearFilters} style={styles.clear}>Clear</button>
      )}
    </div>
  );
};

const styles = {
  bar: {
    display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap',
    padding: '0.5rem 1rem', background: 'var(--card-bg, #fff)', borderBottom: '1px solid var(--border, #e2e8f0)',
    fontSize: '0.8rem',
  },
  select: {
    padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border, #d1d5db)',
    background: 'var(--input-bg, #fff)', fontSize: 'inherit', minWidth: '120px',
  },
  date: {
    padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border, #d1d5db)',
    background: 'var(--input-bg, #fff)', fontSize: 'inherit',
  },
  clear: {
    padding: '0.3rem 0.75rem', borderRadius: '4px', border: 'none',
    background: 'var(--accent, #dc2626)', color: '#fff', cursor: 'pointer', fontSize: 'inherit',
  },
};

export default FilterBar;
