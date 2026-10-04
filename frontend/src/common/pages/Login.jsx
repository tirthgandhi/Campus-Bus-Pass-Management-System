import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import './Login.css';

const ROLES = [
  { key: 'student', label: 'Student' },
  { key: 'driver',  label: 'Driver'  },
  { key: 'admin',   label: 'Admin'   },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole]         = useState('student');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(email.trim(), password);
      if (res.data.role !== role) {
        setError(`This account is registered as "${res.data.role}", not "${role}".`);
        setLoading(false);
        return;
      }
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ac-page">
      <div className="ac-card">

        {/* Card top row */}
        <div className="ac-card-top">
          <span className="ac-logo">CampusBus</span>
          <button className="ac-back" onClick={() => navigate('/')}>
            Back to home
          </button>
        </div>

        <h1 className="ac-heading">Welcome back</h1>
        <p  className="ac-sub">Sign in to your account to continue</p>

        {/* Role Tabs */}
        <div className="ac-tabs">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`ac-tab${role === r.key ? ' ac-tab--on' : ''}`}
              onClick={() => { setRole(r.key); setError(''); }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="ac-form">

          <div className="ac-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="ac-field">
            <label>Password</label>
            <div className="ac-pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="ac-pw-toggle"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <div className="ac-alert ac-alert--err">{error}</div>}

          <button
            type="submit"
            className="ac-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : `Sign in as ${ROLES.find(r => r.key === role)?.label}`}
          </button>

        </form>

        {role !== 'admin' && (
          <p className="ac-foot">
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')}>Create one</span>
          </p>
        )}

        {role === 'admin' && (
          <p className="ac-foot ac-foot--muted">
            Admin accounts are managed by the system.
          </p>
        )}

      </div>
    </div>
  );
};

export default Login;
