import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, Camera, Box, Settings, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: Home, path: '/dashboard', label: 'Home' },
        { icon: Heart, path: '/cinema', label: 'Vibe' },
        { icon: Camera, path: '/snaps', label: 'Snaps' },
        { icon: Box, path: '/time-capsule', label: 'Capsule' },
        { icon: Sparkles, path: '/dreams', label: 'Dreams' },
    ];

    return (
        <nav
            className="glass-card"
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                right: '20px',
                height: '70px',
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(20px)',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '0 10px',
                borderRadius: '35px',
                boxShadow: '0 10px 30px rgba(135, 31, 58, 0.1)',
            }}
        >
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                    <motion.div
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        <Icon
                            size={24}
                            color={isActive ? 'var(--accent-coral)' : '#A09090'}
                            fill={isActive ? 'rgba(255, 155, 155, 0.2)' : 'none'}
                            strokeWidth={isActive ? 2.5 : 2}
                        />
                        {isActive && (
                            <motion.div
                                layoutId="nav-dot"
                                style={{
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--accent-coral)',
                                    marginTop: '4px'
                                }}
                            />
                        )}
                        <span style={{
                            fontSize: '10px',
                            color: isActive ? 'var(--accent-coral)' : '#A09090',
                            fontWeight: isActive ? 600 : 400,
                            marginTop: '2px'
                        }}>
                            {item.label}
                        </span>
                    </motion.div>
                );
            })}
        </nav>
    );
};

export default BottomNav;
