import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Mail, Lock, ArrowRight, UserPlus, LogIn, Phone, User, Calendar, Smile, Activity, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = ({ type = 'login' }) => {
    const [authMode, setAuthMode] = useState(type); // 'login', 'signup', 'forgot'
    const [forgotStep, setForgotStep] = useState('request'); // 'request', 'verify', 'reset'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        anniversaryDate: '',
        coupleNickname: '',
        favoriteActivity: '',
        code: '',
        newPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signin, signup, forgotPassword, verifyCode, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (authMode === 'login') {
                const res = await signin(formData.email, formData.password);
                if (res.success) navigate('/dashboard');
                else setError(res.message);
            } else if (authMode === 'signup') {
                // Filter out fields not needed for signup
                const { code, newPassword, ...signupData } = formData;
                if (!signupData.anniversaryDate || signupData.anniversaryDate.trim() === '') {
                    delete signupData.anniversaryDate;
                }
                const res = await signup(signupData);
                if (res.success) {
                    setAuthMode('login');
                    setError('Signup successful! Please login.');
                } else setError(res.message);
            } else if (authMode === 'forgot') {
                if (forgotStep === 'request') {
                    const res = await forgotPassword(formData.email);
                    if (res.success) setForgotStep('verify');
                    else setError(res.message);
                } else if (forgotStep === 'verify') {
                    const res = await verifyCode(formData.email, formData.code);
                    if (res.success) setForgotStep('reset');
                    else setError(res.message);
                } else if (forgotStep === 'reset') {
                    const res = await resetPassword(formData.email, formData.code, formData.newPassword);
                    if (res.success) {
                        setAuthMode('login');
                        setForgotStep('request');
                        setError('Password reset successful! Please login.');
                    } else setError(res.message);
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setError('');
        setAuthMode(authMode === 'login' ? 'signup' : 'login');
    };

    const renderInputs = () => {
        if (authMode === 'login') {
            return (
                <>
                    <Input icon={<Mail size={18} />} type="text" placeholder="Email or Phone Number" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />
                    <Input icon={<Lock size={18} />} type="password" placeholder="Password" value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} />
                </>
            );
        }

        if (authMode === 'signup') {
            return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <Input icon={<User size={18} />} type="text" placeholder="Full Name" value={formData.fullName} onChange={(v) => setFormData({ ...formData, fullName: v })} required />
                    </div>
                    <Input icon={<Mail size={18} />} type="email" placeholder="Email Address" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} required />
                    <Input icon={<Phone size={18} />} type="text" placeholder="Phone Number" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} required />
                    <Input icon={<Calendar size={18} />} type="date" placeholder="Date of Birth" value={formData.dateOfBirth} onChange={(v) => setFormData({ ...formData, dateOfBirth: v })} required label="Date of Birth" />
                    <div style={{ position: 'relative' }}>
                        <Smile size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: '15px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.5)',
                                outline: 'none',
                                fontFamily: 'inherit',
                                appearance: 'none'
                            }}
                        >
                            <option value="" disabled>Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}><hr style={{ opacity: 0.1 }} /></div>
                    <Input icon={<Heart size={18} />} type="date" placeholder="Anniversary" value={formData.anniversaryDate} onChange={(v) => setFormData({ ...formData, anniversaryDate: v })} label="Anniversary (Optional)" />
                    <Input icon={<Smile size={18} />} type="text" placeholder="Couple Nickname" value={formData.coupleNickname} onChange={(v) => setFormData({ ...formData, coupleNickname: v })} />
                    <div style={{ gridColumn: 'span 2' }}>
                        <Input icon={<Activity size={18} />} type="text" placeholder="Favorite Activity Together" value={formData.favoriteActivity} onChange={(v) => setFormData({ ...formData, favoriteActivity: v })} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <Input icon={<Lock size={18} />} type="password" placeholder="Password" value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} required />
                    </div>
                </div>
            );
        }

        if (authMode === 'forgot') {
            return (
                <>
                    {forgotStep === 'request' && (
                        <Input icon={<Mail size={18} />} type="email" placeholder="Registered Email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} required />
                    )}
                    {forgotStep === 'verify' && (
                        <>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Enter the 6-digit code sent to your email.</p>
                            <Input icon={<Key size={18} />} type="text" placeholder="Verification Code" value={formData.code} onChange={(v) => setFormData({ ...formData, code: v })} required />
                        </>
                    )}
                    {forgotStep === 'reset' && (
                        <Input icon={<Lock size={18} />} type="password" placeholder="New Password" value={formData.newPassword} onChange={(v) => setFormData({ ...formData, newPassword: v })} required />
                    )}
                </>
            );
        }
    };

    return (
        <div className="section" style={{ minHeight: '100vh', justifyContent: 'center', padding: '2rem 1rem' }}>
            <motion.div
                className="glass-card"
                style={{ width: '100%', maxWidth: authMode === 'signup' ? '550px' : '400px', padding: '2.5rem' }}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <motion.div
                        className="card-icon-wrapper"
                        style={{ width: '80px', height: '80px', borderRadius: '50%' }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Heart size={40} fill="var(--accent-coral)" color="white" />
                    </motion.div>
                </div>

                <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem', textAlign: 'center' }}>
                    {authMode === 'login' ? 'Welcome Back' : authMode === 'signup' ? 'Join Together' : 'Recover Space'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
                    {authMode === 'login' ? 'Enter your quiet space.' : authMode === 'signup' ? 'Create your private world.' : 'Get back to your loved one.'}
                </p>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                padding: '1rem',
                                background: 'rgba(255, 100, 100, 0.1)',
                                borderRadius: '12px',
                                color: '#d64545',
                                fontSize: '0.9rem',
                                marginBottom: '1.5rem',
                                border: '1px solid rgba(255, 100, 100, 0.2)'
                            }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {renderInputs()}

                    <button className="btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                        {isLoading ? 'Wait a moment...' : (
                            authMode === 'login' ? 'Enter Room' :
                                authMode === 'signup' ? 'Create Space' :
                                    forgotStep === 'request' ? 'Send Code' :
                                        forgotStep === 'verify' ? 'Verify Code' : 'Reset Password'
                        )}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    {authMode === 'login' && (
                        <button
                            onClick={() => { setAuthMode('forgot'); setError(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            Forgot password?
                        </button>
                    )}

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {authMode === 'login' ? "Don't have a space yet?" : authMode === 'signup' ? "Already have a space?" : "Remembered your password?"}
                        <button
                            onClick={() => {
                                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                setForgotStep('request');
                                setError('');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-coral)',
                                fontWeight: '600',
                                marginLeft: '0.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            {authMode === 'login' ? 'Join Now' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

const Input = ({ icon, type, placeholder, value, onChange, required, label }) => (
    <div style={{ position: 'relative', width: '100%' }}>
        {label && <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', marginLeft: '0.5rem' }}>{label}</label>}
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                {icon}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    borderRadius: '15px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255, 255, 255, 0.5)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    height: '52px'
                }}
            />
        </div>
    </div>
);

export default AuthPage;
