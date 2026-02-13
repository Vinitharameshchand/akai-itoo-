import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Moon, Heart, Calendar, ArrowLeft, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';

const WellnessSync = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ water: 0, sleep: 0 });
    const [cycle, setCycle] = useState({ lastPeriodDate: null, cycleLength: 28 });
    const [partnerStats, setPartnerStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [wellRes, cycleRes] = await Promise.all([
                api.get('/wellness/status'),
                api.get('/cycle/status')
            ]);
            if (wellRes.data.success) {
                setStats(wellRes.data.stats || { water: 0, sleep: 0 });
                setPartnerStats(wellRes.data.partnerStats);
            }
            if (cycleRes.data.success) {
                setCycle(cycleRes.data.cycle || { lastPeriodDate: null, cycleLength: 28 });
            }
        } catch (err) {
            console.error("Failed to fetch wellness data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Global room is joined in App.jsx
    }, [user]);

    const updateWellness = async (field, value) => {
        const newStats = { ...stats, [field]: value };
        setStats(newStats);
        try {
            await api.post('/wellness/update', newStats);
            // Award gems for positive actions
            if (value > stats[field]) {
                await api.post('/vibe/reward-gems', { amount: 10, reason: `Hydration/Sleep goal` });
            }
            // Notify partner
            const room = user.partnerId
                ? [user.userId.toString(), user.partnerId.toString()].sort().join("-")
                : user.userId.toString();
            socket.emit("vibe_update", { roomId: room, type: 'wellness', value: field });
        } catch (err) { console.error("Update failed"); }
    };

    return (
        <div className="app-container" style={{ padding: '1.5rem 1.5rem 120px 1.5rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>Wellness Sync</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Growing healthier, together.</p>
                </div>
            </header>

            {/* Daily Stats Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <motion.div
                    className="glass-card"
                    style={{ padding: '1.5rem', textAlign: 'center' }}
                    whileHover={{ y: -5 }}
                >
                    <Droplets size={32} color="#4FC3F7" style={{ marginBottom: '1rem' }} />
                    <h4 style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem' }}>WATER INTAKE</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.water}ml</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={() => updateWellness('water', Math.max(0, stats.water - 250))} className="icon-btn" style={{ background: 'rgba(79, 195, 247, 0.1)', color: '#0288D1' }}>-</button>
                        <button onClick={() => updateWellness('water', stats.water + 250)} className="icon-btn" style={{ background: 'rgba(79, 195, 247, 0.1)', color: '#0288D1' }}>+</button>
                    </div>
                </motion.div>

                <motion.div
                    className="glass-card"
                    style={{ padding: '1.5rem', textAlign: 'center' }}
                    whileHover={{ y: -5 }}
                >
                    <Moon size={32} color="#7986CB" style={{ marginBottom: '1rem' }} />
                    <h4 style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem' }}>SLEEP HOURS</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.sleep}h</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={() => updateWellness('sleep', Math.max(0, stats.sleep - 0.5))} className="icon-btn" style={{ background: 'rgba(121, 134, 203, 0.1)', color: '#303F9F' }}>-</button>
                        <button onClick={() => updateWellness('sleep', stats.sleep + 0.5)} className="icon-btn" style={{ background: 'rgba(121, 134, 203, 0.1)', color: '#303F9F' }}>+</button>
                    </div>
                </motion.div>
            </div>

            {/* Partner Care Section */}
            {partnerStats && (
                <motion.div
                    className="glass-card"
                    style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--primary-gradient)', color: 'white' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Heart size={24} fill="white" />
                        <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Partner's Vibe</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                Your person has had {partnerStats.water}ml of water and {partnerStats.sleep}h of sleep today.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Cycle Sync Section */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calendar size={24} color="var(--accent-coral)" />
                        <h3>Cycle Sync</h3>
                    </div>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255, 155, 155, 0.1)', color: 'var(--accent-coral)', padding: '4px 12px', borderRadius: '20px' }}>
                        Shared
                    </span>
                </div>

                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    {cycle.lastPeriodDate ? (
                        <div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Predicted Next Cycle</p>
                            <h2 style={{ fontSize: '2rem', color: 'var(--accent-coral)' }}>
                                {new Date(new Date(cycle.lastPeriodDate).getTime() + 28 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </h2>
                        </div>
                    ) : (
                        <div style={{ opacity: 0.5 }}>
                            <p>No cycle data logged yet.</p>
                            <button className="btn-secondary" style={{ marginTop: '1rem' }}>Log last period</button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .icon-btn {
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.1s;
                }
                .icon-btn:active {
                    transform: scale(0.9);
                }
            `}</style>
        </div>
    );
};

export default WellnessSync;
