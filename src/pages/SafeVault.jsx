import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Shield, AlertTriangle, DollarSign, Heart, MessageSquare, ArrowLeft, Plus, X, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const topicIcons = {
    fantasy: <Heart size={20} />,
    financial: <DollarSign size={20} />,
    grievance: <AlertTriangle size={20} />,
    other: <MessageSquare size={20} />
};

const topicColors = {
    fantasy: '#FFB4B4',
    financial: '#81C784',
    grievance: '#FFB74D',
    other: '#9575CD'
};

const SafeVault = () => {
    const [entries, setEntries] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newEntry, setNewEntry] = useState({ topic: 'other', title: '', content: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchEntries = async () => {
        try {
            const res = await api.get('/vault/entries');
            if (res.data.success) {
                setEntries(res.data.entries);
            }
        } catch (err) {
            console.error("Failed to fetch vault entries");
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const handleCreate = async () => {
        if (!newEntry.title || !newEntry.content) return;
        setLoading(true);
        try {
            const res = await api.post('/vault/create', newEntry);
            if (res.data.success) {
                setShowCreate(false);
                setNewEntry({ topic: 'other', title: '', content: '' });
                fetchEntries();
            }
        } catch (err) {
            console.error("Failed to create entry");
        } finally {
            setLoading(false);
        }
    };

    const handleConsent = async (entryId) => {
        try {
            const res = await api.post('/vault/consent', { entryId });
            if (res.data.success) fetchEntries();
        } catch (err) { console.error("Failed to give consent"); }
    };

    const handleRevoke = async (entryId) => {
        try {
            const res = await api.post('/vault/revoke', { entryId });
            if (res.data.success) fetchEntries();
        } catch (err) { console.error("Failed to revoke consent"); }
    };

    return (
        <div className="app-container night-theme" style={{ padding: '1.5rem 1.5rem 120px 1.5rem', minHeight: '100vh' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>Safe Vault</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The Two-Keys Protocol.</p>
                </div>
            </header>

            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.2)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Shield size={32} color="var(--accent-coral)" />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Sensitive thoughts stay locked until <strong>both of you</strong> provide your keys to reveal them.
                </p>
            </div>

            <button onClick={() => setShowCreate(!showCreate)} className="btn-secondary" style={{ width: '100%', marginBottom: '2rem', justifyContent: 'center' }}>
                {showCreate ? <X size={18} /> : <Plus size={18} />}
                {showCreate ? 'Close Vault' : 'New Sensitive Entry'}
            </button>

            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <select
                                value={newEntry.topic}
                                onChange={(e) => setNewEntry({ ...newEntry, topic: e.target.value })}
                                style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)', outline: 'none' }}
                            >
                                <option value="other">Topic: Other</option>
                                <option value="fantasy">Topic: Fantasy/Desire</option>
                                <option value="financial">Topic: Financial</option>
                                <option value="grievance">Topic: Grievance</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Title (e.g., House Plans, Secret Wish)"
                                value={newEntry.title}
                                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                                style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)', outline: 'none' }}
                            />
                            <textarea
                                placeholder="What remains hidden? (Encrypted content)"
                                value={newEntry.content}
                                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                                rows={5}
                                style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)', outline: 'none', resize: 'none' }}
                            />
                            <button onClick={handleCreate} className="btn-primary" style={{ justifyContent: 'center' }} disabled={loading}>
                                {loading ? 'Sealing...' : 'Seal in Vault'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {entries.map(entry => (
                    <motion.div
                        key={entry._id}
                        className="glass-card"
                        style={{ padding: '1.5rem', borderLeft: `6px solid ${topicColors[entry.topic]}` }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: topicColors[entry.topic] }}>
                                    {topicIcons[entry.topic]}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem' }}>{entry.title}</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>By {entry.isCreator ? 'You' : 'Partner'}</p>
                                </div>
                            </div>
                            {entry.isRevealed ? <Unlock size={20} color="#10b981" /> : <Lock size={20} color="#DEB3B3" />}
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.3)', padding: '1.25rem', borderRadius: '15px', marginBottom: '1.5rem', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {entry.isRevealed ? (
                                <p style={{ fontStyle: 'italic', lineHeight: '1.6' }}>"{entry.content}"</p>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#AAA' }}>
                                    <Key size={24} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                                    <p style={{ fontSize: '0.85rem' }}>Both must agree to open this heart.</p>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                <span style={{ color: entry.myConsent ? '#10b981' : '#AAA' }}>{entry.myConsent ? '✓ MY KEY' : '○ MY KEY'}</span>
                                <span style={{ color: entry.partnerConsent ? '#10b981' : '#AAA' }}>{entry.partnerConsent ? '✓ PARTNER KEY' : '○ PARTNER KEY'}</span>
                            </div>

                            {!entry.isRevealed && (
                                <button
                                    onClick={() => entry.myConsent ? handleRevoke(entry._id) : handleConsent(entry._id)}
                                    style={{
                                        background: entry.myConsent ? 'rgba(255,100,100,0.1)' : 'var(--accent-coral)',
                                        color: entry.myConsent ? '#d64545' : 'white',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '10px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {entry.myConsent ? 'Withdraw' : 'Insert Key'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
                {entries.length === 0 && !showCreate && (
                    <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.4 }}>
                        <Shield size={48} style={{ marginBottom: '1rem' }} />
                        <p>The vault is untouched.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SafeVault;
