import React, { createContext, useContext, useState, useEffect } from 'react';

const TRANSLATIONS = {
  en: {
    appName: 'Crime Genome',
    appSub: 'Karnataka State Police Intelligence OS',
    home: 'My Day',
    cases: 'Cases',
    map: 'Command Map',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Logout',
    dashboard: 'Dashboard',
    officers: 'Officers',
    addfir: 'Add FIR',
    voice: 'Zia Voice',
    veracity: 'Veracity Index',
    topology: 'Topology Navigator',
    victimRisk: 'Victim Risk',
    gbv: 'GBV Analytics',
    darkFigure: 'Dark Figure',
    beatOpt: 'Beat Optimizer',
    deterrence: 'Deterrence',
    chargesheetClock: 'Chargesheet Clock',
    accusedLarge: 'Accused at Large',
    retraction: 'Retraction Rate',
    coAccused: 'Co-Accused Network',
    predictive: 'Predictive Mode',
    firQuality: 'FIR Quality',
    fairnessAudit: 'Fairness Audit',
    // Case details translation
    cardTitle: '30-Second Case Card',
    recommendedNext: 'Recommended next action:',
    crime: 'Crime Type',
    incident: 'Incident Date',
    location: 'Incident Location',
    io: 'Investigating Officer',
    readiness: 'Case Readiness',
    filing: 'Statutory Filing',
    keyEntities: 'Key Entities',
    recentTimeline: 'Recent Timeline',
    askZia: 'Ask ZIA',
    personaDemo: 'Demo Persona (Desktop)',
    personaField: 'Field Persona (2AM Phone)',
    switchLang: 'ಕನ್ನಡ',
    // Sections
    myWork: 'My Work',
    investigate: 'Investigate',
    commandStaff: 'Command & Staff',
    intelligence: 'Intelligence',
    publicIntel: 'Public Intelligence',
    workspace: 'Workspace',
    // Case Workspace Tabs
    tabOverview: 'Overview',
    tabBrief: 'AI Brief',
    tabTheory: 'Theory Board',
    tabEvidence: 'Evidence Locker',
    tabNetwork: 'Entity Graph',
    tabLog: 'Decision Log',
    tabTimeline: 'Timeline',
    tabNotes: 'Notes',
    tabChargesheet: 'Chargesheet Clock',
    faceAnalytics: 'Face Analytics',
  },
  kn: {
    appName: 'ಅಪರಾಧ ಜಿನೋಮ್',
    appSub: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ತನಿಖಾ ವ್ಯವಸ್ಥೆ',
    home: 'ನನ್ನ ದಿನ',
    cases: 'ಪ್ರಕರಣಗಳು',
    map: 'ಕಮಾಂಡ್ ನಕ್ಷೆ',
    notifications: 'ಸೂಚನೆಗಳು',
    profile: 'ಪ್ರೊಫೈಲ್',
    logout: 'ನಿರ್ಗಮಿಸಿ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    officers: 'ಅಧಿಕಾರಿಗಳು',
    addfir: 'ಎಫ್‌ಐಆರ್ ಸೇರಿಸಿ',
    voice: 'ಜಿಯಾ ಧ್ವನಿ',
    veracity: 'ಸತ್ಯಾಸತ್ಯತೆ ಸೂಚ್ಯಂಕ',
    topology: 'ಟೋಪೋಲಜಿ ನ್ಯಾವಿಗೇಟರ್',
    victimRisk: 'ಸಂತ್ರಸ್ತರ ಅಪಾಯ',
    gbv: 'ಜಿಬಿವಿ ವಿಶ್ಲೇಷಣೆ',
    darkFigure: 'ಡಾರ್ಕ್ ಫಿಗರ್',
    beatOpt: 'ಬೀಟ್ ಆಪ್ಟಿಮೈಜರ್',
    deterrence: 'ನಿರೋಧಕ ಶಕ್ತಿ',
    chargesheetClock: 'ದೋಷಾರೋಪಣೆ ಗಡಿಯಾರ',
    accusedLarge: 'ತಲೆಮರೆಸಿಕೊಂಡ ಆರೋಪಿಗಳು',
    retraction: 'ಹೇಳಿಕೆ ಹಿಂಪಡೆಯುವಿಕೆ ದರ',
    coAccused: 'ಸಹ-ಆರೋಪಿ ನೆಟ್‌ವರ್ಕ್',
    predictive: 'ಮುನ್ಸೂಚನೆ ಮೋಡ್',
    firQuality: 'ಎಫ್‌ಐಆರ್ ಗುಣಮಟ್ಟ',
    fairnessAudit: 'ನ್ಯಾಯಸಮ್ಮತತೆ ಆಡಿಟ್',
    // Case details translation
    cardTitle: '೩೦-ಸೆಕೆಂಡ್ ಕೇಸ್ ಕಾರ್ಡ್',
    recommendedNext: 'ಶಿಫಾರಸು ಮಾಡಿದ ಮುಂದಿನ ಕ್ರಮ:',
    crime: 'ಅಪರಾಧದ ಪ್ರಕಾರ',
    incident: 'ಘಟನೆಯ ದಿನಾಂಕ',
    location: 'ಘಟನೆಯ ಸ್ಥಳ',
    io: 'ತನಿಖಾ ಅಧಿಕಾರಿ',
    readiness: 'ಪ್ರಕರಣದ ಸಿದ್ಧತೆ',
    filing: 'ಕಾನೂನು ದಾಖಲಾತಿ',
    keyEntities: 'ಪ್ರಮುಖ ವ್ಯಕ್ತಿಗಳು/ಸಂಪರ್ಕಗಳು',
    recentTimeline: 'ಇತ್ತೀಚಿನ ಟೈಮ್‌ಲೈನ್',
    askZia: 'ಜಿಯಾವನ್ನು ಕೇಳಿ',
    personaDemo: 'ಡೆಮೊ ಪರ್ಸೋನಾ (ಡೆಸ್ಕ್‌ಟಾಪ್)',
    personaField: 'ಫೀಲ್ಡ್ ಪರ್ಸೋನಾ (೨AM ಫೋನ್)',
    switchLang: 'English',
    // Sections
    myWork: 'ನನ್ನ ಕೆಲಸ',
    investigate: 'ತನಿಖೆ',
    commandStaff: 'ಕಮಾಂಡ್ ಮತ್ತು ಸಿಬ್ಬಂದಿ',
    intelligence: 'ಗುಪ್ತಚರ ಮಾಹಿತಿ',
    publicIntel: 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ',
    workspace: 'ಕೆಲಸದ ಸ್ಥಳ',
    // Case Workspace Tabs
    tabOverview: 'ಅವಲೋಕನ',
    tabBrief: 'ಜಿಯಾ ಸಂಕ್ಷಿಪ್ತ',
    tabTheory: 'ಸಿದ್ಧಾಂತ ಬೋರ್ಡ್',
    tabEvidence: 'ಸಾಕ್ಷ್ಯ ಲಾಕರ್',
    tabNetwork: 'ಸಂಪರ್ಕ ಜಾಲ',
    tabLog: 'ನಿರ್ಧಾರ ಲಾಗ್',
    tabTimeline: 'ಟೈಮ್‌ಲೈನ್',
    tabNotes: 'ಟಿಪ್ಪಣಿಗಳು',
    tabChargesheet: 'ದೋಷಾರೋಪಣೆ ಪಟ್ಟಿ',
    faceAnalytics: 'ಮುಖದ ವಿಶ್ಲೇಷಣೆ',
  }
};

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('ksp-lang') || 'en');
  const [persona, setPersona] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('persona') === 'phone') return 'phone';
    return localStorage.getItem('ksp-persona') || 'desktop';
  });

  useEffect(() => {
    localStorage.setItem('ksp-lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('ksp-persona', persona);
  }, [persona]);

  const toggleLang = () => setLang(l => l === 'en' ? 'kn' : 'en');
  const togglePersona = () => setPersona(p => p === 'desktop' ? 'phone' : 'desktop');

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return React.createElement(
    I18nContext.Provider,
    { value: { lang, setLang, persona, setPersona, toggleLang, togglePersona, t } },
    children
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
};
