import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PiArrowRightBold,
  PiEnvelopeSimple,
  PiIdentificationBadge,
  PiLockKey,
  PiTicket,
} from 'react-icons/pi';
import '../../App.scss';
import './Register.css';
import video from '../../LoginAssets/video.mp4';
import logo from '../../LoginAssets/logo.png';

const apiUrl = import.meta.env.VITE_API_URL || '/server';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const activateInvitation = async (event) => {
    event.preventDefault();
    if (isPending) return;

    const loadingToastId = toast.loading('Validating invitation');
    setIsPending(true);

    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Email: email.trim(),
          Username: username.trim(),
          Password: password,
          InvitationCode: invitationCode.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'This invitation could not be activated.');
      }

      toast.success(data.message || 'Account activated. Sign in to continue.', {
        id: loadingToastId,
      });
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error?.message || 'Unable to activate this invitation.', {
        id: loadingToastId,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="registerPage flex">
      <div className="container flex">
        <section className="videoDiv" aria-label="Restricted KSP account activation">
          <video src={video} autoPlay muted loop playsInline aria-hidden="true" />
          <div className="textDiv">
            <h1 className="title">Invitation-only access</h1>
            <p>Accounts are issued by unit administrators and bound to an approved role and station.</p>
          </div>
          <div className="footerDiv flex">
            <span className="text">Already activated?</span>
            <Link to="/login" className="btn">Sign in</Link>
          </div>
        </section>

        <section className="formDiv flex" aria-labelledby="activation-title">
          <div className="headerDiv">
            <img src={logo} alt="Karnataka State Police" />
            <h2 id="activation-title">Activate officer access</h2>
          </div>

          <form className="form grid" onSubmit={activateInvitation}>
            <p className="access-note">
              Use the invitation issued by your unit administrator. Rank and permissions cannot be selected here.
            </p>

            <div className="inputDiv">
              <label htmlFor="email">Official email</label>
              <div className="input flex">
                <PiEnvelopeSimple className="icon" aria-hidden="true" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  placeholder="Official email address"
                  autoComplete="email"
                  required
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="invitation-code">Invitation code</label>
              <div className="input flex">
                <PiTicket className="icon" aria-hidden="true" />
                <input
                  type="text"
                  id="invitation-code"
                  value={invitationCode}
                  placeholder="Issued by your administrator"
                  autoComplete="one-time-code"
                  required
                  onChange={(event) => setInvitationCode(event.target.value)}
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="username">Username</label>
              <div className="input flex">
                <PiIdentificationBadge className="icon" aria-hidden="true" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  placeholder="Choose a username"
                  autoComplete="username"
                  required
                  onChange={(event) => setUsername(event.target.value)}
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
                  value={password}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  minLength={10}
                  required
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn flex" disabled={isPending}>
              <span>{isPending ? 'Validating...' : 'Activate account'}</span>
              <PiArrowRightBold className="icon" aria-hidden="true" />
            </button>

            <p className="access-help">
              No invitation? Contact your station or unit administrator. Public rank registration is disabled.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Register;
