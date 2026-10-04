import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './common/context/AuthContext';
import ProtectedRoute from './common/components/ProtectedRoute';
import Landing from './common/pages/Landing';
import Login from './common/pages/Login';
import Signup from './common/pages/Signup';
import Dashboard from './common/pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Other team members register their routes below this line */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
