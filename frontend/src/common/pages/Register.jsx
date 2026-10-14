import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Icon from '../components/Icon';
import Input from '../components/Input';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../routes/rolePaths';
import { signupUser } from '../services/authService';
import { getApiError } from '../services/api';
import './Auth.css';

export default function Register({ role }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', phone: '', studentId: '', department: '', licenseNumber: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submission = useRef(false);
  const active = useRef(true);
  const isStudent = role === 'student';
  const roleLabel = isStudent ? 'Student' : 'Driver';

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  if (loading) return <Loader />;
  if (isAuthenticated) return <Navigate to={getDashboardPath(user.role)} replace />;
  if (role !== 'student' && role !== 'driver') return <Navigate to="/login" replace />;

  const changeValue = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submission.current) return;
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Full name is required.';
    if (!values.email.trim()) nextErrors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!/^\+?[0-9][0-9 ()-]{6,19}$/.test(values.phone.trim()) || values.phone.replace(/\D/g, '').length < 7 || values.phone.replace(/\D/g, '').length > 15) nextErrors.phone = 'Enter a valid phone number.';
    if (isStudent && !values.studentId.trim()) nextErrors.studentId = 'Enrollment number is required.';
    if (isStudent && !values.department.trim()) nextErrors.department = 'Department is required.';
    if (!isStudent && !values.licenseNumber.trim()) nextErrors.licenseNumber = 'License number is required.';
    if (!values.password) nextErrors.password = 'Password is required.';
    else if (values.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    else if (new TextEncoder().encode(values.password).length > 72) nextErrors.password = 'Use a shorter password (at most 72 UTF-8 bytes).';
    if (!values.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    setError('');
    if (Object.keys(nextErrors).length) {
      event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }

    submission.current = true;
    setSubmitting(true);
    const email = values.email.trim().toLowerCase();
    try {
      await signupUser({ ...values, name: values.name.trim(), email, role });
      if (active.current) navigate(`/login?role=${role}`, { replace: true, state: { registered: true, email } });
    } catch (err) {
      if (active.current) setError(getApiError(err, 'signup'));
    } finally {
      submission.current = false;
      if (active.current) setSubmitting(false);
    }
  };

  return (
    <AuthLayout registration>
      <div className="auth-heading">
        <p className="eyebrow">{roleLabel.toUpperCase()} REGISTRATION</p>
        <h1>Create your account</h1>
        <p>{isStudent
          ? 'Get started with your university transportation portal.'
          : 'Join your university transportation team.'}</p>
      </div>

      <form className="auth-form" noValidate onSubmit={handleSubmit} aria-busy={submitting}>
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Enter your full name"
          value={values.name}
          onChange={changeValue}
          error={errors.name}
          disabled={submitting}
          required
        />
        <Input
          label={isStudent ? 'College email' : 'Email address'}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={isStudent ? 'you@university.edu' : 'you@example.com'}
          value={values.email}
          onChange={changeValue}
          error={errors.email}
          disabled={submitting}
          required
        />
        <div className="auth-form-row">
          <Input label="Phone number" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={changeValue} error={errors.phone} disabled={submitting} maxLength={20} required />
          <Input label={isStudent ? 'Enrollment number' : 'License number'} name={isStudent ? 'studentId' : 'licenseNumber'} value={isStudent ? values.studentId : values.licenseNumber} onChange={changeValue} error={isStudent ? errors.studentId : errors.licenseNumber} disabled={submitting} maxLength={60} required />
        </div>
        {isStudent && <Input label="Department" name="department" value={values.department} onChange={changeValue} error={errors.department} disabled={submitting} maxLength={160} required />}
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          helper="Use at least 8 characters."
          value={values.password}
          onChange={changeValue}
          error={errors.password}
          disabled={submitting}
          minLength={8}
          required
        />
        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={values.confirmPassword}
          onChange={changeValue}
          error={errors.confirmPassword}
          disabled={submitting}
          required
        />

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? 'Creating account...' : `Create ${roleLabel} Account`}
          {!submitting && <Icon name="arrow-right" size={18} />}
        </button>
      </form>

      <div className="auth-alternative">
        <p>Already registered? <Link className="text-link" to={`/login?role=${role}`}>Sign In</Link></p>
        <p className="auth-role-switch">{isStudent ? 'Registering as a driver?' : 'Registering as a student?'}{' '}
          <Link className="text-link" to={isStudent ? '/register/driver' : '/register/student'}>
            {isStudent ? 'Driver registration' : 'Student registration'}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
