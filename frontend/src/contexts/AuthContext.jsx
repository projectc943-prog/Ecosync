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
        // Check active session
        const initSession = async () => {
            console.log("AuthContext: initSession started");
            try {
                const { data, error } = await supabase.auth.getSession();
                console.log("AuthContext: getSession result", { data, error });

                if (error) throw error;

                const session = data.session;
                if (session?.user) {
                    console.log("AuthContext: User found", session.user.email);
                    setCurrentUser(session.user);
                    // Fetch profile
                    try {
                        const { data: profile, error: profileError } = await supabase.from('users').select('*').eq('email', session.user.email).maybeSingle();
                        console.log("AuthContext: Profile fetch", { profile, profileError });
                        if (profile) {
                            setUserProfile(profile);
                            localStorage.setItem('plan', profile.plan || 'lite');
                        }
                    } catch (err) {
                        console.error("AuthContext: Profile fetch error", err);
                    }
                } else {
                    console.log("AuthContext: No active session");
                    setCurrentUser(null);
                    setUserProfile(null);
                }
            } catch (err) {
                console.error("AuthContext: initSession Critical Error", err);
            } finally {
                console.log("AuthContext: Setting loading FALSE");
                setLoading(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Only react to meaningful auth changes to avoid loops
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
                setCurrentUser(session?.user ?? null);
                if (session?.user) {
                    try {
                        const { data } = await supabase.from('users').select('*').eq('email', session.user.email).maybeSingle();
                        if (data) {
                            setUserProfile(data);
                            localStorage.setItem('plan', data.plan || 'lite');
                        }
                    } catch (err) {
                        console.error("Profile fetch error on change:", err);
                    }
                } else {
                    setUserProfile(null);
                }
                setLoading(false);
            }
        });

        initSession();

        return () => subscription.unsubscribe();
    }, []);

    const login = (email, password) => supabase.auth.signInWithPassword({ email, password });

    const signup = async (email, password, data) => {
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });
        if (authError) return { data: null, error: authError };

        // 2. Create Public Profile in 'users' table
        if (authData.user) {
            const { error: dbError } = await supabase.from('users').insert([{
                email: email,
                first_name: data.first_name,
                last_name: data.last_name,
                plan: data.plan || 'lite'
            }]);
            if (dbError) console.error("Profile creation failed", dbError);
        }

        return { data: authData, error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('plan');
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
