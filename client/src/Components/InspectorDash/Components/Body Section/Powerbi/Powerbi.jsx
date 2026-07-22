import React, { useEffect } from "react";

const powerbi = () => {
  useEffect(() => {
    const resizeIframe = () => {
      const iframe = document.getElementById("powerBIReport");
      const container = iframe.parentElement;
      iframe.width = container.clientWidth;
      iframe.height = container.clientHeight;
    };

    // Call resizeIframe when the window is resized
    window.addEventListener("resize", resizeIframe);

    // Initial resize
    resizeIframe();

    // Remove event listener on component unmount
    return () => {
      window.removeEventListener("resize", resizeIframe);
    };
  }, []);

  const handleIframeLoad = () => {
    // Delay resizing to ensure the content is fully loaded
    setTimeout(resizeIframe, 1000); // Adjust the delay time as needed
  };

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
          Interactive Operations Ledger
        </h3>
        <button aria-label="Dashboard menu" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          ⋮
        </button>
      </div>
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '12px' }}>
        <iframe
          id="powerBIReport"
          title="Inspector Dashboard"
          width="100%"
          height="100%"
          src="https://app.powerbi.com/view?r=eyJrIjoiODk0YTEwZTUtYzNkZC00ZDViLTkzZTMtNzI5NGNlNTEwNDY2IiwidCI6ImI1MzYyMTYxLTgyMWEtNDk3Mi04NGEwLTg2ZGQzNjA2OGVkOCJ9"
          frameBorder="0"
          allowFullScreen={true}
          onLoad={handleIframeLoad}
          style={{ border: 'none', width: '100%', height: '100%' }}
        ></iframe>
      </div>
    </div>
  );
};

export default powerbi;
