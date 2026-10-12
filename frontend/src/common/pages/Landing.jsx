import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import CampusIllustration from '../components/CampusIllustration';
import './Landing.css';

const portals = [
  { role: 'student', label: 'Student', icon: 'graduation', description: 'Submit transport requests and access assigned bus and route information.' },
  { role: 'driver', label: 'Driver', icon: 'bus', description: 'Access assigned bus, routes and student transportation information.' },
  { role: 'admin', label: 'Admin / Facility', icon: 'building', description: 'Manage university transportation operations from one centralized system.' },
];
const steps = [ ['Submit a request', 'Student submits a transport request.'], ['Review the request', 'Admin reviews the request.'], ['Assign transport', 'Bus and route are assigned.'], ['Access your details', 'Student accesses transportation details.'] ];
const benefits = [ ['layout', 'Centralized Management', 'All transportation information is managed through one system.'], ['route', 'Clear Assignments', 'Students and drivers can access their assigned transportation information.'], ['shield', 'Role-Based Access', 'Each user accesses only the functionality relevant to their role.'] ];

export default function Landing() {
  return <div className="landing" id="home"><a className="skip-link" href="#main-content">Skip to content</a><PublicNavbar />
    <main id="main-content">
      <section className="hero-section"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line" />University Transportation Portal</p><h1>Campus Bus Pass<br /><span>Management System</span></h1><p className="hero-description">A centralized platform for managing student transport requests, bus assignments, routes and university transportation services.</p><div className="hero-actions"><Link to="/login" className="btn btn-primary">Access Portal <Icon name="arrow-right" size={18} /></Link><Link to="/register/student" className="btn btn-secondary">Student Registration</Link></div><p className="hero-note"><Icon name="shield" size={16} />Dedicated access for students, drivers and administrators.</p></div><CampusIllustration /></div></section>
      <section className="portal-section container" id="portal" aria-labelledby="portal-heading"><div className="section-heading"><div><p className="eyebrow">Choose your portal</p><h2 id="portal-heading">One System. Three User Roles.</h2></div><p>Your campus transport, in one place.</p></div><div className="portal-grid">{portals.map((portal, index) => <article className="portal-card" key={portal.role}><div className="portal-card-top"><span className="portal-icon"><Icon name={portal.icon} size={24} /></span><span className="portal-index">0{index + 1}</span></div><h3>{portal.label}</h3><p>{portal.description}</p><Link className="portal-link" to={`/login?role=${portal.role}`}>{portal.role === 'admin' ? 'Admin' : portal.label} Login<Icon name="arrow-right" size={18} /></Link></article>)}</div></section>
      <section className="how-section" id="how-it-works" aria-labelledby="how-heading"><div className="container"><div className="section-heading"><div><p className="eyebrow">A straightforward process</p><h2 id="how-heading">How the System Works</h2></div><p>From your first request to your daily commute.</p></div><ol className="steps">{steps.map(([title, description], i) => <li key={title}><span className="step-count">0{i + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol></div></section>
      <section className="benefits-section container" aria-labelledby="benefits-heading"><div className="benefits-intro"><p className="eyebrow">Built around your campus</p><h2 id="benefits-heading">Clarity for every<br />campus journey.</h2><p>A shared system that keeps university transportation organized.</p></div><div className="benefits-list">{benefits.map(([icon, title, description]) => <article key={title}><Icon name={icon} size={22} /><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></section>
    </main><Footer /></div>;
}
