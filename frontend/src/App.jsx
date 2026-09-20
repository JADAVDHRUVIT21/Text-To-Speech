import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "@heyputer/puter.js";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";
import Account from "./pages/Account";
import AppSplash from "./components/AppSplash";

/*
 * ProtectedRoute — for pages that require login.
 * If not logged in → redirect to /login.
 *
 * While AuthContext is verifying, render nothing — the AppSplash at the
 * top of AppRoutes is already covering the screen.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, token, user } = useAuth();

  if (loading) return null;

  const hasSession = isAuthenticated || (Boolean(token) && Boolean(user));

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/*
 * GuestRoute — for pages only guests should see (login, register).
 * If already logged in → redirect to /dashboard.
 *
 * While AuthContext is verifying, render nothing — the AppSplash covers
 * the screen anyway.
 */
function GuestRoute({ children }) {
  const { isAuthenticated, loading, token, user } = useAuth();

  if (loading) return null;

  const hasSession = isAuthenticated || (Boolean(token) && Boolean(user));

  if (hasSession) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/*
 * AppRoutes — uses useAuth() so it must live inside AuthProvider.
 * Renders the global splash + the routes.
 */
function AppRoutes() {
  const { loading } = useAuth();

  return (
    <>
      {/* Global cold-start splash */}
      <AppSplash ready={!loading} minimumDuration={1400} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;