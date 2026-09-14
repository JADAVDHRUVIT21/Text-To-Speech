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
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const freshUser = await getCurrentUser(token);

                // Backend now returns the full user object from /api/auth/me
                // (id, full_name, email). Keep local state + storage in sync.
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
            } catch {
                localStorage.removeItem("tts_token");
                localStorage.removeItem("tts_user");
                setToken(null);
                setUser(null);
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