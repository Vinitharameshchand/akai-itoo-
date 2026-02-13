import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Camera, ArrowLeft, Heart, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const MemoryWall = () => {
    const [memories, setMemories] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newCaption, setNewCaption] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const fetchMemories = async () => {
        try {
            const res = await api.get('/memory/all');
            if (res.data.success) {
                setMemories(res.data.memories);
            }
        } catch (err) {
            console.error("Failed to load memories");
        }
    };

    useEffect(() => {
        fetchMemories();
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setNewImageUrl(''); // Clear URL input if file is selected
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddMemory = async (e) => {
        e.preventDefault();
        setUploading(true);
        
        try {
            if (selectedFile) {
                // Upload file
                const formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('caption', newCaption);
                
                const res = await api.post('/memory/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (res.data.success) {
                    setMemories([res.data.memory, ...memories]);
                    resetForm();
                }
            } else if (newImageUrl) {
                // Use URL
                const res = await api.post('/memory/add', { imageUrl: newImageUrl, caption: newCaption });
                if (res.data.success) {
                    setMemories([res.data.memory, ...memories]);
                    resetForm();
                }
            }
        } catch (err) {
            console.error("Failed to add memory", err);
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setNewImageUrl('');
        setNewCaption('');
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    return (
        <div className="app-container" style={{ padding: '1.5rem 1.5rem 120px 1.5rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>Memory Wall</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Scrapbook of our favorite moments</p>
                </div>
            </header>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card"
                        style={{ padding: '2rem', marginBottom: '2rem' }}
                    >
                        <form onSubmit={handleAddMemory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem' }}>Capture a Moment</h3>
                                <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', color: '#AAA', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            {/* Image Preview */}
                            {previewUrl && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        width: '100%',
                                        height: '250px',
                                        borderRadius: '15px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        background: 'rgba(255,255,255,0.8)'
                                    }}
                                >
                                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <motion.button
                                        type="button"
                                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <X size={18} />
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* File Upload Button */}
                            {!selectedFile && (
                                <label
                                    htmlFor="image-upload"
                                    style={{
                                        padding: '2rem',
                                        borderRadius: '15px',
                                        border: '2px dashed var(--accent-coral)',
                                        background: 'rgba(255, 155, 155, 0.05)',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 155, 155, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 155, 155, 0.05)'}
                                >
                                    <Camera size={36} color="var(--accent-coral)" />
                                    <div>
                                        <p style={{ fontWeight: 600, color: 'var(--accent-coral)', marginBottom: '0.25rem' }}>
                                            Upload Photo
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            Click to browse or drag & drop
                                        </p>
                                    </div>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            )}

                            {/* Divider */}
                            {!selectedFile && (
                                <div style={{ textAlign: 'center', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.1)', zIndex: 0 }}></div>
                                    <span style={{ background: 'var(--glass-bg)', padding: '0 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', position: 'relative', zIndex: 1 }}>
                                        OR PASTE URL
                                    </span>
                                </div>
                            )}

                            {/* URL Input (only show if no file selected) */}
                            {!selectedFile && (
                                <input
                                    type="url"
                                    placeholder="Image URL (Pinterest, Unsplash, etc.)"
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '15px',
                                        border: '1px solid var(--glass-border)',
                                        background: 'rgba(255,255,255,0.5)',
                                        outline: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            )}

                            <input
                                type="text"
                                placeholder="Write a little note..."
                                value={newCaption}
                                onChange={(e) => setNewCaption(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '15px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.5)',
                                    outline: 'none'
                                }}
                            />
                            
                            <button
                                type="submit"
                                disabled={uploading || (!selectedFile && !newImageUrl)}
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    opacity: uploading || (!selectedFile && !newImageUrl) ? 0.6 : 1,
                                    cursor: uploading || (!selectedFile && !newImageUrl) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {uploading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Camera size={18} />
                                        </motion.div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Heart size={18} />
                                        Save Memory
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {memories.map((memory) => (
                    <motion.div
                        key={memory._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card"
                        style={{ overflow: 'hidden', padding: '0.5rem' }}
                    >
                        <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '15px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                            <img src={memory.imageUrl} alt={memory.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '0.5rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>{memory.caption || "A sweet moment..."}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(memory.createdAt).toLocaleDateString()}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {memories.length === 0 && !isAdding && (
                <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.4 }}>
                    <Camera size={48} style={{ marginBottom: '1rem' }} />
                    <p>No memories yet. Add your first one!</p>
                </div>
            )}

            {/* Floating Add Button */}
            {!isAdding && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsAdding(true)}
                    style={{
                        position: 'fixed',
                        bottom: '100px',
                        right: '20px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'var(--primary-gradient)',
                        border: 'none',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--soft-glow)',
                        cursor: 'pointer',
                        zIndex: 100
                    }}
                >
                    <Plus size={32} />
                </motion.button>
            )}
        </div>
    );
};

export default MemoryWall;
