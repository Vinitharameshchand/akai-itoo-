import { useState, useEffect, memo, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Handshake, Disc, ArrowRight, Sparkles, MessageCircle, Star, Moon, Play, Shield, Zap, Camera, Music, Gift, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { sendWaitlistEmail } from '../lib/email'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../App.css'

gsap.registerPlugin(ScrollTrigger);

// Import assets - using existing background images
const heroImg = '/assets/backgrounds/hug.jpg';
const noodlesImg = '/assets/backgrounds/noodles.jpg';
const dinnerImg = '/assets/backgrounds/dinner.jpg';
const trainImg = '/assets/backgrounds/train.jpg';
const movieImg = '/assets/backgrounds/movie.jpg';
const gameImg = '/assets/backgrounds/game.jpeg';

// Responsive hook with debounce for performance
const useWindowSize = () => {
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    useEffect(() => {
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setSize({ width: window.innerWidth, height: window.innerHeight });
            }, 150);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    return size;
};

// Magnetic button effect hook
const useMagneticEffect = (ref) => {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(element, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [ref]);
};

// Animated background gradient orbs
const GradientOrbs = memo(({ isDesktop }) => (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <motion.div
            style={{
                position: 'absolute',
                width: isDesktop ? '600px' : '400px',
                height: isDesktop ? '600px' : '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,155,155,0.25) 0%, transparent 70%)',
                top: '-100px',
                right: isDesktop ? '10%' : '-100px',
                filter: 'blur(60px)'
            }}
            animate={{
                scale: [1, 1.2, 1],
                x: [0, 30, 0],
                y: [0, 20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
            style={{
                position: 'absolute',
                width: isDesktop ? '500px' : '300px',
                height: isDesktop ? '500px' : '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,180,180,0.2) 0%, transparent 70%)',
                bottom: '20%',
                left: isDesktop ? '5%' : '-50px',
                filter: 'blur(60px)'
            }}
            animate={{
                scale: [1, 1.3, 1],
                x: [0, -20, 0],
                y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        {isDesktop && (
            <motion.div
                style={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,200,200,0.15) 0%, transparent 70%)',
                    top: '40%',
                    left: '50%',
                    filter: 'blur(60px)'
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
        )}
    </div>
));

// Floating elements
const FloatingElements = memo(({ isDesktop }) => {
    const elements = useMemo(() => isDesktop ? [
        { icon: '💕', size: 28, x: 5, delay: 0 },
        { icon: '✨', size: 24, x: 15, delay: 2 },
        { icon: '🌙', size: 26, x: 25, delay: 4 },
        { icon: '💫', size: 22, x: 40, delay: 1 },
        { icon: '🌸', size: 24, x: 60, delay: 3 },
        { icon: '💕', size: 26, x: 75, delay: 5 },
        { icon: '✨', size: 22, x: 85, delay: 2.5 },
        { icon: '🌙', size: 28, x: 95, delay: 1.5 },
    ] : [
        { icon: '💕', size: 24, x: 10, delay: 0 },
        { icon: '✨', size: 20, x: 85, delay: 2 },
        { icon: '🌙', size: 22, x: 50, delay: 4 },
        { icon: '💫', size: 18, x: 30, delay: 1 },
        { icon: '🌸', size: 20, x: 70, delay: 3 },
    ], [isDesktop]);

    return (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
            {elements.map((el, i) => (
                <motion.div
                    key={i}
                    initial={{ y: '110vh', x: `${el.x}vw`, opacity: 0 }}
                    animate={{ y: '-10vh', opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 15, repeat: Infinity, delay: el.delay, ease: 'linear' }}
                    style={{ position: 'absolute', fontSize: el.size }}
                >
                    {el.icon}
                </motion.div>
            ))}
        </div>
    );
});

// Hero image carousel
const ImageCarousel = memo(({ isDesktop }) => {
    const images = useMemo(() => [heroImg, dinnerImg, noodlesImg, trainImg], []);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [images]);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: isDesktop ? '500px' : '380px',
            margin: '0 auto'
        }}>
            {/* Decorative frame */}
            <motion.div
                style={{
                    position: 'absolute',
                    inset: '-15px',
                    border: '2px solid rgba(255, 155, 155, 0.3)',
                    borderRadius: '40px',
                    zIndex: 0,
                    willChange: 'transform'
                }}
                animate={{ rotate: [0, 1, 0, -1, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
            />

            {/* Glow effect */}
            <motion.div
                style={{
                    position: 'absolute',
                    inset: '-30px',
                    background: 'radial-gradient(circle, rgba(255,155,155,0.4) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(30px)',
                    zIndex: 0
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            <div style={{
                position: 'relative',
                width: '100%',
                height: isDesktop ? '400px' : '320px',
                borderRadius: '30px',
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(135, 31, 58, 0.25)',
                border: '4px solid rgba(255, 255, 255, 0.6)'
            }}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={current}
                        src={images[current]}
                        alt="Romantic moment"
                        loading="lazy"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8 }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </AnimatePresence>

                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                    pointerEvents: 'none'
                }} />

                <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px'
                }}>
                    {images.map((_, i) => (
                        <motion.div
                            key={i}
                            style={{
                                width: current === i ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: current === i ? '#FF9B9B' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer'
                            }}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setCurrent(i)}
                            layout
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

// Feature card with icon
const FeatureCard = memo(({ icon: Icon, title, description, delay, gradient, isDesktop }) => (
    <motion.div
        className="feature-card-gsap"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        transition={{ delay, duration: 0.6 }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(255, 155, 155, 0.2)' }}
        style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: isDesktop ? '2rem' : '1.75rem',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            willChange: 'transform'
        }}
    >
        <motion.div
            style={{
                width: isDesktop ? '64px' : '56px',
                height: isDesktop ? '64px' : '56px',
                borderRadius: '16px',
                background: gradient || 'linear-gradient(135deg, #FF9B9B, #FFB4B4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 8px 20px rgba(255, 155, 155, 0.3)',
                willChange: 'transform'
            }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
        >
            <Icon size={isDesktop ? 30 : 26} color="white" />
        </motion.div>
        <h3 style={{ fontSize: isDesktop ? '1.25rem' : '1.15rem', fontWeight: 600, marginBottom: '0.5rem', color: '#4A3A3A' }}>{title}</h3>
        <p style={{ fontSize: isDesktop ? '1rem' : '0.9rem', color: '#7A6A6A', lineHeight: 1.5 }}>{description}</p>
    </motion.div>
));

// Pricing/Benefit card for desktop
const BenefitCard = memo(({ icon: Icon, title, items }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            flex: 1
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF9B9B, #FF7B7B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={24} color="white" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#4A3A3A' }}>{title}</h3>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem', color: '#5A4A4A' }}>
                    <Check size={18} color="#FF9B9B" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </motion.div>
));

const WaitlistModal = memo(({ isOpen, onClose, isDesktop }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // 1. Save to Supabase
            const { error: dbError } = await supabase
                .from('waitlist')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    timestamp: new Date().toISOString()
                }]);

            if (dbError) {
                if (dbError.code === '23505') { // Unique constraint violation (if email is unique)
                    throw new Error('You are already on the waitlist! 💕');
                }
                throw dbError;
            }

            // 2. Send Email in background (don't await to keep UI fast)
            sendWaitlistEmail(formData).catch(err => console.error('Email background error:', err));

            setStatus({ type: 'success', message: 'You have been added to the waitlist! 💕' });
            setTimeout(() => {
                onClose();
                setFormData({ name: '', email: '', phone: '' });
                setStatus({ type: '', message: '' });
            }, 1500);
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.message || 'Something went wrong. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: isDesktop ? '8vh 1.5rem' : '4vh 1.5rem',
                    overflowY: 'auto'
                }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'transparent'
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{
                            position: 'relative',
                            background: 'white',
                            borderRadius: '32px',
                            width: '100%',
                            maxWidth: '450px',
                            padding: isDesktop ? '3rem' : '2rem',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                            zIndex: 1001
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                border: 'none',
                                background: 'rgba(0,0,0,0.05)',
                                borderRadius: '50%',
                                padding: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={20} color="#666" />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #FF9B9B, #FF7B7B)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                boxShadow: '0 10px 20px rgba(255,155,155,0.3)'
                            }}>
                                <Heart size={32} color="white" fill="white" />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', color: '#4A3A3A', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Join the Waitlist</h2>
                            <p style={{ color: '#7A6A6A' }}>Be the first to know when we launch.</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#4A3A3A', fontWeight: 500, marginLeft: '4px' }}>Full Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{
                                        padding: '1rem 1.25rem',
                                        borderRadius: '16px',
                                        border: '1.5px solid #EEE',
                                        outline: 'none',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#4A3A3A', fontWeight: 500, marginLeft: '4px' }}>Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{
                                        padding: '1rem 1.25rem',
                                        borderRadius: '16px',
                                        border: '1.5px solid #EEE',
                                        outline: 'none',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#4A3A3A', fontWeight: 500, marginLeft: '4px' }}>Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{
                                        padding: '1rem 1.25rem',
                                        borderRadius: '16px',
                                        border: '1.5px solid #EEE',
                                        outline: 'none',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </div>

                            {status.message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                        textAlign: 'center',
                                        background: status.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                                        color: status.type === 'success' ? '#059669' : '#DC2626',
                                        border: `1px solid ${status.type === 'success' ? '#A7F3D0' : '#FECACA'}`
                                    }}
                                >
                                    {status.message}
                                </motion.div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading}
                                type="submit"
                                style={{
                                    marginTop: '1rem',
                                    padding: '1.1rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #FF9B9B, #FF7B7B)',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 10px 20px rgba(255,155,155,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    opacity: loading ? 0.8 : 1
                                }}
                                animate={loading ? { scale: [1, 1.02, 1] } : {}}
                                transition={loading ? { duration: 1, repeat: Infinity } : { duration: 0.3 }}
                            >
                                {loading ? 'Joining the Waitlist...' : 'Get Early Access'}
                                {!loading && <ArrowRight size={20} />}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
});

function LandingPage() {
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const isDesktop = width >= 768;
    const isLargeDesktop = width >= 1200;
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

    // Refs for GSAP animations
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const ctaRef = useRef(null);
    const featuresRef = useRef(null);
    const galleryRef = useRef(null);
    const primaryButtonRef = useRef(null);
    const secondaryButtonRef = useRef(null);

    // Apply magnetic effect to buttons
    useMagneticEffect(primaryButtonRef);
    useMagneticEffect(secondaryButtonRef);

    // Preload critical images for faster carousel experience
    useEffect(() => {
        const imagesToPreload = [heroImg, dinnerImg, noodlesImg, trainImg];
        imagesToPreload.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    // GSAP Hero entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero title animation with split effect
            const titleLines = titleRef.current?.querySelectorAll('span');
            if (titleLines) {
                gsap.from(titleLines, {
                    duration: 1.2,
                    y: 100,
                    opacity: 0,
                    stagger: 0.2,
                    ease: 'power4.out',
                    delay: 0.3
                });
            }

            // Subtitle fade in
            gsap.from(subtitleRef.current, {
                duration: 1,
                y: 50,
                opacity: 0,
                ease: 'power3.out',
                delay: 0.8
            });

            // CTA buttons pop in
            gsap.from(ctaRef.current?.children || [], {
                duration: 0.8,
                scale: 0.8,
                opacity: 0,
                stagger: 0.15,
                ease: 'back.out(1.7)',
                delay: 1.2
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    // GSAP ScrollTrigger for features section
    useEffect(() => {
        const ctx = gsap.context(() => {
            const featureCards = featuresRef.current?.querySelectorAll('.feature-card-gsap');
            if (featureCards) {
                featureCards.forEach((card, i) => {
                    gsap.from(card, {
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                            end: 'top 20%',
                            toggleActions: 'play none none reverse'
                        },
                        y: 80,
                        opacity: 0,
                        duration: 1,
                        ease: 'power3.out',
                        delay: i * 0.1
                    });

                    // Parallax effect on scroll
                    gsap.to(card, {
                        scrollTrigger: {
                            trigger: card,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1
                        },
                        y: -30
                    });
                });
            }

            // Gallery images stagger animation
            const galleryItems = galleryRef.current?.querySelectorAll('.gallery-item-gsap');
            if (galleryItems) {
                gsap.from(galleryItems, {
                    scrollTrigger: {
                        trigger: galleryRef.current,
                        start: 'top 80%'
                    },
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'back.out(1.4)'
                });
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <>
            <motion.div
                className="app-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    overflow: 'hidden',
                    maxWidth: isLargeDesktop ? '1400px' : '100%',
                    margin: '0 auto'
                }}
            >
                {/* Wrap main content to hide background and animations when modal is open */}
                <div aria-hidden={isWaitlistOpen}>
                    <GradientOrbs isDesktop={isDesktop} />
                    <FloatingElements isDesktop={isDesktop} />

                    {/* Hero Section */}
                    <motion.section
                        ref={heroRef}
                        style={{
                            minHeight: '100vh',
                            display: 'flex',
                            flexDirection: isDesktop ? 'row' : 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: isDesktop ? '2rem 4rem' : '2rem 1.5rem',
                            position: 'relative',
                            zIndex: 2,
                            gap: isDesktop ? '4rem' : '2rem'
                        }}
                    >
                        {/* Left side - Text content */}
                        <motion.div
                            style={{
                                flex: 1,
                                textAlign: isDesktop ? 'left' : 'center',
                                maxWidth: isDesktop ? '550px' : '100%',
                                order: isDesktop ? 1 : 2
                            }}
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{
                                    background: 'rgba(255, 155, 155, 0.15)',
                                    border: '1px solid rgba(255, 155, 155, 0.3)',
                                    borderRadius: '50px',
                                    padding: '10px 24px',
                                    marginBottom: '1.5rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Sparkles size={18} color="#FF9B9B" />
                                <span style={{ fontSize: '0.9rem', color: '#FF9B9B', fontWeight: 500 }}>For couples who want more</span>
                            </motion.div>

                            {/* Title */}
                            <h1
                                ref={titleRef}
                                style={{
                                    fontSize: isLargeDesktop ? '4rem' : isDesktop ? '3.5rem' : '3rem',
                                    fontFamily: 'var(--font-serif)',
                                    marginBottom: '1.5rem',
                                    lineHeight: 1.1,
                                    overflow: 'hidden'
                                }}
                            >
                                <span style={{ color: '#4A3A3A', display: 'inline-block' }}>Love,</span><br />
                                <span style={{
                                    background: 'linear-gradient(135deg, #FF9B9B, #FF7B7B)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    display: 'inline-block'
                                }}>
                                    but designed.
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p
                                ref={subtitleRef}
                                style={{
                                    fontSize: isDesktop ? '1.25rem' : '1.1rem',
                                    color: '#7A6A6A',
                                    maxWidth: isDesktop ? '450px' : '320px',
                                    marginBottom: '2rem',
                                    lineHeight: 1.6,
                                    margin: isDesktop ? '0 0 2rem 0' : '0 auto 2rem auto'
                                }}
                            >
                                A private space where your relationship grows, breathes, and thrives. Create memories, share moments, and stay connected. ✨
                            </p>

                            {/* CTA Buttons */}
                            <div
                                ref={ctaRef}
                                style={{
                                    display: 'flex',
                                    flexDirection: isDesktop ? 'row' : 'column',
                                    gap: '1rem',
                                    width: '100%',
                                    maxWidth: isDesktop ? '450px' : '320px',
                                    margin: isDesktop ? '0' : '0 auto'
                                }}
                            >
                                <motion.button
                                    ref={primaryButtonRef}
                                    onClick={() => setIsWaitlistOpen(true)}
                                    whileHover={{ scale: 1.03, boxShadow: '0 15px 40px rgba(255, 155, 155, 0.4)' }}
                                    whileTap={{ scale: 0.97 }}
                                    style={{
                                        background: 'linear-gradient(135deg, #FF9B9B, #FF7B7B)',
                                        border: 'none',
                                        borderRadius: '16px',
                                        padding: isDesktop ? '18px 40px' : '18px 32px',
                                        color: 'white',
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        boxShadow: '0 10px 30px rgba(255, 155, 155, 0.3)',
                                        flex: isDesktop ? 'none' : 1
                                    }}
                                >
                                    <Heart size={22} fill="white" />
                                    Join Soon
                                    <ArrowRight size={20} />
                                </motion.button>

                                <motion.button
                                    ref={secondaryButtonRef}
                                    onClick={() => setIsWaitlistOpen(true)}
                                    whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.9)' }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.6)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 155, 155, 0.3)',
                                        borderRadius: '16px',
                                        padding: '16px 32px',
                                        color: '#4A3A3A',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Coming Soon
                                </motion.button>
                            </div>

                            {/* Stats for desktop */}
                            {isDesktop && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    style={{
                                        display: 'flex',
                                        gap: '3rem',
                                        marginTop: '3rem',
                                        paddingTop: '2rem',
                                        borderTop: '1px solid rgba(255, 155, 155, 0.2)'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FF9B9B' }}>10K+</div>
                                        <div style={{ fontSize: '0.9rem', color: '#7A6A6A' }}>Happy Couples</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FF9B9B' }}>50K+</div>
                                        <div style={{ fontSize: '0.9rem', color: '#7A6A6A' }}>Memories Shared</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#FF9B9B' }}>4.9★</div>
                                        <div style={{ fontSize: '0.9rem', color: '#7A6A6A' }}>User Rating</div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Right side - Image Carousel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            style={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                order: isDesktop ? 2 : 1
                            }}
                        >
                            <ImageCarousel isDesktop={isDesktop} />
                        </motion.div>
                    </motion.section>

                    {/* Features Section */}
                    <motion.section
                        ref={featuresRef}
                        style={{
                            padding: isDesktop ? '6rem 4rem' : '4rem 1.5rem',
                            position: 'relative',
                            zIndex: 2
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: isDesktop ? '4rem' : '3rem' }}
                        >
                            <h2 style={{
                                fontSize: isDesktop ? '2.5rem' : '2rem',
                                fontFamily: 'var(--font-serif)',
                                marginBottom: '1rem',
                                color: '#4A3A3A'
                            }}>
                                Everything You Need 💕
                            </h2>
                            <p style={{
                                color: '#7A6A6A',
                                fontSize: isDesktop ? '1.15rem' : '1rem',
                                maxWidth: '500px',
                                margin: '0 auto'
                            }}>
                                Tools designed for connection, not distraction. Build stronger bonds together.
                            </p>
                        </motion.div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isLargeDesktop ? 'repeat(4, 1fr)' : isDesktop ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                            gap: isDesktop ? '1.5rem' : '1rem',
                            maxWidth: '1200px',
                            margin: '0 auto'
                        }}>
                            <FeatureCard
                                icon={Heart}
                                title="Vibe Pulse"
                                description="Feel their mood, even from miles away"
                                delay={0.1}
                                gradient="linear-gradient(135deg, #FF9B9B, #FF7B7B)"
                                isDesktop={isDesktop}
                            />
                            <FeatureCard
                                icon={Camera}
                                title="Memory Wall"
                                description="Capture moments that matter most"
                                delay={0.2}
                                gradient="linear-gradient(135deg, #FFB4B4, #FF9B9B)"
                                isDesktop={isDesktop}
                            />
                            <FeatureCard
                                icon={Music}
                                title="Vibe Cinema"
                                description="Watch & listen together, anywhere"
                                delay={0.3}
                                gradient="linear-gradient(135deg, #FF9B9B, #FFB4B4)"
                                isDesktop={isDesktop}
                            />
                            <FeatureCard
                                icon={Gift}
                                title="Time Capsule"
                                description="Send love letters to the future"
                                delay={0.4}
                                gradient="linear-gradient(135deg, #FFB4B4, #FFCECE)"
                                isDesktop={isDesktop}
                            />
                        </div>

                        {/* More features tags */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{
                                marginTop: '2.5rem',
                                background: 'rgba(255, 255, 255, 0.5)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '20px',
                                padding: isDesktop ? '2rem' : '1.5rem',
                                border: '1px solid rgba(255,255,255,0.8)',
                                maxWidth: '1200px',
                                margin: '2.5rem auto 0'
                            }}
                        >
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                                {['Decision Wheel', 'Dream Board', 'Safe Vault', 'AI Chat', 'Games Together', 'Wellness Tracker', 'Secret Handshake', 'Calendar Sync'].map((feature, i) => (
                                    <motion.span
                                        key={feature}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.05, background: 'rgba(255,155,155,0.2)' }}
                                        style={{
                                            background: 'rgba(255, 155, 155, 0.1)',
                                            padding: isDesktop ? '10px 20px' : '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: isDesktop ? '0.95rem' : '0.85rem',
                                            color: '#4A3A3A',
                                            fontWeight: 500,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {feature}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    </motion.section>

                    {/* Benefits Section - Desktop Only */}
                    {isDesktop && (
                        <motion.section
                            style={{ padding: '4rem', position: 'relative', zIndex: 2 }}
                        >
                            <div style={{ display: 'flex', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                                <BenefitCard
                                    icon={Shield}
                                    title="Private & Secure"
                                    items={[
                                        'End-to-end encryption',
                                        'No ads or tracking',
                                        'Your data stays yours',
                                        'Secure cloud backup'
                                    ]}
                                />
                                <BenefitCard
                                    icon={Zap}
                                    title="Stay Connected"
                                    items={[
                                        'Real-time sync',
                                        'Instant notifications',
                                        'Works offline',
                                        'Cross-platform support'
                                    ]}
                                />
                                <BenefitCard
                                    icon={Heart}
                                    title="Grow Together"
                                    items={[
                                        'Relationship insights',
                                        'Memory milestones',
                                        'Goal tracking',
                                        'Weekly check-ins'
                                    ]}
                                />
                            </div>
                        </motion.section>
                    )}

                    {/* Gallery Section */}
                    <motion.section
                        ref={galleryRef}
                        style={{
                            padding: isDesktop ? '4rem' : '2rem 1.5rem',
                            position: 'relative',
                            zIndex: 2
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: '2rem' }}
                        >
                            <h2 style={{
                                fontSize: isDesktop ? '2.5rem' : '2rem',
                                fontFamily: 'var(--font-serif)',
                                color: '#4A3A3A'
                            }}>
                                Moments That Matter 🌙
                            </h2>
                        </motion.div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isLargeDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
                            gap: isDesktop ? '1rem' : '0.75rem',
                            maxWidth: '1200px',
                            margin: '0 auto'
                        }}>
                            {[
                                { img: movieImg, label: 'Movie nights' },
                                { img: gameImg, label: 'Game time' },
                                { img: dinnerImg, label: 'Dinner dates' },
                                { img: trainImg, label: 'Adventures' }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="gallery-item-gsap"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.03 }}
                                    style={{
                                        position: 'relative',
                                        borderRadius: isDesktop ? '20px' : '16px',
                                        overflow: 'hidden',
                                        aspectRatio: isLargeDesktop ? '4/3' : '1',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <img
                                        src={item.img}
                                        alt={item.label}
                                        loading="lazy"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        padding: isDesktop ? '1.5rem' : '1rem'
                                    }}>
                                        <span style={{
                                            color: 'white',
                                            fontSize: isDesktop ? '1.1rem' : '0.9rem',
                                            fontWeight: 500
                                        }}>
                                            {item.label}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Quote Section */}
                    <motion.section
                        style={{
                            padding: isDesktop ? '4rem' : '3rem 1.5rem',
                            position: 'relative',
                            zIndex: 2
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,155,155,0.15), rgba(255,255,255,0.5))',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '30px',
                                padding: isDesktop ? '4rem' : '3rem 2rem',
                                textAlign: 'center',
                                border: '1px solid rgba(255,155,155,0.2)',
                                maxWidth: '900px',
                                margin: '0 auto'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <Star size={isDesktop ? 48 : 40} fill="#FF9B9B" color="#FF9B9B" />
                            </motion.div>
                            <motion.p
                                style={{
                                    fontSize: isDesktop ? '1.75rem' : '1.5rem',
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    color: '#4A3A3A',
                                    marginTop: '1.5rem',
                                    lineHeight: 1.5
                                }}
                            >
                                "The best relationships aren't about finding the perfect person..."
                            </motion.p>
                            <motion.p
                                style={{
                                    fontSize: isDesktop ? '2.25rem' : '1.8rem',
                                    fontWeight: 700,
                                    marginTop: '1rem',
                                    background: 'linear-gradient(135deg, #FF9B9B, #FF7B7B)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                They're about growing together.
                            </motion.p>
                        </motion.div>
                    </motion.section>

                    {/* Final CTA */}
                    <motion.section
                        style={{
                            padding: isDesktop ? '4rem' : '3rem 1.5rem 5rem',
                            position: 'relative',
                            zIndex: 2
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{
                                background: 'linear-gradient(135deg, #FF9B9B, #FF7B7B)',
                                borderRadius: '30px',
                                padding: isDesktop ? '4rem' : '3rem 2rem',
                                textAlign: 'center',
                                boxShadow: '0 20px 60px rgba(255, 155, 155, 0.3)',
                                maxWidth: '900px',
                                margin: '0 auto'
                            }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Heart size={isDesktop ? 56 : 48} fill="white" color="white" />
                            </motion.div>
                            <h2 style={{
                                fontSize: isDesktop ? '2.25rem' : '1.8rem',
                                color: 'white',
                                fontFamily: 'var(--font-serif)',
                                marginTop: '1.5rem',
                                marginBottom: '0.75rem'
                            }}>
                                Ready to Begin?
                            </h2>
                            <p style={{
                                color: 'rgba(255,255,255,0.9)',
                                marginBottom: '2rem',
                                fontSize: isDesktop ? '1.15rem' : '1rem'
                            }}>
                                Be the first to join our private space — launching soon
                            </p>
                            <motion.button
                                onClick={() => setIsWaitlistOpen(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    background: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: isDesktop ? '18px 48px' : '16px 40px',
                                    color: '#FF9B9B',
                                    fontSize: isDesktop ? '1.15rem' : '1.1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                Join Soon
                                <ArrowRight size={20} />
                            </motion.button>
                        </motion.div>
                    </motion.section>

                    {/* Footer */}
                    <motion.footer
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: isDesktop ? '3rem' : '2rem',
                            color: '#7A6A6A',
                            fontSize: '0.9rem'
                        }}
                    >
                        <p>Made with 💕 for couples everywhere</p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>© 2026 VibeAura. All rights reserved.</p>
                    </motion.footer>

                </div>
            </motion.div>

            {/* Waitlist Modal */}
            <WaitlistModal
                isOpen={isWaitlistOpen}
                onClose={() => setIsWaitlistOpen(false)}
                isDesktop={isDesktop}
            />
        </>
    )
}

export default LandingPage
