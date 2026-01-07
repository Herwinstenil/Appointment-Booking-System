import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://localhost:5000/api';

    // Check for social login callback on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                localStorage.setItem('token', token);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('user', JSON.stringify(user));
                setIsLoggedIn(true);
                setUserRole(user.role);
                setUser(user);
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                // Navigate based on role
                const role = user.role;
                if (role === 'USER') {
                    navigate('/dashboard/user');
                } else if (role === 'ADMIN') {
                    navigate('/dashboard/admin');
                } else if (role === 'CLIENT') {
                    navigate('/dashboard/client');
                }
            } catch (error) {
                console.error('Error parsing social login data:', error);
            }
        }
    }, [navigate]);

    // Check for existing auth state on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        const userData = localStorage.getItem('user');

        if (token && role && userData) {
            setIsLoggedIn(true);
            setUserRole(role);
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
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
                const { user, token } = data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('user', JSON.stringify(user));
                setIsLoggedIn(true);
                setUserRole(user.role);
                setUser(user);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const register = async (userData) => {
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
                localStorage.setItem('token', token);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('user', JSON.stringify(user));
                setIsLoggedIn(true);
                setUserRole(user.role);
                setUser(user);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const resetPassword = async (email, newPassword) => {
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
                // After resetting password, auto-login with the new password
                return await login(email, newPassword);
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
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

        // Clear local state regardless of API call success
        setIsLoggedIn(false);
        setUserRole(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const socialLogin = (provider) => {
        window.location.href = `${API_BASE_URL}/auth/${provider}`;
    };

    const value = {
        isLoggedIn,
        userRole,
        user,
        loading,
        login,
        register,
        resetPassword,
        logout,
        getAuthHeaders,
        socialLogin,
        API_BASE_URL
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
