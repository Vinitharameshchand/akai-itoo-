import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const token = localStorage.getItem('vibe_token');
                if (token) {
                    const res = await api.get('/auth/profile');
                    if (res.data.success) {
                        const userData = res.data.user;
                        userData.userId = userData._id?.toString();
                        setUser(userData);
                    }
                }
            } catch (err) {
                console.error("Failed to restore user", err);
                localStorage.removeItem('vibe_token');
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const signup = async (userData) => {
        const res = await api.post('/auth/signup', userData);
        return res.data;
    };

    const signin = async (identifier, password) => {
        const res = await api.post('/auth/signin', { identifier, password });
        if (res.data.success && res.data.token) {
            localStorage.setItem('vibe_token', res.data.token);
            try {
                const profileRes = await api.get('/auth/profile');
                if (profileRes.data.success) {
                    const userData = profileRes.data.user;
                    userData.userId = userData._id?.toString();
                    setUser(userData);
                    return res.data;
                } else {
                    throw new Error("Could not load user profile");
                }
            } catch (profileErr) {
                console.error("Profile fetch failed:", profileErr);
                localStorage.removeItem('vibe_token');
                return { success: false, message: "Profile session could not be established." };
            }
        }
        return res.data;
    };

    const forgotPassword = async (email) => {
        const res = await api.post('/auth/forgot-password', { email });
        return res.data;
    };

    const verifyCode = async (email, code) => {
        const res = await api.post('/auth/verify-forgot-password-code', { email, code });
        return res.data;
    };

    const resetPassword = async (email, code, newPassword) => {
        const res = await api.post('/auth/reset-password', { email, code, newPassword });
        return res.data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('vibe_token');
    };

    return (
        <AuthContext.Provider value={{ user, loading, signup, signin, logout, setUser, forgotPassword, verifyCode, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
