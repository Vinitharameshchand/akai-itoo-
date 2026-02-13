import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Handshake, Disc, ArrowRight, Sparkles, MessageCircle, Star, Moon, Play, Shield, Zap, Camera, Music, Gift, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

// Import assets - using existing background images
const heroImg = '/assets/backgrounds/hug.jpg';
const noodlesImg = '/assets/backgrounds/noodles.jpg';
const dinnerImg = '/assets/backgrounds/dinner.jpg';
const trainImg = '/assets/backgrounds/train.jpg';
const movieImg = '/assets/backgrounds/movie.jpg';
const gameImg = '/assets/backgrounds/game.jpeg';

// Responsive hook
const useWindowSize = () => {
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    useEffect(() => {
        const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
};

// Animated background gradient orbs
const GradientOrbs = ({ isDesktop }) => (
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
);

// Floating elements
const FloatingElements = ({ isDesktop }) => {
    const elements = isDesktop ? [
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
    ];

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
};

// Hero image carousel
const ImageCarousel = ({ isDesktop }) => {
    const images = [heroImg, dinnerImg, noodlesImg, trainImg];
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

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
                    zIndex: 0
                }}
                animate={{ rotate: [0, 2, 0, -2, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
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
};

// Feature card with icon
const FeatureCard = ({ icon: Icon, title, description, delay, gradient, isDesktop }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(255, 155, 155, 0.2)' }}
        style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: isDesktop ? '2rem' : '1.75rem',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
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
                boxShadow: '0 8px 20px rgba(255, 155, 155, 0.3)'
            }}
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
        >
            <Icon size={isDesktop ? 30 : 26} color="white" />
        </motion.div>
        <h3 style={{ fontSize: isDesktop ? '1.25rem' : '1.15rem', fontWeight: 600, marginBottom: '0.5rem', color: '#4A3A3A' }}>{title}</h3>
        <p style={{ fontSize: isDesktop ? '1rem' : '0.9rem', color: '#7A6A6A', lineHeight: 1.5 }}>{description}</p>
    </motion.div>
);

// Pricing/Benefit card for desktop
const BenefitCard = ({ icon: Icon, title, items }) => (
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
);

function LandingPage() {
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const isDesktop = width >= 768;
    const isLargeDesktop = width >= 1200;

    return (
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
            <GradientOrbs isDesktop={isDesktop} />
            <FloatingElements isDesktop={isDesktop} />

            {/* Hero Section */}
            <motion.section
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
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            fontSize: isLargeDesktop ? '4rem' : isDesktop ? '3.5rem' : '3rem',
                            fontFamily: 'var(--font-serif)',
                            marginBottom: '1.5rem',
                            lineHeight: 1.1
                        }}
                    >
                        <span style={{ color: '#4A3A3A' }}>Love,</span><br />
                        <span style={{
                            background: 'linear-gradient(135deg, #FF9B9B, #FF7B7B)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            but designed.
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
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
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
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
                            onClick={() => { }}
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
                                cursor: 'default',
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
                            onClick={() => { }}
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
                                cursor: 'default'
                            }}
                        >
                            Coming Soon
                        </motion.button>
                    </motion.div>

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
                        onClick={() => { }}
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
                            cursor: 'default',
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
        </motion.div>
    )
}

export default LandingPage
