import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../services/authService';
import './Login.css';

const Signup = () => {
  const navigate = useNavigate();

  const [role,         setRole]        = useState('student');
  const [firstName,    setFirstName]   = useState('');
  const [lastName,     setLastName]    = useState('');
  const [email,        setEmail]       = useState('');
  const [collegeEmail, setCollegeEmail]= useState('');
  const [password,     setPassword]    = useState('');
  const [confirm,      setConfirm]     = useState('');
  const [showPw,       setShowPw]      = useState(false);
  const [showCf,       setShowCf]      = useState(false);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState('');
  const [success,      setSuccess]     = useState('');

  const validate = () => {
    if (!firstName.trim() || !lastName.trim()) return 'Please enter your full name';
    if (!email.trim())                          return 'Email address is required';
    if (role === 'student' && !collegeEmail.trim()) return 'College email is required for students';
    if (password.length < 6)                    return 'Password must be at least 6 characters';
    if (password !== confirm)                   return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await signupUser(firstName.trim(), lastName.trim(), email.trim(), collegeEmail.trim(), password, role);
      setSuccess('Account created! Taking you to login...');
      setTimeout(() => navigate('/login'), 1600);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ac-page">
      <div className="ac-card ac-card--wide">

        {/* Card top row */}
        <div className="ac-card-top">
          <span className="ac-logo">CampusBus</span>
          <button className="ac-back" onClick={() => navigate('/login')}>
            Back to login
          </button>
        </div>

        <h1 className="ac-heading">Create account</h1>
        <p  className="ac-sub">Register as a student or driver</p>

        {/* Role Tabs — 2 only */}
        <div className="ac-tabs">
          {['student', 'driver'].map((r) => (
            <button
              key={r}
              type="button"
              className={`ac-tab${role === r ? ' ac-tab--on' : ''}`}
              onClick={() => { setRole(r); setError(''); setCollegeEmail(''); }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="ac-form">

          {/* Name row */}
          <div className="ac-row">
            <div className="ac-field">
              <label>First name</label>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="ac-field">
              <label>Last name</label>
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="ac-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {role === 'student' && (
            <div className="ac-field">
              <label>College email ID</label>
              <input
                type="email"
                placeholder="22ce001@gsfc.ac.in"
                value={collegeEmail}
                onChange={(e) => setCollegeEmail(e.target.value)}
              />
            </div>
          )}

          <div className="ac-field">
            <label>Password</label>
            <div className="ac-pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="ac-pw-toggle"
                onClick={() => setShowPw(!showPw)}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="ac-field">
            <label>Confirm password</label>
            <div className="ac-pw-wrap">
              <input
                type={showCf ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button type="button" className="ac-pw-toggle"
                onClick={() => setShowCf(!showCf)}>
                {showCf ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error   && <div className="ac-alert ac-alert--err">{error}</div>}
          {success && <div className="ac-alert ac-alert--ok">{success}</div>}

          <button type="submit" className="ac-submit" disabled={loading}>
            {loading
              ? 'Creating account...'
              : `Create ${role === 'student' ? 'Student' : 'Driver'} Account`}
          </button>

        </form>

        <p className="ac-foot">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Sign in</span>
        </p>

      </div>
    </div>
  );
};

export default Signup;
