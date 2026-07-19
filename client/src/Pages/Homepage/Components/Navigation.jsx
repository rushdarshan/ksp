import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setScrolled(!e.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
      <div ref={sentinel} style={{ position: 'absolute', top: 0, height: 1 }} />
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <img src={logo} alt="KSP" className="nav-logo" />
          <span className="nav-title">Crime Genome</span>
        </Link>
        <div className="nav-links">
          <a href="#workflow" onClick={e => { e.preventDefault(); document.querySelector('.capabilities-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Platform</a>
          <a href="/public/deterrence">Public Data</a>
        </div>
        <Link to="/login" className="nav-login">Dashboard</Link>
      </div>
    </nav>
  );
}

export default Navigation;
