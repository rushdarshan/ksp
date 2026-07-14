import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
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
