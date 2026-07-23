
const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        <div className="footer-left">
          <span className="footer-brand">KSP Crime Genome</span>
          <span className="footer-copy">&copy; 2026 Karnataka State Police</span>
        </div>
        <div className="footer-right">
          <a href="/public/deterrence" className="footer-link">Public Data</a>
          <a href="/login" className="footer-link">Dashboard</a>
          <span className="footer-tech">Powered by Zoho Catalyst</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
