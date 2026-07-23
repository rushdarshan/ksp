import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PiArrowRightBold,
  PiIdentificationCard,
  PiLockKey,
} from 'react-icons/pi';
import '../../App.scss';
import './Login.css';
import video from '../../LoginAssets/video.mp4';
import logo from '../../LoginAssets/logo.png';
import { getRoleHome, useAuth } from '../../AuthContext';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

const DEMO_USERS = Object.freeze({
  anjumala: { rank: 'ACP', name: 'Anjumala' },
  dharmendra: { rank: 'Inspector', name: 'Dharmendra' },
  marutig: { rank: 'Subinspector', name: 'Maruti G' },
});

const Login = () => {
  const { authenticate, isAuthenticated, user } = useAuth();
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleHome(user), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const loginUser = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const username = loginUsername.trim().toLowerCase();
    const loadingToastId = toast.loading('Verifying officer access');
    setIsSubmitting(true);

    try {
      const demoUser = import.meta.env.DEV ? DEMO_USERS[username] : null;
      if (demoUser && loginPassword === '123') {
        authenticate(`mock-jwt-${username}`, demoUser);
        toast.success('Demo session started', { id: loadingToastId });
        return;
      }

      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          LoginUsername: loginUsername.trim(),
          LoginPassword: loginPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'The username or password is incorrect.');
      }

      authenticate(data.jwtToken || data.token, data.user);
      toast.success('Access verified', { id: loadingToastId });
    } catch (error) {
      toast.error(error?.message || 'Unable to sign in.', { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (username) => {
    setLoginUsername(username);
    setLoginPassword('123');
  };

  return (
    <main className="loginPage flex">
      <div className="container flex">
        <section className="videoDiv" aria-label="KSP Investigation OS">
          <video src={video} autoPlay muted loop playsInline aria-hidden="true" />
          <div className="textDiv">
            <h1 className="title">Crime Analytics Platform</h1>
            <p>Secure investigative tools for authorized Karnataka State Police personnel.</p>
          </div>
          <div className="footerDiv flex">
            <span className="text">Have an admin invitation?</span>
            <Link to="/register" className="btn">Activate access</Link>
          </div>
        </section>

        <section className="formDiv flex" aria-labelledby="login-title">
          <div className="headerDiv">
            <img src={logo} alt="Karnataka State Police" />
            <h2 id="login-title">Officer sign in</h2>
          </div>

          <form className="form grid" onSubmit={loginUser}>
            <div className="inputDiv">
              <label htmlFor="username">Username</label>
              <div className="input flex">
                <PiIdentificationCard className="icon" aria-hidden="true" />
                <input
                  type="text"
                  id="username"
                  value={loginUsername}
                  placeholder="Officer username"
                  autoComplete="username"
                  required
                  onChange={(event) => setLoginUsername(event.target.value)}
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="password">Password</label>
              <div className="input flex">
                <PiLockKey className="icon" aria-hidden="true" />
                <input
                  type="password"
                  id="password"
                  value={loginPassword}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn flex" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Verifying...' : 'Sign in'}</span>
              <PiArrowRightBold className="icon" aria-hidden="true" />
            </button>

            {import.meta.env.DEV && (
              <div className="demo-hint" aria-label="Development demo accounts">
                <span>Demo access:</span>
                <button type="button" onClick={() => fillDemo('anjumala')} className="demo-link">ACP</button>
                <button type="button" onClick={() => fillDemo('dharmendra')} className="demo-link">Inspector</button>
                <button type="button" onClick={() => fillDemo('marutig')} className="demo-link">Sub-Inspector</button>
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
};

export default Login;
