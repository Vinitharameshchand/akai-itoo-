import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as LinkIcon, Copy, Check, UserPlus, Heart, QrCode, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/client';

const PartnerLink = () => {
    const { user, setUser } = useAuth();
    const [inviteCode, setInviteCode] = useState('');
    const [myCode, setMyCode] = useState(user?.inviteCode || '');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [copied, setCopied] = useState(false);
    const [loadingCode, setLoadingCode] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);

    const generateMyCode = async () => {
        setLoadingCode(true);
        try {
            const res = await api.get('/couple/get-invite-code');
            if (res.data.success) {
                setMyCode(res.data.inviteCode);
                setStatus({ type: 'success', msg: 'Invite code generated!' });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to generate code.';
            setStatus({ type: 'error', msg: errorMsg });
        } finally {
            setLoadingCode(false);
        }
    };

    const handleLink = async (e) => {
        e.preventDefault();
        if (!inviteCode) return;
        setStatus({ type: 'info', msg: 'Connecting...' });
        try {
            const res = await api.post('/couple/accept-invite', { inviteCode });
            if (res.data.success) {
                setStatus({ type: 'success', msg: 'Connected successfully! Welcome to your shared space.' });
                // Refresh profile to update partnerId
                const profileRes = await api.get('/auth/profile');
                if (profileRes.data.success) {
                    setUser(profileRes.data.user);
                    // Redirect or refresh happened naturally via state update in App.jsx usually
                }
            } else {
                setStatus({ type: 'error', msg: res.data.message });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Invalid invite code.' });
        }
    };

    const copyCode = () => {
        if (!myCode) return;
        navigator.clipboard.writeText(myCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="section" style={{ minHeight: '100vh', paddingBottom: '120px' }}>
            <motion.div
                className="glass-card"
                style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div className="card-icon-wrapper">
                        <LinkIcon size={32} />
                    </div>
                </div>

                <h2 style={{ marginBottom: '0.5rem' }}>Link Your Partner</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Connect with your favorite person to start your journey together.
                </p>

                {status.msg && (
                    <div style={{
                        padding: '1rem',
                        background: status.type === 'error' ? 'rgba(255,100,100,0.1)' : 'rgba(100,255,100,0.1)',
                        borderRadius: '12px',
                        color: status.type === 'error' ? '#d64545' : '#2e7d32',
                        fontSize: '0.85rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        {status.msg}
                    </div>
                )}

                {/* Section 1: Your Code */}
                <div className="glass-card" style={{
                    padding: '1.2rem',
                    marginBottom: '2rem',
                    textAlign: 'left',
                    background: 'rgba(255,255,255,0.4)',
                    border: '1px dashed var(--accent-coral)'
                }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Your Invite Code
                    </p>
                    {myCode ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <code style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-coral)', letterSpacing: '0.1em' }}>{myCode}</code>
                                <button onClick={copyCode} className="icon-btn" style={{ color: 'var(--accent-coral)' }}>
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                            <motion.button
                                onClick={() => {
                                    if (!myCode) {
                                        setStatus({ type: 'error', msg: 'Please generate an invite code first!' });
                                        return;
                                    }
                                    console.log('Opening QR modal with code:', myCode);
                                    setShowQRModal(true);
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '12px',
                                    background: 'var(--primary-gradient)',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    boxShadow: 'var(--soft-glow)'
                                }}
                            >
                                <QrCode size={20} />
                                Show QR Code
                            </motion.button>
                        </>
                    ) : (
                        <button
                            onClick={generateMyCode}
                            disabled={loadingCode}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                borderRadius: '12px',
                                border: '1px solid var(--accent-coral)',
                                background: 'transparent',
                                color: 'var(--accent-coral)',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {loadingCode ? 'Generating...' : 'Generate New Code'}
                        </button>
                    )}
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.6rem' }}>
                        Share this code with your partner.
                    </p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.1)', zIndex: 0 }}></div>
                    <span style={{ background: 'var(--glass-bg)', padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', position: 'relative', zIndex: 1 }}>
                        OR
                    </span>
                </div>

                {/* Section 2: Join Partner */}
                <form onSubmit={handleLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '0.5rem', marginBottom: '0.4rem', display: 'block' }}>
                            ENTER PARTNER'S CODE
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. A1B2C3D4"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '15px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.6)',
                                outline: 'none',
                                fontFamily: 'monospace',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                textAlign: 'center',
                                letterSpacing: '0.1em'
                            }}
                        />
                    </div>
                    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.1rem' }}>
                        <UserPlus size={18} />
                        Connect to Partner
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <Heart size={24} fill="#FFB4B4" color="#FFB4B4" style={{ opacity: 0.5 }} />
                </div>
            </motion.div>

            {/* QR Code Modal */}
            <AnimatePresence>
                {showQRModal && myCode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowQRModal(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                            padding: '1.5rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{
                                background: 'white',
                                padding: '2.5rem',
                                borderRadius: '30px',
                                maxWidth: '400px',
                                width: '100%',
                                textAlign: 'center',
                                position: 'relative',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                            }}
                        >
                            <motion.button
                                onClick={() => setShowQRModal(false)}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'rgba(255, 155, 155, 0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--accent-coral)'
                                }}
                            >
                                <X size={20} />
                            </motion.button>

                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ marginBottom: '1.5rem' }}
                            >
                                <QrCode size={48} color="var(--accent-coral)" />
                            </motion.div>

                            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                Scan to Connect
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Your partner can scan this QR code to instantly link
                            </p>

                            <motion.div
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '20px',
                                    boxShadow: '0 8px 30px rgba(255, 155, 155, 0.2)',
                                    marginBottom: '1.5rem',
                                    border: '3px solid #FF9B9B',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                {myCode ? (
                                    <div style={{ position: 'relative' }}>
                                        <QRCodeSVG
                                            value={myCode}
                                            size={200}
                                            bgColor="#ffffff"
                                            fgColor="#FF9B9B"
                                            level="H"
                                            includeMargin={true}
                                            imageSettings={{
                                                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FF9B9B'%3E%3Cpath d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'%3E%3C/path%3E%3C/svg%3E",
                                                height: 30,
                                                width: 30,
                                                excavate: true
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '10px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: 'rgba(255, 155, 155, 0.9)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '10px',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                        }}>
                                            ❤️
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                        <QrCode size={80} color="var(--text-secondary)" />
                                        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>No invite code available</p>
                                    </div>
                                )}
                            </motion.div>

                            <div style={{
                                background: 'rgba(255, 155, 155, 0.1)',
                                padding: '1rem',
                                borderRadius: '15px',
                                marginBottom: '1rem'
                            }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                                    YOUR CODE
                                </p>
                                <code style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-coral)', letterSpacing: '0.15em' }}>
                                    {myCode}
                                </code>
                            </div>

                            <button
                                onClick={copyCode}
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {copied ? (
                                    <>
                                        <Check size={18} />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={18} />
                                        Copy Code
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PartnerLink;
