import { useState, useEffect } from 'react';
import api from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Plane, Home, Briefcase, Users, Star, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = {
    Travel: <Plane size={24} />,
    Home: <Home size={24} />,
    Career: <Briefcase size={24} />,
    Family: <Users size={24} />,
    Other: <Star size={24} />
};

const DreamBoard = () => {
    const [dreams, setDreams] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newDream, setNewDream] = useState({ title: '', description: '', category: 'Travel' });
    const navigate = useNavigate();

    const fetchDreams = async () => {
        try {
            const res = await api.get('/dream/all');
            if (res.data.success) setDreams(res.data.dreams);
        } catch (err) { console.error("Failed to load dreams"); }
    };

    useEffect(() => { fetchDreams(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/dream/add', newDream);
            if (res.data.success) {
                setShowForm(false);
                setNewDream({ title: '', description: '', category: 'Travel' });
                fetchDreams();
            }
        } catch (err) { console.error("Failed to add dream"); }
    };

    const toggleStatus = async (dream) => {
        const newStatus = dream.status === 'Achieved' ? 'Dreaming' : 'Achieved';
        try {
            await api.post('/dream/update', { dreamId: dream._id, status: newStatus });
            fetchDreams();
        } catch (err) { }
    };

    return (
        <div className="app-container" style={{ padding: '1.5rem 1.5rem 120px 1.5rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>Dream Board</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Our vision for the future.</p>
                </div>
            </header>

            <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary"
                style={{ width: '100%', marginBottom: '2rem', justifyContent: 'center' }}
            >
                <Plus size={20} />
                {showForm ? 'Close Dreams' : 'Manifest A Dream'}
            </button>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card"
                        style={{ padding: '2rem', marginBottom: '2.5rem' }}
                    >
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <input
                                className="vibe-input"
                                placeholder="What is the dream?"
                                value={newDream.title}
                                onChange={e => setNewDream({ ...newDream, title: e.target.value })}
                                required
                                style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)', outline: 'none' }}
                            />
                            <textarea
                                className="vibe-input"
                                placeholder="Paint the details of this vision..."
                                value={newDream.description}
                                onChange={e => setNewDream({ ...newDream, description: e.target.value })}
                                style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.5)', outline: 'none', resize: 'none' }}
                                rows="3"
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {Object.keys(categories).map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setNewDream({ ...newDream, category: c })}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            border: '1px solid var(--glass-border)',
                                            background: newDream.category === c ? 'var(--accent-coral)' : 'rgba(255,255,255,0.3)',
                                            color: newDream.category === c ? 'white' : 'var(--text-primary)',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                                <Sparkles size={18} /> Add to Board
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                {dreams.map(dream => (
                    <motion.div
                        key={dream._id}
                        className="glass-card"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toggleStatus(dream)}
                        style={{
                            padding: '1.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '1.25rem',
                            alignItems: 'center',
                            borderLeft: dream.status === 'Achieved' ? '6px solid #10b981' : '6px solid var(--accent-coral)',
                            opacity: dream.status === 'Achieved' ? 0.6 : 1
                        }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '18px',
                            background: 'rgba(255,255,255,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-coral)'
                        }}>
                            {categories[dream.category]}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', textDecoration: dream.status === 'Achieved' ? 'line-through' : 'none' }}>{dream.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dream.description}</p>
                        </div>
                        {dream.status === 'Achieved' && <CheckCircle2 size={24} color="#10b981" />}
                    </motion.div>
                ))}
                {dreams.length === 0 && !showForm && (
                    <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.4 }}>
                        <Sparkles size={48} style={{ marginBottom: '1rem' }} />
                        <p>The board is clear. Time to dream big.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DreamBoard;
