import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: 'var(--surface)',
          border: '1px solid var(--accent)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text)',
          margin: '1rem',
        }}>
          <h2 style={{ color: 'var(--accent)', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.1em' }}>
            [ SYSTEM ERROR ]
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--accent)',
                color: 'var(--bg)',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              RETRY
            </button>
            <Link
              to="/dashboard/home"
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textDecoration: 'none',
              }}
            >
              GO HOME
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
