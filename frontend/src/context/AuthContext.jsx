import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        () => localStorage.getItem("tts_token")
    );
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("tts_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            // No token at all → not logged in
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const freshUser = await getCurrentUser(token);

                // Backend returned a valid user → keep session in sync
                const normalizedUser = {
                    id: freshUser?.id ?? user?.id ?? null,
                    full_name: freshUser?.full_name ?? user?.full_name ?? "",
                    email: freshUser?.email ?? user?.email ?? "",
                };

                setUser(normalizedUser);
                localStorage.setItem("tts_user", JSON.stringify(normalizedUser));

                // Welcome toast — fires once per login session
                try {
                    const alreadyShown = sessionStorage.getItem("tts_welcome_shown");

                    if (!alreadyShown) {
                        sessionStorage.setItem("tts_welcome_shown", "1");

                        window.dispatchEvent(
                            new CustomEvent("tts:welcome", {
                                detail: {
                                    full_name: normalizedUser.full_name || "",
                                },
                            })
                        );
                    }
                } catch {
                    // ignore sessionStorage errors
                }
            } catch (err) {
                /*
                 * CRITICAL: Distinguish between:
                 *   1. Real auth failure (401)         → log out
                 *   2. Network / server / CORS error   → keep session (optimistic)
                 *
                 * On mobile cold starts, /api/auth/me often fails on the first
                 * attempt because the network isn't ready yet. We must NOT wipe
                 * the user's session in that case.
                 */

                const status = err?.response?.status;

                if (status === 401 || status === 403) {
                    // Token is genuinely invalid/expired → log out
                    console.warn("Session invalid (401/403), logging out.");
                    localStorage.removeItem("tts_token");
                    localStorage.removeItem("tts_user");
                    setToken(null);
                    setUser(null);
                } else {
                    // Network error / timeout / 5xx / CORS → keep the cached session.
                    // The user object is already in localStorage, and ProtectedRoute
                    // treats token + user as "authenticated".
                    console.warn(
                        "Could not verify session (non-auth error). Keeping cached session.",
                        err?.message || err
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        verifySession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const login = (loginResponse) => {
        localStorage.setItem("tts_token", loginResponse.access_token);
        localStorage.setItem("tts_user", JSON.stringify(loginResponse.user));

        setToken(loginResponse.access_token);
        setUser(loginResponse.user);

        // Welcome toast — fires once per login session
        try {
            const alreadyShown = sessionStorage.getItem("tts_welcome_shown");

            if (!alreadyShown) {
                sessionStorage.setItem("tts_welcome_shown", "1");

                window.dispatchEvent(
                    new CustomEvent("tts:welcome", {
                        detail: {
                            full_name: loginResponse?.user?.full_name || "",
                        },
                    })
                );
            }
        } catch {
            // ignore sessionStorage errors
        }
    };

    const logout = () => {
        localStorage.removeItem("tts_token");
        localStorage.removeItem("tts_user");

        try {
            sessionStorage.removeItem("tts_welcome_shown");
        } catch {
            // ignore
        }

        setToken(null);
        setUser(null);
    };

    const updateUser = (updates) => {
        setUser((previous) => {
            const next = {
                ...(previous || {}),
                ...(updates || {}),
            };

            try {
                localStorage.setItem("tts_user", JSON.stringify(next));
            } catch {
                // ignore localStorage errors
            }

            return next;
        });
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                loading,
                isAuthenticated: Boolean(token && user),
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}