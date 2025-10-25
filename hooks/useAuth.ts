import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

// In a real app, you wouldn't hardcode this. This is for demonstration.
const MOCK_USER: User = {
    id: '1',
    name: 'Builder User',
    email: 'builder@example.com',
    role: 'superadmin',
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const login = useCallback(async (email?: string, password?: string) => {
        // In a real app, this would involve an API call to your backend
        console.log("Attempting to log in with", email, password);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    return {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
    };
};
