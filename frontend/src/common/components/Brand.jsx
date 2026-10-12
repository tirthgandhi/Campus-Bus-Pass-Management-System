import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function Brand({ compact = false, light = false }) {
  return <Link className={`brand${light ? ' brand-light' : ''}${compact ? ' brand-compact' : ''}`} to="/" aria-label="Campus Bus — Home">
    <span className="brand-mark"><Icon name="bus" size={25} /></span>
    <span className="brand-copy"><strong>Campus Bus</strong><span>Pass Management System</span></span>
  </Link>;
}
