import React from "react"
import { Link } from 'react-router-dom';

const HeroSection = () => {
    const caseFields = [
        { label: 'FIR No', value: 'KSP-2026-0142' },
        { label: 'Suspect', redacted: true },
        { label: 'Location', value: 'Bangalore Urban' },
        { label: 'Weapon', redacted: true },
        { label: 'Witness', redacted: true },
        { label: 'Verdict', redacted: true },
        { label: 'Status', value: 'Under Investigation' },
    ];

    return (
        <main className="hero container">
            <div className="hero-frame">
                <div className="file-header">
                    <span className="file-stamp">CASE FILE KSP-2026-0142 / DISTRICT BANGALORE URBAN</span>
                    <span className="classified-stamp">Declassified</span>
                </div>
                <div className="hero-body">
                    <div className="hero-text">
                        <h1>Karnataka State Police Crime Analytics</h1>
                        <p>Investigative dashboard for operational officers. Access real-time FIR data, case status, evidence chains, and crime forecasts across districts.</p>
                        <div className="hero-btn">
                            <Link to="/login"><button>Enter Dashboard</button></Link>
                            <Link to="/public/deterrence"><button className="secondary-btn">Public Data</button></Link>
                        </div>
                    </div>
                    <div className="hero-redactions">
                        {caseFields.map((field, i) => (
                            <div className="redacted-line" key={i}>
                                <span className="redacted-label">{field.label}</span>
                                {field.redacted ? (
                                    <div className="redaction-bar"></div>
                                ) : (
                                    <span className="redacted-value">{field.value}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default HeroSection
