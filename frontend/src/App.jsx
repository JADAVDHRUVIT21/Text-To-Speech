import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "@heyputer/puter.js";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";
import Account from "./pages/Account";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, token, user } = useAuth();

  // While we're verifying the session, show a loading screen.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200"
            style={{ borderTopColor: "var(--accent-primary)" }}
          />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Restoring your session…
          </p>
        </div>
      </div>
    );
  }

  /*
   * Even if isAuthenticated is technically false, if we still have a token
   * and a cached user, we allow access — AuthContext keeps the session
   * optimistic on network failures, so mobile cold-starts don't log out.
   */
  const hasSession = isAuthenticated || (Boolean(token) && Boolean(user));

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

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
    </BrowserRouter>
  );
}

export default App;