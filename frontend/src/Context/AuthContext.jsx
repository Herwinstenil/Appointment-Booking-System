import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import i18n from '../i18n/index.js';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const ROLE_SESSION_STORAGE_KEY = 'appointment_role_sessions';
const ACTIVE_ROLE_STORAGE_KEY = 'userRole';

const readStoredSessions = () => {
    if (typeof window === 'undefined') {
        return {};
    }
    try {
        const stored = localStorage.getItem(ROLE_SESSION_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Failed to parse stored sessions:', error);
        return {};
    }
};

const persistSessions = (sessions) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(ROLE_SESSION_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
        console.error('Failed to persist sessions:', error);
    }
};

const getInitialAuthState = () => {
    if (typeof window === 'undefined') {
        return { sessions: {}, userRole: null };
    }

    const sessions = readStoredSessions();
    const storedRole = sessionStorage.getItem(ACTIVE_ROLE_STORAGE_KEY) || localStorage.getItem(ACTIVE_ROLE_STORAGE_KEY);
    const resolvedRole = resolveActiveRole(sessions, storedRole);
    return { sessions, userRole: resolvedRole };
};

const updateActiveRoleStorage = (role) => {
    if (typeof window === 'undefined') {
        return;
    }

    if (role) {
        sessionStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, role);
        localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, role);
    } else {
        sessionStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
        localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);
    }
};

const resolveActiveRole = (sessions, preferredRole = null) => {
    if (!sessions || typeof sessions !== 'object') return null;
    const roles = Object.keys(sessions);
    if (roles.length === 0) return null;

    const normalizedPreferred = preferredRole?.toUpperCase();
    if (normalizedPreferred && sessions[normalizedPreferred]?.token) {
        return normalizedPreferred;
    }

    return roles.find((role) => sessions[role]?.token) || null;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const initialAuth = getInitialAuthState();
    const [sessions, setSessions] = useState(initialAuth.sessions);
    const [userRole, setUserRole] = useState(initialAuth.userRole);
    const [isLoggedIn, setIsLoggedIn] = useState(Boolean(initialAuth.userRole && initialAuth.sessions[initialAuth.userRole]?.token));
    const [user, setUser] = useState(initialAuth.userRole ? initialAuth.sessions[initialAuth.userRole]?.user : null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://localhost:5000/api';

    const applyLanguage = useCallback((lang) => {
        if (!lang) return;
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    }, []);

    useEffect(() => {
        const storedLang = localStorage.getItem('language');
        if (storedLang) {
            applyLanguage(storedLang);
        }
        setLoading(false);
    }, [applyLanguage]);

    useEffect(() => {
        const activeSession = userRole ? sessions[userRole] : null;
        setUser(activeSession?.user || null);
        setIsLoggedIn(Boolean(activeSession?.token));
        if (activeSession?.user?.language) {
            applyLanguage(activeSession.user.language);
        }
    }, [sessions, userRole, applyLanguage]);

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key !== ROLE_SESSION_STORAGE_KEY) {
                return;
            }
            const latestSessions = readStoredSessions();
            const storedRole = typeof window !== 'undefined'
                ? (sessionStorage.getItem(ACTIVE_ROLE_STORAGE_KEY) || localStorage.getItem(ACTIVE_ROLE_STORAGE_KEY))
                : null;
            const resolvedRole = resolveActiveRole(latestSessions, storedRole);
            setSessions(latestSessions);
            setUserRole(resolvedRole);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const storeRoleSession = useCallback((role, token, userPayload) => {
        if (!role || !token) return;
        const normalized = role.toUpperCase();
        setSessions(() => {
            const latestSessions = readStoredSessions();
            const next = { ...latestSessions, [normalized]: { token, user: userPayload } };
            persistSessions(next);
            return next;
        });
        setUserRole(normalized);
        updateActiveRoleStorage(normalized);
        if (userPayload?.language) {
            applyLanguage(userPayload.language);
        }
    }, [applyLanguage]);

    const activateRole = useCallback((role) => {
        if (!role) return;
        const normalized = role.toUpperCase();
        const availableSessions = Object.keys(sessions).length ? sessions : readStoredSessions();
        if (!availableSessions[normalized]?.token) {
            return;
        }
        if (availableSessions !== sessions) {
            setSessions(availableSessions);
        }
        setUserRole(normalized);
        updateActiveRoleStorage(normalized);
        const roleUser = availableSessions[normalized].user;
        if (roleUser?.language) {
            applyLanguage(roleUser.language);
        }
    }, [sessions, applyLanguage]);

    const getAuthHeaders = useCallback((role = userRole) => {
        const normalized = role?.toUpperCase();
        if (!normalized) return {};
        const session = sessions[normalized] || readStoredSessions()[normalized];
        if (!session?.token) return {};
        return { 'Authorization': `Bearer ${session.token}` };
    }, [sessions, userRole]);

    const getSession = useCallback((role = userRole) => {
        const normalized = role?.toUpperCase();
        if (!normalized) return null;
        return sessions[normalized] || readStoredSessions()[normalized] || null;
    }, [sessions, userRole]);

    const availableRoles = useMemo(() => Object.keys(sessions), [sessions]);

    const login = useCallback(async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                if (data.data?.requiresTwoFactor) {
                    return {
                        success: false,
                        requiresTwoFactor: true,
                        tempToken: data.data.tempToken,
                        twoFactorMethod: data.data.twoFactorMethod || 'APP',
                        message: data.message || 'Two-factor verification required'
                    };
                }

                const { user, token } = data.data;
                storeRoleSession(user.role, token, user);
                return { success: true };
            }

            return { success: false, message: data.message };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }, [API_BASE_URL, storeRoleSession]);

    const verifyTwoFactorLogin = useCallback(async (tempToken, token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tempToken, token }),
            });

            const data = await response.json();

            if (data.success) {
                const { user, token: authToken } = data.data;
                storeRoleSession(user.role, authToken, user);
                return { success: true };
            }

            return { success: false, message: data.message };
        } catch (error) {
            console.error('2FA login verification error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }, [API_BASE_URL, storeRoleSession]);

    const register = useCallback(async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (data.success) {
                const { user, token } = data.data;
                storeRoleSession(user.role, token, user);
                return { success: true };
            }

            return { success: false, message: data.message };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }, [API_BASE_URL, storeRoleSession]);

    const resetPassword = useCallback(async (email, newPassword) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, newPassword }),
            });

            const data = await response.json();

            if (data.success) {
                return await login(email, newPassword);
            }

            return { success: false, message: data.message };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }, [API_BASE_URL, login]);

    const logout = useCallback(async (targetRole) => {
        const normalizedRole = (targetRole || userRole)?.toUpperCase();
        if (!normalizedRole) {
            return;
        }

        const latestSessions = readStoredSessions();
        const session = latestSessions[normalizedRole] || sessions[normalizedRole];
        const token = session?.token;

        try {
            if (token) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        }

        const base = readStoredSessions();
        if (!base[normalizedRole]) {
            return;
        }

        const next = { ...base };
        delete next[normalizedRole];
        persistSessions(next);
        const fallback = resolveActiveRole(next);
        setSessions(next);
        setUserRole(fallback);
        updateActiveRoleStorage(fallback);
    }, [API_BASE_URL, sessions, userRole]);

    const updateUser = useCallback((updates) => {
        if (!userRole) {
            return;
        }

        setSessions(() => {
            const base = readStoredSessions();
            const current = base[userRole];
            if (!current) {
                return base;
            }

            const normalizedNewRole = updates.role?.toUpperCase();
            const targetRole = normalizedNewRole && normalizedNewRole !== userRole ? normalizedNewRole : userRole;
            const updatedUser = { ...current.user, ...updates };

            const nextSessions = { ...base };
            if (normalizedNewRole && normalizedNewRole !== userRole) {
                delete nextSessions[userRole];
            }

            nextSessions[targetRole] = {
                token: current.token,
                user: updatedUser
            };

            persistSessions(nextSessions);
            return nextSessions;
        });

        if (updates.language) {
            applyLanguage(updates.language);
        }

        if (updates.role) {
            const normalizedRole = updates.role.toUpperCase();
            setUserRole(normalizedRole);
            updateActiveRoleStorage(normalizedRole);
        }
    }, [userRole, applyLanguage]);

    const socialLogin = useCallback((provider) => {
        window.location.href = `${API_BASE_URL}/auth/${provider}`;
    }, [API_BASE_URL]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                storeRoleSession(user.role, token, user);
                window.history.replaceState({}, document.title, window.location.pathname);
                if (user.role === 'USER') {
                    navigate('/dashboard/user');
                } else if (user.role === 'ADMIN') {
                    navigate('/dashboard/admin');
                } else if (user.role === 'CLIENT') {
                    navigate('/dashboard/client');
                }
            } catch (error) {
                console.error('Error parsing social login data:', error);
            }
        }
    }, [navigate, storeRoleSession]);

    const value = {
        isLoggedIn,
        userRole,
        user,
        loading,
        login,
        verifyTwoFactorLogin,
        register,
        resetPassword,
        logout,
        getAuthHeaders,
        socialLogin,
        updateUser,
        API_BASE_URL,
        activateRole,
        getSession,
        availableRoles
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
