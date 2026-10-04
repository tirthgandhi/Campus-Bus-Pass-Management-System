import './Loader.css';

/**
 * Loader — full-screen spinner shown while auth state is resolving
 */
const Loader = () => (
  <div className="loader-overlay">
    <div className="loader-spinner"></div>
  </div>
);

export default Loader;
