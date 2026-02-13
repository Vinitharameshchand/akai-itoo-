import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Send, Trash2, Clock, Image as ImageIcon, ArrowLeft, Eye, Upload, X, SwitchCamera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const SnapCenter = () => {
    const [inbox, setInbox] = useState([]);
    const [viewingSnap, setViewingSnap] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [sending, setSending] = useState(false);
    const [preview, setPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [cameraMode, setCameraMode] = useState(false);
    const [stream, setStream] = useState(null);
    const [facingMode, setFacingMode] = useState('user'); // 'user' for selfie, 'environment' for back camera
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const navigate = useNavigate();

    const fetchInbox = async () => {
        try {
            const res = await api.get('/snaps/inbox');
            if (res.data.success) {
                setInbox(res.data.snaps);
            }
        } catch (err) {
            console.error("Failed to fetch snaps", err);
        }
    };

    useEffect(() => {
        fetchInbox();
        const interval = setInterval(fetchInbox, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Cleanup camera stream on unmount or when camera mode changes
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraMode(true);
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Unable to access camera. Please grant camera permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraMode(false);
    };

    const switchCamera = async () => {
        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacingMode);
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacingMode },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Error switching camera:', err);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob((blob) => {
                const file = new File([blob], `snap-${Date.now()}.jpg`, { type: 'image/jpeg' });
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
                stopCamera();
            }, 'image/jpeg', 0.9);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if (!selectedFile) return;
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const res = await api.post('/snaps/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                setPreview(null);
                setSelectedFile(null);
                fetchInbox();
            }
        } catch (err) {
            console.error("Failed to send snap", err);
        } finally {
            setSending(false);
        }
    };

    const cancelPreview = () => {
        setPreview(null);
        setSelectedFile(null);
    };

    const handleView = async (snap) => {
        try {
            const res = await api.put(`/snaps/view/${snap._id}`);
            if (res.data.success) {
                setViewingSnap(res.data.snap);
                setTimeLeft(10);
                const timer = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
                setTimeout(() => {
                    setViewingSnap(null);
                    fetchInbox();
                }, 10000);
            }
        } catch (err) {
            console.error("Failed to view snap", err);
        }
    };

    return (
        <div className="app-container" style={{ padding: '1.5rem 1.5rem 120px 1.5rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>Snap Center</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Moments that fade like a whisper.</p>
                </div>
            </header>

            {/* Camera Mode Modal */}
            <AnimatePresence>
                {cameraMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.95)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{
                                flex: 1,
                                width: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        
                        {/* Camera Controls */}
                        <div style={{
                            position: 'absolute',
                            top: '1.5rem',
                            left: '1.5rem',
                            right: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={stopCamera}
                                style={{
                                    background: 'rgba(0,0,0,0.5)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '44px',
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <X size={24} color="white" />
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={switchCamera}
                                style={{
                                    background: 'rgba(0,0,0,0.5)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '44px',
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <SwitchCamera size={24} color="white" />
                            </motion.button>
                        </div>

                        {/* Capture Button */}
                        <div style={{
                            position: 'absolute',
                            bottom: '3rem',
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={capturePhoto}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    border: '6px solid rgba(255, 155, 155, 0.8)',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(255, 155, 155, 0.5)'
                                }}
                            />
                        </div>

                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview & Send Section */}
            <AnimatePresence>
                {preview && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="glass-card"
                        style={{
                            padding: '2rem',
                            marginBottom: '2.5rem',
                            position: 'relative'
                        }}
                    >
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Ready to Send</h3>
                        
                        <div style={{
                            width: '100%',
                            height: '300px',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            marginBottom: '1.5rem',
                            position: 'relative'
                        }}>
                            <img
                                src={preview}
                                alt="Preview"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={cancelPreview}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'rgba(0,0,0,0.6)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white'
                                }}
                            >
                                <X size={20} />
                            </motion.button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={cancelPreview}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '15px',
                                    border: '2px solid var(--glass-border)',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Trash2 size={18} />
                                Discard
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSend}
                                disabled={sending}
                                className="btn-primary"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    opacity: sending ? 0.6 : 1,
                                    cursor: sending ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {sending ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Send size={18} />
                                        </motion.div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Snap
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Capture Options (shown when no preview) */}
            {!preview && (
                <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', textAlign: 'center' }}>
                        Capture a Moment
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Camera Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startCamera}
                            style={{
                                padding: '2rem 1rem',
                                borderRadius: '20px',
                                background: 'var(--primary-gradient)',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.75rem',
                                boxShadow: 'var(--soft-glow)'
                            }}
                        >
                            <Camera size={36} />
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Camera</p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.9, marginTop: '0.25rem' }}>
                                    Take a photo
                                </p>
                            </div>
                        </motion.button>

                        {/* Upload Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                padding: '2rem 1rem',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #667EEA, #764BA2)',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 8px 20px rgba(102,126,234,0.3)'
                            }}
                        >
                            <Upload size={36} />
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Upload</p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.9, marginTop: '0.25rem' }}>
                                    From gallery
                                </p>
                            </div>
                        </motion.button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
            )}

            <h3 style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>Your Inbox</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {inbox.map(snap => (
                    <motion.div
                        key={snap._id}
                        className="glass-card"
                        style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.3)' }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <ImageIcon size={20} />
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Unopened Snap</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(snap.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        <button onClick={() => handleView(snap)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                            View <Eye size={16} />
                        </button>
                    </motion.div>
                ))}
                {inbox.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.4 }}>
                        <Clock size={40} style={{ marginBottom: '1rem' }} />
                        <p>No new snapshots waiting.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {viewingSnap && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
                            {timeLeft}s
                        </div>
                        <img src={viewingSnap.imageUrl} alt="Snap" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        <div style={{ position: 'absolute', bottom: '3rem', width: '100%', textAlign: 'center', color: 'white', opacity: 0.6, fontSize: '0.8rem', letterSpacing: '2px' }}>
                            VANISHING SOON
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SnapCenter;
