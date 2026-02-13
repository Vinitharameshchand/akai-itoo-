import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Coffee, Utensils, Star, ArrowLeft, ShoppingBag, Trophy, Zap, Gift, Ghost } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';

// --- Production Level Pet Renderer ---
const PetCharacter = ({ skin, action, happiness }) => {
    // We'll create a cute, animated creature using SVG
    // This allows us to animate parts individually (eyes, ears, body)

    const isSad = happiness < 30;
    const isVerySad = happiness < 10;

    return (
        <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
            {/* Ambient Shadow */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ position: 'absolute', bottom: '10px', left: '20%', right: '20%', height: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '50%', filter: 'blur(5px)' }}
            />

            {/* Sad Particles */}
            {isSad && (
                <motion.div
                    initial={{ opacity: 0, y: 80, x: 100 }}
                    animate={{ opacity: [0, 1, 0], y: 40 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ position: 'absolute', fontSize: '1.5rem' }}
                >
                    😢
                </motion.div>
            )}

            <motion.svg
                viewBox="0 0 200 200"
                style={{ width: '100%', height: '100%' }}
                animate={action === 'feed' ? { scale: [1, 1.1, 1], y: [0, -10, 0] } : isSad ? { y: [0, -2, 0] } : { y: [0, -5, 0] }}
                transition={action === 'feed' ? { duration: 0.3 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
                {/* Body */}
                <motion.ellipse
                    cx="100" cy="120" rx="60" ry="50"
                    fill={isSad ? '#B8B8B8' : '#FF9B9B'}
                    animate={{ fill: isSad ? ['#B8B8B8', '#C8C8C8'] : ['#FF9B9B', '#FFB4B4'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Face Details */}
                {/* Eyes */}
                <motion.g 
                    animate={
                        action === 'pet' ? { scaleY: 0.1 } : 
                        isSad ? { y: [0, 2, 0] } : 
                        { scaleY: 1 }
                    } 
                    style={{ originX: '100px', originY: '100px' }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <circle cx="75" cy="100" r={isSad ? 6 : 8} fill="#2D3436" />
                    <circle cx="125" cy="100" r={isSad ? 6 : 8} fill="#2D3436" />
                    <circle cx="78" cy="97" r="3" fill="white" opacity={isSad ? 0.3 : 1} />
                    <circle cx="128" cy="97" r="3" fill="white" opacity={isSad ? 0.3 : 1} />
                </motion.g>

                {/* Tears when very sad */}
                {isVerySad && (
                    <motion.g
                        animate={{ opacity: [0, 1], y: [0, 10] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <circle cx="75" cy="110" r="3" fill="#6DB3F2" opacity="0.7" />
                        <circle cx="125" cy="110" r="3" fill="#6DB3F2" opacity="0.7" />
                    </motion.g>
                )}

                {/* Blushing */}
                <motion.circle
                    cx="60" cy="115" r="10"
                    fill="#FF8080" opacity={isSad ? 0 : 0.4}
                    animate={{ scale: happiness > 80 ? 1.2 : 1 }}
                />
                <motion.circle
                    cx="140" cy="115" r="10"
                    fill="#FF8080" opacity={isSad ? 0 : 0.4}
                    animate={{ scale: happiness > 80 ? 1.2 : 1 }}
                />

                {/* Mouth */}
                <motion.path
                    d={
                        isSad ? "M 85 135 Q 100 128 115 135" : // Frown
                        action === 'feed' ? "M 85 125 Q 100 145 115 125" : 
                        "M 85 125 Q 100 135 115 125" // Normal smile
                    }
                    stroke="#2D3436" strokeWidth="3" fill="none" strokeLinecap="round"
                />

                {/* Ears - droopy when sad */}
                <motion.path 
                    d={isSad ? "M 50 90 Q 40 100 70 80" : "M 50 80 Q 40 40 70 70"} 
                    fill={isSad ? '#A8A8A8' : '#FF9B9B'}
                    animate={{ d: isSad ? ["M 50 90 Q 40 100 70 80", "M 50 92 Q 40 102 70 82"] : undefined }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.path 
                    d={isSad ? "M 150 90 Q 160 100 130 80" : "M 150 80 Q 160 40 130 70"} 
                    fill={isSad ? '#A8A8A8' : '#FF9B9B'}
                    animate={{ d: isSad ? ["M 150 90 Q 160 100 130 80", "M 150 92 Q 160 102 130 82"] : undefined }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Accessories (Skins) */}
                {skin === 'Crown' && (
                    <motion.text x="75" y="60" fontSize="40">👑</motion.text>
                )}
                {skin === 'Glasses' && (
                    <motion.text x="70" y="110" fontSize="40">🕶️</motion.text>
                )}
                {skin === 'Bow' && (
                    <motion.text x="80" y="85" fontSize="30">🎀</motion.text>
                )}
            </motion.svg>

            {/* Sad status message */}
            {isSad && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        position: 'absolute',
                        bottom: '-40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {isVerySad ? '😭 Very Sad' : '😔 Feeling Lonely'}
                </motion.div>
            )}
        </div>
    );
};

const VirtualPet = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState('');
    const [gems, setGems] = useState(100);
    const [currentAction, setCurrentAction] = useState('idle');
    const [showLevelUp, setShowLevelUp] = useState(false);

    const fetchPet = async () => {
        try {
            const [petRes, profileRes] = await Promise.all([
                api.get('/pet'),
                api.get('/pet/profile')
            ]);
            if (petRes.data.success) {
                setPet(petRes.data.pet);
            }
            if (profileRes.data.success) {
                setGems(profileRes.data.user.vibeGems || 0);
            }
        } catch (err) {
            console.error("Failed to fetch pet data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPet();

        // Listen for partner interactions
        socket.on("partner_vibe_change", (data) => {
            if (data.type === 'pet_interaction') {
                performVisualAction(data.value, true);
            }
            if (data.type === 'pet_skin') {
                fetchPet(); // Refresh to show new skin
            }
        });

        return () => socket.off("partner_vibe_change");
    }, [user]);

    const performVisualAction = (action, isFromPartner = false) => {
        setCurrentAction(action);
        setActionMsg(isFromPartner ? `Partner is ${action === 'ped' ? 'petting' : 'feeding'}! ❤️` : (action === 'pet' ? 'Purr... ❤️' : 'Yum! 🍪'));

        setTimeout(() => {
            setCurrentAction('idle');
            setActionMsg('');
        }, 2000);
    };

    const interact = async (action) => {
        try {
            const oldLevel = pet?.level;
            const res = await api.post('/pet/interact', { action });
            if (res.data.success) {
                setPet(res.data.pet);
                performVisualAction(action);

                if (res.data.pet.level > oldLevel) {
                    setShowLevelUp(true);
                    setTimeout(() => setShowLevelUp(false), 3000);
                }

                const room = user.partnerId ? [user.userId.toString(), user.partnerId.toString()].sort().join("-") : user.userId.toString();
                socket.emit("vibe_update", { roomId: room, type: 'pet_interaction', value: action });
            }
        } catch (err) {
            console.error("Interaction failed");
        }
    };

    const buyItem = async (itemId, price) => {
        try {
            const res = await api.post('/pet/shop/buy', { itemId, price });
            if (res.data.success) {
                setPet(res.data.pet);
                setGems(res.data.newBalance);
                setActionMsg(`Yay! Equipped ${itemId}! ✨`);
                setTimeout(() => setActionMsg(''), 2000);

                const room = user.partnerId ? [user.userId.toString(), user.partnerId.toString()].sort().join("-") : user.userId.toString();
                socket.emit("vibe_update", { roomId: room, type: 'pet_skin', value: itemId });
            }
        } catch (err) {
            setActionMsg("Not enough gems! 💎");
            setTimeout(() => setActionMsg(''), 2000);
        }
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FDECEC' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Heart size={40} color="#FF9B9B" fill="#FF9B9B" />
            </motion.div>
            <p style={{ marginTop: '1rem', color: '#FF9B9B', fontWeight: 'bold' }}>Calling Vibe Buddy...</p>
        </div>
    );

    const shopItems = [
        { id: 'Crown', price: 200, icon: '👑', color: '#FFF9E5', desc: 'A royal look' },
        { id: 'Glasses', price: 80, icon: '🕶️', color: '#E1F5FE', desc: 'Cool vibes' },
        { id: 'Bow', price: 50, icon: '🎀', color: '#FCE4EC', desc: 'Super cute' }
    ];

    return (
        <div className="game-container" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF9F9 0%, #FDECEC 100%)', paddingBottom: '120px' }}>
            {/* HUD / Header */}
            <header style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => navigate('/dashboard')} className="icon-btn-circle">
                    <ArrowLeft size={20} />
                </button>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <div className="hud-pill">
                        <Star size={14} fill="#FFD700" color="#FFD700" />
                        <span>LVL {pet?.level}</span>
                    </div>
                    <div className="hud-pill gem-gradient">
                        <span>💎 {gems}</span>
                    </div>
                </div>
            </header>

            {/* Main Stage */}
            <div style={{ position: 'relative', height: '45vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Environment - Floor */}
                <div style={{ position: 'absolute', bottom: '15%', width: '250px', height: '60px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%', filter: 'blur(20px)', zIndex: 0 }} />

                <AnimatePresence>
                    {actionMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: -100, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="floating-msg"
                        >
                            {actionMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <PetCharacter
                    skin={pet?.activeSkin}
                    action={currentAction}
                    happiness={pet?.happiness}
                />

                {/* Hearts particle system when happy */}
                {currentAction === 'pet' && (
                    <motion.div style={{ position: 'absolute', zIndex: 10 }}>
                        {[1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 1, y: 0, x: 0 }}
                                animate={{ opacity: 0, y: -100, x: (i - 2) * 40 }}
                                transition={{ duration: 1 }}
                                style={{ position: 'absolute' }}
                            >
                                <Heart size={24} fill="#FF9B9B" color="#FF9B9B" />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Status Bars */}
            <section style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Happiness</span>
                            <span style={{ fontSize: '0.8rem' }}>{pet?.happiness}%</span>
                        </div>
                        <div className="progress-bg">
                            <motion.div
                                className="progress-fill happiness-color"
                                animate={{ width: `${pet?.happiness}%` }}
                            />
                        </div>
                    </div>
                    <div className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Next Level</span>
                            <span style={{ fontSize: '0.8rem' }}>{pet?.experience % 100}/100</span>
                        </div>
                        <div className="progress-bg">
                            <motion.div
                                className="progress-fill xp-color"
                                animate={{ width: `${pet?.experience % 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Actions & Inventory Tabs */}
            <section style={{ padding: '0 1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button className="primary-action-btn" onClick={() => interact('pet')}>
                        <Zap size={22} />
                        Pet Buddy
                    </button>
                    <button className="secondary-action-btn" onClick={() => interact('feed')}>
                        <Utensils size={22} />
                        Feed Snack
                    </button>
                </div>

                <div className="glass-card shop-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <ShoppingBag size={18} color="#FF9B9B" />
                        <h3 style={{ fontSize: '1rem' }}>Vibe Boutique</h3>
                    </div>
                    <div className="shop-grid">
                        {shopItems.map(item => (
                            <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`shop-item ${pet?.inventory?.includes(item.id) ? 'owned' : ''} ${pet?.activeSkin === item.id ? 'active' : ''}`}
                                onClick={() => !pet?.inventory?.includes(item.id) && buyItem(item.id, item.price)}
                            >
                                <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: 0 }}>{item.id}</p>
                                    <p style={{ fontSize: '0.65rem', opacity: 0.6, margin: 0 }}>{item.desc}</p>
                                </div>
                                <div className="price-tag">
                                    {pet?.inventory?.includes(item.id) ? 'Owned' : `💎 ${item.price}`}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Level Up Modal */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="level-up-overlay"
                    >
                        <Trophy size={60} color="#FFD700" />
                        <h2 style={{ fontSize: '2rem', color: 'white', margin: '1rem 0' }}>LEVEL UP!</h2>
                        <p style={{ color: 'white' }}>Buddy is now Level {pet?.level} ✨</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .hud-pill {
                    background: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: bold;
                    font-size: 0.9rem;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .gem-gradient {
                    background: linear-gradient(135deg, #FFF, #FFF9E1);
                    color: #E65100;
                    border: 1px solid #FFE0B2;
                }
                .icon-btn-circle {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 1px solid rgba(0,0,0,0.05);
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .icon-btn-circle:hover { transform: scale(1.1); }
                
                .stat-card {
                    background: white;
                    padding: 1rem;
                    border-radius: 20px;
                    border: 1px solid rgba(0,0,0,0.03);
                }
                .progress-bg {
                    width: 100%;
                    height: 8px;
                    background: #F0F0F0;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .happiness-color { background: linear-gradient(90deg, #FF9B9B, #FFB4B4); }
                .xp-color { background: linear-gradient(90deg, #81ECEC, #00CEC9); }

                .primary-action-btn, .secondary-action-btn {
                    flex: 1;
                    padding: 1.2rem;
                    border-radius: 24px;
                    border: none;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: 0.2s;
                    font-family: inherit;
                }
                .primary-action-btn { background: #FF9B9B; color: white; box-shadow: 0 10px 20px rgba(255, 155, 155, 0.3); }
                .secondary-action-btn { background: white; color: #2D3436; border: 1px solid #F0F0F0; }
                .primary-action-btn:hover { transform: translateY(-3px); }

                .shop-box { padding: 1.5rem; border-radius: 24px; background: white; border: 1px solid #F0F2F5; }
                .shop-grid { display: grid; grid-template-columns: 1fr; gap: 0.8rem; }
                .shop-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 1rem;
                    background: #F9FAFB;
                    border-radius: 20px;
                    cursor: pointer;
                    border: 2px solid transparent;
                    position: relative;
                }
                .shop-item.active { border-color: #FF9B9B; background: #FFF9F9; }
                .shop-item.owned { opacity: 0.8; }
                .price-tag {
                    margin-left: auto;
                    font-size: 0.75rem;
                    font-weight: bold;
                    background: white;
                    padding: 4px 10px;
                    border-radius: 10px;
                }

                .floating-msg {
                    position: absolute;
                    background: white;
                    padding: 8px 16px;
                    border-radius: 15px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    font-weight: bold;
                    color: #FF9B9B;
                    pointer-events: none;
                    z-index: 20;
                }

                .level-up-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    z-index: 100;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                }
            `}</style>
        </div>
    );
};

export default VirtualPet;
