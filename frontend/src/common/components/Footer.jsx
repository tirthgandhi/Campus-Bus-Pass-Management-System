import { Link } from 'react-router-dom';
import Brand from './Brand';
export default function Footer() {
  return <footer className="public-footer"><div className="container footer-main"><Brand /><nav aria-label="Footer navigation"><Link to="/">Home</Link><Link to="/login">Login</Link><Link to="/register/student">Student Registration</Link><Link to="/register/driver">Driver Registration</Link></nav></div><div className="container footer-bottom"><span>Academic University Transportation Management Project</span><span>Campus Bus Pass Management System</span></div></footer>;
}
