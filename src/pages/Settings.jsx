import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Heart, Shield, Bell, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

const Settings = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [character, setCharacter] = useState('bunny');
    const [mode, setMode] = useState('default');
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/vibe/mode');
                if (res.data.success) {
                    setMode(res.data.mode);
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();

        if (user) {
            const room = user.partnerId
                ? [user.userId, user.partnerId].sort().join("-")
                : user.userId;
            socket.emit("join_room", room);
        }
    }, [user]);

    const handleUpdateMode = async (newMode) => {
        setSaving(true);
        try {
            const res = await api.post('/vibe/update-mode', { mode: newMode });
            if (res.data.success) {
                setMode(newMode);
                showSuccess('Relationship mode updated!');
                // Notify partner
                const room = user.partnerId ? [user.userId, user.partnerId].sort().join("-") : user.userId;
                socket.emit("vibe_update", { roomId: room, type: 'mode', value: newMode });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateCharacter = async (char) => {
        setSaving(true);
        try {
            const res = await api.post('/vibe/update-character', { character: char });
            if (res.data.success) {
                setCharacter(char);
                showSuccess('Character avatar updated!');
                // Notify partner
                const room = user.partnerId ? [user.userId, user.partnerId].sort().join("-") : user.userId;
                socket.emit("vibe_update", { roomId: room, type: 'character', value: char });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const modes = [
        { id: 'default', label: 'Classic Vibe', desc: 'Standard relationship space' },
        { id: 'dating', label: 'New Spark', desc: 'For those just starting out' },
        { id: 'long-distance', label: 'Across Borders', desc: 'Sync when thousands of miles apart' },
        { id: 'cohabitation', label: 'Living Together', desc: 'Managing the shared home rhythm' },
        { id: 'new-parents', label: 'Little Miracle', desc: 'Focus on baby and parental wellness' }
    ];

    return (
        <div className="app-container" style={{ padding: '1.5rem 1.5rem 120px 1.5rem', background: 'var(--bg-primary)' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>Settings</h1>
            </header>

            {successMsg && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: '#E8F5E9', color: '#2E7D32', padding: '10px', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}
                >
                    {successMsg}
                </motion.div>
            )}

            {/* Profile Section */}
            <section style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', opacity: 0.6 }}>PERSONALIZATION</h3>

                {/* Character Selection */}
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Sparkles size={20} color="var(--accent-coral)" />
                        <span style={{ fontWeight: 600 }}>Your Spirit Animal</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <motion.div
                            onClick={() => handleUpdateCharacter('bunny')}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                textAlign: 'center',
                                borderRadius: '16px',
                                border: character === 'bunny' ? '2px solid var(--accent-coral)' : '1px solid var(--glass-border)',
                                background: character === 'bunny' ? 'rgba(255, 155, 155, 0.1)' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=bunny&backgroundColor=fdecec" style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '0.5rem' }} alt="Bunny" />
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>The Bunny</p>
                            {character === 'bunny' && <Check size={16} color="var(--accent-coral)" style={{ marginTop: '4px' }} />}
                        </motion.div>

                        <motion.div
                            onClick={() => handleUpdateCharacter('fox')}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                textAlign: 'center',
                                borderRadius: '16px',
                                border: character === 'fox' ? '2px solid var(--accent-coral)' : '1px solid var(--glass-border)',
                                background: character === 'fox' ? 'rgba(255, 155, 155, 0.1)' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=fox&backgroundColor=fdecec" style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '0.5rem' }} alt="Fox" />
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>The Fox</p>
                            {character === 'fox' && <Check size={16} color="var(--accent-coral)" style={{ marginTop: '4px' }} />}
                        </motion.div>
                    </div>
                </div>

                {/* Relationship Mode */}
                <div className="glass-card" style={{ padding: '0.5rem' }}>
                    <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Heart size={20} color="var(--accent-coral)" />
                        <span style={{ fontWeight: 600 }}>Relationship Mode</span>
                    </div>
                    {modes.map((m) => (
                        <div
                            key={m.id}
                            onClick={() => handleUpdateMode(m.id)}
                            style={{
                                padding: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderTop: '1px solid rgba(0,0,0,0.05)',
                                background: mode === m.id ? 'rgba(0,0,0,0.02)' : 'none'
                            }}
                        >
                            <div>
                                <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{m.label}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.desc}</p>
                            </div>
                            {mode === m.id ? <Check size={18} color="var(--accent-coral)" /> : <ChevronRight size={18} color="rgba(0,0,0,0.2)" />}
                        </div>
                    ))}
                </div>
            </section>

            {/* Other Settings */}
            <section style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', opacity: 0.6 }}>SYSTEM</h3>
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <Bell size={20} color="#666" />
                        <span style={{ flex: 1, fontSize: '0.9rem' }}>Push Notifications</span>
                        <div style={{ width: '40px', height: '20px', background: '#DDD', borderRadius: '20px', position: 'relative' }}>
                            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }} />
                        </div>
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <Shield size={20} color="#666" />
                        <span style={{ flex: 1, fontSize: '0.9rem' }}>Privacy & Security</span>
                        <ChevronRight size={18} color="#999" />
                    </div>
                </div>
            </section>

            <button
                onClick={logout}
                className="btn-secondary"
                style={{ width: '100%', padding: '1.25rem', color: '#D32F2F', border: '1px solid #FFCDD2', background: '#FFEBEE' }}
            >
                Log Out
            </button>
        </div>
    );
};

export default Settings;
