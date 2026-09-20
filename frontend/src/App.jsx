import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import "@heyputer/puter.js";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";
import Account from "./pages/Account";

/*
 * ProtectedRoute — for pages that require login.
 * If not logged in → redirect to /login.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, token, user } = useAuth();

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

  const hasSession = isAuthenticated || (Boolean(token) && Boolean(user));

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/*
 * GuestRoute — for pages only guests should see (login, register).
 *
 * IMPORTANT: This does NOT redirect the instant we detect a session,
 * because that would kill the login page's own splash animation before
 * it can play. Instead, we wait a short grace period so the splash can
 * finish and the page can navigate itself.
 *
 * If nothing happens in that window (e.g. user landed here already
 * logged in), we redirect.
 */
function GuestRoute({ children }) {
  const { isAuthenticated, loading, token, user } = useAuth();
  const location = useLocation();
  const [redirectNow, setRedirectNow] = useState(false);

  const hasSession = isAuthenticated || (Boolean(token) && Boolean(user));

  useEffect(() => {
    if (loading) return;
    if (!hasSession) {
      setRedirectNow(false);
      return;
    }

    // Already logged in → wait for the login splash (~1.6s) before
    // bouncing to the dashboard. This is what lets the splash play.
    const timer = setTimeout(() => {
      setRedirectNow(true);
    }, 1600);

    return () => clearTimeout(timer);
    // We intentionally include location.pathname so re-visiting /login
    // re-runs the grace period.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasSession, location.pathname]);

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

  if (hasSession && redirectNow) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;