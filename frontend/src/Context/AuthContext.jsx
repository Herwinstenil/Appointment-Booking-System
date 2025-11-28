import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Check for existing auth state on mount
    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const role = localStorage.getItem('userRole');
        if (loggedIn && role) {
            setIsLoggedIn(true);
            setUserRole(role);
        }
    }, []);

    const login = (role) => {
        setIsLoggedIn(true);
        setUserRole(role);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUserRole(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
    };

    const value = {
        isLoggedIn,
        userRole,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
