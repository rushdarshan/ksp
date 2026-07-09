import React from 'react';
import { Link } from 'react-router-dom';

import logo from '../assets/logo.png';

const Navigation = () => {
  return (
    <div>
      <nav className="container">
        <div className="logo">
          <img src={logo} alt="KSP" />
          <h2>KSP Crime Genome</h2>
        </div>
        <ul>
             <li><a href="#location" onClick={e => { e.preventDefault(); document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' }); }}>Location</a></li>
             <li><a href="#about" onClick={e => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>About</a></li>
             <li><a href="#contact" onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a></li>
        </ul>
        <Link to="/login"><button>Log In</button></Link>
      </nav>
    </div>
  );
}

export default Navigation;
