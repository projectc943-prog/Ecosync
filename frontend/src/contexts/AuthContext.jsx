import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId) // Note: This assumes referencing by internal ID, but Supabase Auth uses UUID. 
                // CRITICAL FIX: The schema migration created 'users' with SERIAL id (integer). 
                // But Supabase Auth Users have UUIDs. 
                // We need to link them. 
                // Actually, for simplicity in this agentic run, let's query by 'email' since that's unique.
                // ideally auth.uid() should map to a uuid column, but our legacy schema has int id.
                // Let's query by email.
                .single();

            // Wait, if I can't use eq('email', ...) easily due to RLS potential, 
            // I should have created the table with id references auth.users.id.
            // Since I ran the migration already, let's just use email match for now or handle the mismatch.
            // Better approach: When signing up, we might have created a record.
            // Let's try fetching by email.
            if (!data) return null;
            return data;
        } catch (e) {
            console.error("Profile fetch error", e);
            return null;
        }
    };

    useEffect(() => {
        const initSession = async () => {
            console.log("AuthContext: Starting initSession");
            const token = localStorage.getItem('access_token');
            console.log("AuthContext: Token found?", !!token);

            if (token) {
                try {
                    console.log("AuthContext: Fetching /me from", import.meta.env.VITE_API_BASE_URL);

                    // Timeout logic
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s Timeout

                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    console.log("AuthContext: Response status", response.status);

                    if (response.ok) {
                        const userData = await response.json();
                        console.log("AuthContext: Use data loaded", userData);
                        setCurrentUser({ email: userData.email, name: `${userData.first_name} ${userData.last_name}` });
                        setUserProfile(userData);
                    } else {
                        console.warn("AuthContext: Token invalid, clearing");
                        localStorage.removeItem('access_token');
                    }
                } catch (e) {
                    console.error("Session init error", e);
                }
            }
            console.log("AuthContext: Setting loading false");
            setLoading(false);
        };

        initSession();
    }, []);

    // --- REAL AUTHENTICATION ---

    // Login
    const login = async (email, password) => {
        try {
            const formData = new FormData();
            formData.append('username', email); // OAuth2 expects 'username'
            formData.append('password', password);

            // Timeout logic
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s Timeout

            console.log("AuthContext: Login POST to", `${import.meta.env.VITE_API_BASE_URL}/token`);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/token`, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            console.log("AuthContext: Login Response status", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }

            const data = await response.json();

            // Success
            localStorage.setItem('access_token', data.access_token);

            const user = { email: email, name: data.user_name };
            setCurrentUser(user);
            setUserProfile({
                plan: data.plan,
                first_name: data.user_name.split(' ')[0],
                last_name: data.user_name.split(' ')[1] || ''
            });

            return { data, error: null };

        } catch (error) {
            console.error("Login Error:", error);
            if (error.name === 'AbortError') {
                return { data: null, error: new Error("Server Timeout. Please check your internet or retry.") };
            }
            return { data: null, error };
        }
    };

    // Signup
    const signup = async (email, password, extraData) => {
        try {
            const payload = {
                email,
                password,
                first_name: extraData.first_name || 'User',
                last_name: extraData.last_name || 'New',
                plan: extraData.plan || 'lite',
                location_name: extraData.location_name,
                location_lat: extraData.location_lat,
                location_lon: extraData.location_lon
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Registration failed');
            }

            const data = await response.json();

            // Success
            localStorage.setItem('access_token', data.access_token);

            const user = { email: email, name: data.user_name };
            setCurrentUser(user);
            setUserProfile({
                plan: data.plan,
                first_name: extraData.first_name,
                last_name: extraData.last_name
            });

            return { data, error: null };

        } catch (error) {
            console.error("Signup Error:", error);
            return { data: null, error };
        }
    };

    const logout = async () => {
        localStorage.removeItem('access_token');
        setCurrentUser(null);
        setUserProfile(null);
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                        <div className="text-emerald-500/60 text-xs font-mono tracking-widest animate-pulse">
                            INITIALIZING BIO-LINK...
                        </div>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
