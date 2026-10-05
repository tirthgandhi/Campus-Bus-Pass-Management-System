import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './common/context/AuthContext';
import AppRoutes from './common/routes/AppRoutes';

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>;
}
