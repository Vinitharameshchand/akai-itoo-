import { useState, useEffect } from 'react';
import api from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Clock, Send, ArrowLeft, Hourglass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TimeCapsule = () => {
    const [capsules, setCapsules] = useState([]);
    const [message, setMessage] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const navigate = useNavigate();

    const fetchCapsules = async () => {
        try {
            const res = await api.get('/capsule/all');
            if (res.data.success) {
                setCapsules(res.data.capsules);
            }
        } catch (err) {
            console.error("Failed to load capsules");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCapsules();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/capsule/create', { message, unlockDate });
            if (res.data.success) {
                setMessage('');
                setUnlockDate('');
                setIsAdding(false);
                fetchCapsules();
            }
        } catch (err) {
            console.error("Failed to bury capsule");
        }
    };

    return (
        <div className="app-container" style={{ padding: '1.5rem 1.5rem 120px 1.5rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>Time Capsule</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Letters to our future selves.</p>
                </div>
            </header>

            <button
                onClick={() => setIsAdding(!isAdding)}
                className="btn-secondary"
                style={{ width: '100%', marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
                {isAdding ? 'Close Burial Ground' : 'Bury New Memory'}
                {isAdding ? <Clock size={18} /> : <Hourglass size={18} />}
            </button>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ padding: '2rem', marginBottom: '3rem' }}
                    >
                        <h3 style={{ marginBottom: '1.25rem' }}>Bury a Secret</h3>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <textarea
                                placeholder="Write something sweet for the future..."
                                rows="4"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)', outline: 'none', resize: 'none' }}
                            />
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Opening Date</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={unlockDate}
                                    onChange={(e) => setUnlockDate(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)', outline: 'none' }}
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                                <Send size={18} /> Bury in the Earth
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {capsules.map((cap) => (
                    <motion.div
                        key={cap._id}
                        className="glass-card"
                        style={{
                            padding: '1.5rem',
                            opacity: cap.isLocked ? 0.8 : 1,
                            background: cap.isLocked ? 'rgba(255,255,255,0.2)' : 'var(--glass-bg)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {cap.isLocked ? <Lock size={20} color="#DEB3B3" /> : <Unlock size={20} color="var(--accent-coral)" />}
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: cap.isLocked ? '#AAA' : 'var(--text-primary)' }}>
                                    {cap.isLocked ? 'LOCKED' : 'OPENED'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                <Clock size={12} /> {new Date(cap.unlockDate).toLocaleDateString()}
                            </div>
                        </div>

                        {cap.isLocked ? (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Opening at {new Date(cap.unlockDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <div style={{ fontSize: '2.5rem', marginTop: '1rem', filter: 'grayscale(1)' }}>📦</div>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <p style={{ lineHeight: '1.6', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{cap.message}"</p>
                                <p style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '1rem', color: 'var(--accent-coral)', fontWeight: 600 }}>
                                    — {cap.isSender ? "My younger self" : "Partner's past self"}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
                {capsules.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.4 }}>
                        <Hourglass size={48} style={{ marginBottom: '1rem' }} />
                        <p>No capsules buried yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeCapsule;
