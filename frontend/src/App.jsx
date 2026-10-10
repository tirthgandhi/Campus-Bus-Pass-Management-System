import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VerifyStudent from "./pages/VerifyStudent";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import RoutePage from "./pages/RoutePage";
import Profile from "./pages/Profile";
import ReportProblem from "./pages/ReportProblem";
import Spinner from "./components/ui/Spinner";

function AppRoutes() {
  const { token, loading } = useAuth();

  if (loading) return <Spinner />;

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/verify-student" element={<ProtectedRoute><VerifyStudent /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/route" element={<ProtectedRoute><RoutePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/report-problem" element={<ProtectedRoute><ReportProblem /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}