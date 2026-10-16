import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';
import '../../styles/public-theme.css';

export default function PublicLayout() {
  return (
    <div className="landing" id="home">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <PublicNavbar />
      <main id="main-content"><Outlet /></main>
      <Footer />
    </div>
  );
}
