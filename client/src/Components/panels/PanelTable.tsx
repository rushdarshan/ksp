import React from 'react';

interface PanelTableProps {
  headers: string[];
  children: React.ReactNode;
}

const PanelTable: React.FC<PanelTableProps> = ({ headers, children }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 14 }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                borderBottom: '1px solid #eaeaea',
                fontWeight: 600,
                fontSize: 12,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  );
};

export default PanelTable;
