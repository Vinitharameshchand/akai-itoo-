import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, MessageCircle, Mic, Star, Link as LinkIcon, LogOut, Hourglass, Camera, Coffee, Palette, Activity, Settings as SettingsIcon, RefreshCcw, Sunrise, Moon, Calendar, Gift, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import socket from '../socket';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dailyQuestion, setDailyQuestion] = useState(null);
    const [dailyLoveMessage, setDailyLoveMessage] = useState("");
    const [streak, setStreak] = useState(0);
    const [myMood, setMyMood] = useState('😊');
    const [myStatus, setMyStatus] = useState('');
   
    const [ritualStatus, setRitualStatus] = useState({ morning: { sent: false, partnerSent: false }, night: { sent: false, partnerSent: false } });
    const [ritualStreak, setRitualStreak] = useState(0);
    const [anniversaryData, setAnniversaryData] = useState(null);

    useEffect(() => {
        if (!user) return;

        // Global room is joined in App.jsx

        socket.on("partner_vibe_change", (data) => {
            console.log("Partner vibe changed:", data);
            fetchData();
        });

        return () => {
            socket.off("partner_vibe_change");
        };
    }, [user]);

    const fetchData = async () => {
        try {
            const [statusRes, questionRes, loveRes, streakRes, ritualRes, ritualStreakRes] = await Promise.all([
                api.get('/vibe/partner-status'),
                api.get('/ai/daily-question?type=question'),
                api.get('/ai/daily-love-message'),
                api.get('/streak/status'),
                api.get('/vibe/ritual/status'),
                api.get('/vibe/ritual/streak')
            ]);

            // Calculate anniversary countdown
            if (user?.anniversaryDate) {
                const anniversary = new Date(user.anniversaryDate);
                const today = new Date();
                const thisYear = today.getFullYear();
                
                // Next anniversary this year or next year
                let nextAnniversary = new Date(thisYear, anniversary.getMonth(), anniversary.getDate());
                if (nextAnniversary < today) {
                    nextAnniversary = new Date(thisYear + 1, anniversary.getMonth(), anniversary.getDate());
                }
                
                const timeDiff = nextAnniversary - today;
                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                
                const yearsTogether = thisYear - anniversary.getFullYear();
                const isToday = days === 0 && hours < 24;
                
                setAnniversaryData({ days, hours, minutes, yearsTogether, isToday, date: anniversary });
            }

            if (statusRes.data.success) {
                setPartner(statusRes.data.partner);
            }
            if (questionRes.data.success) {
                setDailyQuestion(questionRes.data.question);
            }
            if (loveRes.data.success) {
                setDailyLoveMessage(loveRes.data.message);
            }
            if (streakRes.data.success) {
                setStreak(streakRes.data.streak?.currentStreak || 0);
            }
            if (ritualRes.data.success) {
                setRitualStatus(ritualRes.data.status);
            }
            if (ritualStreakRes.data.success) {
                setRitualStreak(ritualStreakRes.data.streak);
            }
        } catch (err) {
            console.error("Error fetching dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Update anniversary countdown every minute
        const timer = setInterval(() => {
            if (user?.anniversaryDate) {
                const anniversary = new Date(user.anniversaryDate);
                const today = new Date();
                const thisYear = today.getFullYear();
                
                let nextAnniversary = new Date(thisYear, anniversary.getMonth(), anniversary.getDate());
                if (nextAnniversary < today) {
                    nextAnniversary = new Date(thisYear + 1, anniversary.getMonth(), anniversary.getDate());
                }
                
                const timeDiff = nextAnniversary - today;
                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                
                const yearsTogether = thisYear - anniversary.getFullYear();
                const isToday = days === 0 && hours < 24;
                
                setAnniversaryData({ days, hours, minutes, yearsTogether, isToday, date: anniversary });
            }
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleMoodUpdate = async (mood) => {
        try {
            const res = await api.post('/vibe/update-mood', { mood });
            if (res.data.success) {
                setMyMood(mood);
                const room = (user && user.partnerId) ? [user.userId, user.partnerId].sort().join("-") : (user ? user.userId : '');
                if (room) socket.emit("vibe_update", { roomId: room, type: 'mood', value: mood });
            }
        } catch (err) { console.error(err); }
    };

    const handleStatusUpdate = async () => {
        try {
            const res = await api.post('/vibe/update-status', { status: 'green', message: myStatus });
            if (res.data.success) {
                const room = (user && user.partnerId) ? [user.userId.toString(), user.partnerId.toString()].sort().join("-") : (user ? user.userId.toString() : '');
                if (room) socket.emit("vibe_update", { roomId: room, type: 'status', value: myStatus });
            }
        } catch (err) { console.error(err); }
    };

    const sendRitual = async (type) => {
        try {
            const res = await api.post('/vibe/ritual', { type });
            if (res.data.success) {
                setRitualStatus(prev => ({
                    ...prev,
                    [type]: { ...prev[type], sent: true }
                }));
                
                // Visual feedback
                const confetti = document.createElement('div');
                confetti.textContent = type === 'morning' ? '☀️' : '🌙';
                confetti.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 80px;
                    z-index: 9999;
                    animation: ritual-pop 1s ease-out forwards;
                `;
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 1000);

                const room = user.partnerId ? [user.userId.toString(), user.partnerId.toString()].sort().join("-") : user.userId.toString();
                socket.emit("vibe_update", { roomId: room, type: 'ritual', value: type });
                
                // Refresh data to get new gem count
                fetchData();
            }
        } catch (err) {
            console.error('Ritual error:', err);
        }
    };

    if (loading) return <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--accent-coral)', fontWeight: 'bold' }}>Loading Your World...</div>;

    return (
        <div className="app-container" style={{ padding: '1.5rem 1.5rem 120px 1.5rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>Hi, {user?.fullName?.split(' ')[0] || 'Love'}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome to your quiet space.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <motion.button
                        onClick={toggleTheme}
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        className="glass-card"
                        style={{
                            padding: '0.75rem',
                            borderRadius: '50%',
                            color: 'var(--accent-coral)',
                            background: theme === 'dark' ? 'rgba(255, 155, 155, 0.15)' : 'rgba(255, 255, 255, 0.6)',
                            border: theme === 'dark' ? '2px solid var(--accent-coral)' : '1px solid var(--glass-border)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {theme === 'dark' ? (
                                <motion.div
                                    key="sun"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Sun size={20} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="moon"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Moon size={20} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                    <button onClick={() => navigate('/settings')} className="glass-card" style={{ padding: '0.75rem', borderRadius: '50%', color: 'var(--text-secondary)' }}>
                        <SettingsIcon size={20} />
                    </button>
                    <button onClick={handleLogout} className="glass-card" style={{ padding: '0.75rem', borderRadius: '50%', color: 'var(--text-secondary)' }}>
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {dailyLoveMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        fontStyle: 'italic',
                        fontSize: '0.95rem',
                        color: 'var(--accent-coral)',
                        textAlign: 'center',
                        marginBottom: '2rem',
                        opacity: 0.8,
                        fontFamily: 'var(--font-serif)'
                    }}
                >
                    "{dailyLoveMessage}"
                </motion.div>
            )}

            {/* Vibe Update Section */}
            <motion.div
                className="glass-card"
                style={{ padding: '1.25rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.4)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>YOUR VIBE</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['😊', '😴', '💖', '🎬', '☕', '🏢'].map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => handleMoodUpdate(emoji)}
                                style={{ background: myMood === emoji ? '#FFF5F5' : 'none', border: myMood === emoji ? '1px solid #FF9B9B' : 'none', borderRadius: '8px', padding: '4px', fontSize: '1.2rem', cursor: 'pointer' }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="What's on your mind?"
                        value={myStatus}
                        onChange={(e) => setMyStatus(e.target.value)}
                        onBlur={handleStatusUpdate}
                        onKeyPress={(e) => e.key === 'Enter' && handleStatusUpdate()}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.8)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', outline: 'none' }}
                    />
                </div>
            </motion.div>

            {/* Couple Connectivity Card */}
            <motion.div
                className="glass-card"
                style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <AnimatePresence>
                    {partner?.statusMessage && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', padding: '8px 12px', borderRadius: '15px 15px 0 15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '0.8rem', maxWidth: '120px', zIndex: 10 }}
                        >
                            {partner.statusMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {streak > 0 && (
                    <div style={{ position: 'absolute', top: '-10px', background: 'var(--primary-gradient)', color: 'white', padding: '4px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: 'var(--soft-glow)' }}>
                        ❤️ {streak} DAY STREAK
                    </div>
                )}

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative' }}>
                    <div className="avatar-wrapper" style={{ textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', overflow: 'hidden' }}>
                            <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.fullName}`} alt="Me" />
                        </div>
                        <p style={{ marginTop: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>You</p>
                    </div>

                    <div style={{ color: 'var(--accent-coral)', animation: 'pulse 2s infinite' }}>
                        <Heart size={32} fill="var(--accent-coral)" />
                    </div>

                    <div className="avatar-wrapper" style={{ textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', overflow: 'hidden' }}>
                            {partner ? (
                                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${partner?.fullName}`} alt="Partner" />
                            ) : (
                                <div onClick={() => navigate('/link')} style={{ cursor: 'pointer', color: '#DEB3B3' }}><LinkIcon size={32} /></div>
                            )}
                        </div>
                        <p style={{ marginTop: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>{partner?.fullName?.split(' ')[0] || 'Partner'}</p>
                    </div>
                </div>

                {!partner && (
                    <button
                        onClick={() => navigate('/link')}
                        className="btn-primary"
                        style={{ marginTop: '1.5rem', padding: '10px 20px', fontSize: '0.8rem' }}
                    >
                        Invite Your Person
                    </button>
                )}
            </motion.div>

            {/* Daily Connection Prompt */}
            {dailyQuestion && (
                <motion.div
                    className="glass-card"
                    style={{
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        background: 'rgba(255, 255, 255, 0.7)',
                        borderLeft: '5px solid var(--accent-coral)'
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={16} color="var(--accent-coral)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent-coral)' }}>DAILY QUESTION</span>
                    </div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.4 }}>{dailyQuestion.question}</p>
                    <button
                        onClick={() => navigate('/chat')}
                        style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--accent-coral)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        Answer in Chat <MessageCircle size={16} />
                    </button>
                </motion.div>
            )}

            {/* Daily Ritual Buttons - NEW */}
            <motion.div
                className="glass-card"
                style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(255,248,220,0.6), rgba(255,239,213,0.6))' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Daily Ritual</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {ritualStreak > 0 ? `🔥 ${ritualStreak} day streak!` : 'Start your daily ritual streak'}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Good Morning Button */}
                    <motion.button
                        onClick={() => !ritualStatus.morning.sent && sendRitual('morning')}
                        whileHover={!ritualStatus.morning.sent ? { scale: 1.05 } : {}}
                        whileTap={!ritualStatus.morning.sent ? { scale: 0.95 } : {}}
                        disabled={ritualStatus.morning.sent}
                        style={{
                            background: ritualStatus.morning.sent ? 
                                'linear-gradient(135deg, #A8E6CF, #7ED3B2)' : 
                                'linear-gradient(135deg, #FFD93D, #FFA500)',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '1.25rem 1rem',
                            cursor: ritualStatus.morning.sent ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: ritualStatus.morning.sent ? 'none' : '0 8px 20px rgba(255,193,7,0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <Sunrise size={28} color="white" />
                        <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
                            {ritualStatus.morning.sent ? '✓ Sent' : 'Good Morning'}
                        </div>
                        {ritualStatus.morning.partnerSent && !ritualStatus.morning.sent && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ position: 'absolute', top: '8px', right: '8px', background: '#FF5252', borderRadius: '50%', width: '12px', height: '12px' }}
                            />
                        )}
                        {ritualStatus.morning.sent && ritualStatus.morning.partnerSent && (
                            <div style={{ fontSize: '0.7rem', color: 'white', opacity: 0.9 }}>
                                💚 Both sent!
                            </div>
                        )}
                    </motion.button>

                    {/* Good Night Button */}
                    <motion.button
                        onClick={() => !ritualStatus.night.sent && sendRitual('night')}
                        whileHover={!ritualStatus.night.sent ? { scale: 1.05 } : {}}
                        whileTap={!ritualStatus.night.sent ? { scale: 0.95 } : {}}
                        disabled={ritualStatus.night.sent}
                        style={{
                            background: ritualStatus.night.sent ? 
                                'linear-gradient(135deg, #A8E6CF, #7ED3B2)' : 
                                'linear-gradient(135deg, #667EEA, #764BA2)',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '1.25rem 1rem',
                            cursor: ritualStatus.night.sent ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: ritualStatus.night.sent ? 'none' : '0 8px 20px rgba(102,126,234,0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <Moon size={28} color="white" />
                        <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
                            {ritualStatus.night.sent ? '✓ Sent' : 'Good Night'}
                        </div>
                        {ritualStatus.night.partnerSent && !ritualStatus.night.sent && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ position: 'absolute', top: '8px', right: '8px', background: '#FF5252', borderRadius: '50%', width: '12px', height: '12px' }}
                            />
                        )}
                        {ritualStatus.night.sent && ritualStatus.night.partnerSent && (
                            <div style={{ fontSize: '0.7rem', color: 'white', opacity: 0.9 }}>
                                💜 Both sent!
                            </div>
                        )}
                    </motion.button>
                </div>

                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--accent-coral)', fontWeight: 600 }}>
                    +10 💎 VibeGems per ritual
                </div>
            </motion.div>

            {/* Anniversary Countdown Widget */}
            {anniversaryData && (
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        padding: '2rem',
                        marginBottom: '2.5rem',
                        background: anniversaryData.isToday ? 
                            'linear-gradient(135deg, #FF9B9B, #FFB4B4, #FFC9C9)' : 
                            'rgba(255, 255, 255, 0.4)',
                        position: 'relative',
                        overflow: 'hidden',
                        border: anniversaryData.isToday ? '2px solid #FF9B9B' : 'none'
                    }}
                >
                    {/* Confetti Animation for Today */}
                    {anniversaryData.isToday && (
                        <motion.div
                            initial={{ y: -100 }}
                            animate={{ y: 600 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                fontSize: '2rem',
                                display: 'flex',
                                justifyContent: 'space-around',
                                pointerEvents: 'none'
                            }}
                        >
                            {['🎉', '💖', '🎊', '💝', '✨'].map((emoji, i) => (
                                <motion.span
                                    key={i}
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                >
                                    {emoji}
                                </motion.span>
                            ))}
                        </motion.div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                        <motion.div
                            animate={anniversaryData.isToday ? { rotate: [0, 10, -10, 0] } : { scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'var(--primary-gradient)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'var(--soft-glow)'
                            }}
                        >
                            {anniversaryData.isToday ? <Gift size={26} color="white" /> : <Calendar size={26} color="white" />}
                        </motion.div>
                        <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                {anniversaryData.isToday ? '🎊 Happy Anniversary!' : 'Anniversary Countdown'}
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {anniversaryData.yearsTogether > 0 ? 
                                    `${anniversaryData.yearsTogether} ${anniversaryData.yearsTogether === 1 ? 'year' : 'years'} together` : 
                                    'First anniversary approaching'}
                            </p>
                        </div>
                    </div>

                    {anniversaryData.isToday ? (
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                textAlign: 'center',
                                padding: '1.5rem',
                                background: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '20px',
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💕</div>
                            <p style={{
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: 'var(--accent-coral)',
                                fontFamily: 'var(--font-serif)',
                                marginBottom: '0.5rem'
                            }}>
                                Celebrating {anniversaryData.yearsTogether > 0 ? anniversaryData.yearsTogether : ''} 
                                {anniversaryData.yearsTogether > 0 ? ` ${anniversaryData.yearsTogether === 1 ? 'Year' : 'Years'}` : 'Your Special Day'}!
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                Love grows deeper every day 💝
                            </p>
                        </motion.div>
                    ) : (
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '15px',
                                        padding: '1rem',
                                        textAlign: 'center',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-coral)', marginBottom: '0.25rem' }}>
                                        {anniversaryData.days}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        DAYS
                                    </div>
                                </motion.div>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '15px',
                                        padding: '1rem',
                                        textAlign: 'center',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-coral)', marginBottom: '0.25rem' }}>
                                        {anniversaryData.hours}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        HOURS
                                    </div>
                                </motion.div>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '15px',
                                        padding: '1rem',
                                        textAlign: 'center',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-coral)', marginBottom: '0.25rem' }}>
                                        {anniversaryData.minutes}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        MINUTES
                                    </div>
                                </motion.div>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)',
                                fontStyle: 'italic'
                            }}>
                                {new Date(anniversaryData.date).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
            
            {/* Milestones & Badges */}
            <h3 style={{ marginBottom: '1.25rem', paddingLeft: '0.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Milestones <Sparkles size={18} color="var(--accent-coral)" />
            </h3>
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', gap: '1rem', overflowX: 'auto', background: 'rgba(255,255,255,0.3)' }}>
                <Badge active={streak >= 7} label="7 Days" icon="🔥" />
                <Badge active={streak >= 30} label="1 Month" icon="💎" />
                <Badge active={streak >= 100} label="Century" icon="👑" />
                <Badge active={true} label="Early Bird" icon="✨" />
            </div>

            <h3 style={{ marginBottom: '1.25rem', paddingLeft: '0.5rem', letterSpacing: '-0.02em' }}>Your World</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ActionCard title="Mood Mirror" icon={Heart} color="#FFF0F0" onClick={() => navigate('/cinema')} />
                <ActionCard title="Memory Wall" icon={Star} color="#FFF9E5" onClick={() => navigate('/memory-wall')} />
                <ActionCard title="Wellness Sync" icon={Activity} color="#E0F7FA" onClick={() => navigate('/wellness')} />
                <ActionCard title="Play Together" icon={RefreshCcw} color="#F0F4C3" onClick={() => navigate('/games')} />
                <ActionCard title="Vibe Buddy" icon={Coffee} color="#F3E5F5" onClick={() => navigate('/pet')} />
                <ActionCard title="Dream Board" icon={Palette} color="#E8F5E9" onClick={() => navigate('/dreams')} />
                <ActionCard title="Safe Vault" icon={Mic} color="#FFF3E0" onClick={() => navigate('/vault')} />
                <ActionCard title="Time Capsule" icon={Hourglass} color="#E1F5FE" onClick={() => navigate('/time-capsule')} />
                <ActionCard title="Secret Snaps" icon={Camera} color="#FCE4EC" onClick={() => navigate('/snaps')} />
            </div>

            <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

const ActionCard = ({ title, icon: Icon, color, onClick }) => (
    <motion.div
        className="glass-card"
        whileHover={{ y: -5 }}
        onClick={onClick}
        style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
        }}
    >
        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
            <Icon size={24} />
        </div>
        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{title}</span>
    </motion.div>
);

const Badge = ({ active, label, icon }) => (
    <div style={{
        minWidth: '80px',
        textAlign: 'center',
        opacity: active ? 1 : 0.3,
        filter: active ? 'none' : 'grayscale(1)',
        transition: 'all 0.3s'
    }}>
        <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: active ? 'var(--primary-gradient)' : '#eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            margin: '0 auto 0.5rem',
            boxShadow: active ? '0 5px 15px rgba(255, 155, 155, 0.3)' : 'none'
        }}>
            {icon}
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
);

export default Dashboard;
