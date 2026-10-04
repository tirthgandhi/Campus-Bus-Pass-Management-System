import { useNavigate } from 'react-router-dom';
import './Landing.css';

const features = [
  {
    title: 'Digital Bus Pass',
    desc: 'Every student gets a unique permanent Bus Pass ID after approval. No paper, no hassle.',
  },
  {
    title: 'Route Management',
    desc: 'Admins create and manage routes, buses, and pickup points from one dashboard.',
  },
  {
    title: 'Live Attendance',
    desc: 'Drivers verify pass IDs and mark attendance in seconds — no paperwork required.',
  },
  {
    title: 'Transport Requests',
    desc: 'Students apply for transport online. Admins approve or reject with a reason.',
  },
  {
    title: 'Role Based Portals',
    desc: 'Separate, secure dashboards for students, drivers, and administrators.',
  },
  {
    title: 'Problem Reporting',
    desc: 'Drivers report bus issues instantly. Admin tracks and resolves them centrally.',
  },
];

const portals = [
  {
    role: 'Student',
    points: [
      'Submit a transport request',
      'Get assigned a bus and route',
      'Receive your permanent Bus Pass ID',
      'Track your attendance history',
    ],
  },
  {
    role: 'Driver',
    points: [
      'View your assigned bus and route',
      'See all students on your bus',
      'Verify Bus Pass IDs at boarding',
      'Report bus problems to admin',
    ],
  },
  {
    role: 'Admin',
    points: [
      'Manage buses, routes and drivers',
      'Approve or reject student requests',
      'Allocate students and generate passes',
      'Monitor attendance and reports',
    ],
  },
];

const Landing = () => {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing">

      {/* ── NAVBAR ── */}
      <nav className="ln-nav">
        <span className="ln-nav-logo">CampusBus</span>
        <div className="ln-nav-actions">
          <button className="ln-nav-login"  onClick={() => navigate('/login')}>
            Log in
          </button>
          <button className="ln-nav-signup" onClick={() => navigate('/signup')}>
            Sign up
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="ln-hero">
        <div className="ln-hero-inner">
          <p className="ln-hero-tag">University Transport Management</p>
          <h1 className="ln-hero-h1">
            The smarter way to<br />manage campus buses
          </h1>
          <p className="ln-hero-sub">
            One platform connecting students, drivers, and administrators —
            from bus pass requests to daily attendance.
          </p>
          <div className="ln-hero-btns">
            <button className="btn-white"   onClick={() => navigate('/signup')}>
              Get Started
            </button>
            <button className="btn-ghost"   onClick={scrollToFeatures}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="ln-stats">
        {[
          { n: '500+', l: 'Students Registered' },
          { n: '20+',  l: 'Drivers on Fleet'    },
          { n: '10+',  l: 'Active Routes'        },
          { n: '1',    l: 'Unified Platform'     },
        ].map((s) => (
          <div className="ln-stat" key={s.l}>
            <span className="ln-stat-n">{s.n}</span>
            <span className="ln-stat-l">{s.l}</span>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="ln-how">
        <div className="ln-section-inner">
          <div className="ln-section-head">
            <h2>Three portals. One system.</h2>
            <p>Each role gets a dedicated workspace built for their tasks.</p>
          </div>
          <div className="ln-portals">
            {portals.map((p) => (
              <div className="ln-portal-card" key={p.role}>
                <h3 className="ln-portal-role">{p.role}</h3>
                <ul className="ln-portal-list">
                  {p.points.map((pt) => (
                    <li key={pt}>
                      <span className="ln-check">✓</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="ln-features" id="features">
        <div className="ln-section-inner">
          <div className="ln-section-head">
            <h2>Everything you need</h2>
            <p>Built specifically for university bus transport operations.</p>
          </div>
          <div className="ln-feat-grid">
            {features.map((f) => (
              <div className="ln-feat-card" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="ln-cta">
        <h2>Ready to get started?</h2>
        <p>Join students and staff already using CampusBus.</p>
        <div className="ln-cta-btns">
          <button className="btn-white"        onClick={() => navigate('/signup')}>
            Create Account
          </button>
          <button className="btn-ghost-light"  onClick={() => navigate('/login')}>
            Log In
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ln-footer">
        © 2024 CampusBus &nbsp;·&nbsp; GSFC University &nbsp;·&nbsp; Facility Department
      </footer>

    </div>
  );
};

export default Landing;
