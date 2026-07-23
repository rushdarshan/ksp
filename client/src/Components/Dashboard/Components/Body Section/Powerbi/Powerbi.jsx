import { useEffect, useRef } from "react";
import './Powerbi.scss'

const Powerbi = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const resizeIframe = () => {
      const iframe = iframeRef.current;
      const container = iframe?.parentElement;
      if (iframe && container) {
        iframe.width = container.clientWidth;
        iframe.height = container.clientHeight;
      }
    };

    window.addEventListener("resize", resizeIframe);
    resizeIframe();

    return () => {
      window.removeEventListener("resize", resizeIframe);
    };
  }, []);

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-lg)',
      boxShadow: 'var(--shadow-soft)',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '100%',
      height: '100%',
      minHeight: '550px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--text)' }}>
          State-wide Operations Ledger
        </h3>
      </div>
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '12px' }}>
        <iframe
          ref={iframeRef}
          title="ASP & DySP Dashboard"
          width="100%"
          height="100%"
          src="https://app.powerbi.com/view?r=eyJrIjoiZDJmZmRlMTgtMGIzMi00M2QzLWEyNmMtNWJjN2M1NWM0NjgzIiwidCI6ImI1MzYyMTYxLTgyMWEtNDk3Mi04NGEwLTg2ZGQzNjA2OGVkOCJ9"
          frameBorder="0"
          allowFullScreen={true}
          style={{ border: 'none', width: '100%', height: '100%' }}
        ></iframe>
      </div>
    </div>
  );
};

export default Powerbi;
