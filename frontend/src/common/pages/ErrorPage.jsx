import { Link } from 'react-router-dom';
import Brand from '../components/Brand';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import './ErrorPage.css';
export default function ErrorPage({ forbidden = false }) {
  const { isAuthenticated } = useAuth();
  return <div className="error-page"><header className="container"><Brand /></header><main><p className="error-code">{forbidden ? '403' : '404'}</p><h1>{forbidden ? 'Access Denied' : 'Page Not Found'}</h1><p>{forbidden ? 'You do not have permission to access this page.' : 'The page you are looking for could not be found.'}</p><Link className="btn btn-primary" to={forbidden || isAuthenticated ? '/dashboard' : '/'}>{forbidden || isAuthenticated ? 'Return to Dashboard' : 'Go Home'}<Icon name="arrow-right" size={18} /></Link></main><footer>Campus Bus Pass Management System</footer></div>;
}
