import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Icon from '../components/Icon';
import Input from '../components/Input';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../routes/rolePaths';
import { getApiError } from '../services/api';
import './Auth.css';

const ROLES = ['student', 'driver', 'admin'];

function returnPath(from, role) {
  const pathname = typeof from === 'string' ? from.split(/[?#]/)[0] : from?.pathname;
  if (typeof pathname !== 'string' || pathname.includes('\\') || pathname.includes('..')) {
    return getDashboardPath(role);
  }
  if (pathname !== '/dashboard' && !pathname.startsWith(`/${role}/`)) {
    return getDashboardPath(role);
  }
  return typeof from === 'string' ? from : `${pathname}${from.search || ''}${from.hash || ''}`;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, loading } = useAuth();
  const role = ROLES.includes(searchParams.get('role')) ? searchParams.get('role') : 'student';
  const [email, setEmail] = useState(location.state?.registered ? location.state.email || '' : '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submission = useRef(false);
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  if (loading) return <Loader />;

  const changeRole = (nextRole) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('role', nextRole);
    setSearchParams(nextParams, { replace: true, state: location.state });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submission.current) return;
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    setError('');
    if (Object.keys(nextErrors).length) {
      event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    submission.current = true;
    setSubmitting(true);
    try {
      const authenticatedUser = await login(email.trim().toLowerCase(), password, role);
      if (active.current) {
        navigate(returnPath(location.state?.from, authenticatedUser.role), { replace: true });
      }
    } catch (err) {
      if (active.current) setError(getApiError(err, 'login'));
    } finally {
      submission.current = false;
      if (active.current) setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-heading">
        <p className="eyebrow">ACCESS YOUR PORTAL</p>
        <h1>Welcome back</h1>
        <p>Sign in to access the Campus Bus Pass Management System.</p>
      </div>

      {location.state?.registered && (
        <div className="alert alert-success auth-notice" role="status">
          <Icon name="check" size={18} />
          <span>Your account is ready. Sign in to continue.</span>
        </div>
      )}

      <form className="auth-form" noValidate onSubmit={handleSubmit} aria-busy={submitting}>
        <fieldset className="auth-role-fieldset" disabled={submitting}>
          <legend>Sign in as</legend>
          <div className="auth-role-options">
            {ROLES.map((value) => (
              <label className="auth-role-option" key={value}>
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => changeRole(value)}
                />
                <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@university.edu"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((current) => ({ ...current, email: '' }));
            setError('');
          }}
          error={errors.email}
          disabled={submitting}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: '' }));
            setError('');
          }}
          error={errors.password}
          disabled={submitting}
          required
        />

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign In'}
          {!submitting && <Icon name="arrow-right" size={18} />}
        </button>
      </form>

      <div className="auth-alternative">
        {role === 'admin' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 10px' }}>Administrator accounts are managed by the campus transport authority.</p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', minHeight: '38px', fontSize: '13px', padding: '6px 12px' }}
              onClick={() => {
                setEmail('transport.admin@campus.edu');
                setPassword('admin123');
                setErrors({});
                setError('');
              }}
            >
              Fill Demo Administrator Credentials
            </button>
          </div>
        ) : (
          <>
            <p>New to the campus transport portal?</p>
            <div className="auth-register-links">
              <Link className="text-link" to="/register/student">Create Student Account</Link>
              <span aria-hidden="true">·</span>
              <Link className="text-link" to="/register/driver">Create Driver Account</Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
