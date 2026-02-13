import socket from '../socket';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Send, Loader, Smile, Check, CheckCheck, Image as ImageIcon } from 'lucide-react';

// Date separator component
const DateSeparator = ({ date }) => {
    const formatDate = (d) => {
        const today = new Date();
        const msgDate = new Date(d);
        const diff = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    };

    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            margin: '1.5rem 0',
            opacity: 0.6
        }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {formatDate(date)}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
        </div>
    );
};

// Typing indicator component
const TypingIndicator = ({ partnerName }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        style={{
            alignSelf: 'flex-start',
            maxWidth: '80px',
            padding: '0.85rem 1.1rem',
            borderRadius: '20px 20px 20px 4px',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            gap: '4px',
            alignItems: 'center'
        }}
    >
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--accent-coral)',
                    opacity: 0.6
                }}
            />
        ))}
    </motion.div>
);

const Chat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const navigate = useNavigate();

    const roomId = user?.partnerId
        ? [user.userId.toString(), user.partnerId.toString()].sort().join("-")
        : user?.userId?.toString();

    // Load chat history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await api.get('/chat/history');
                if (res.data.success) {
                    setMessages(res.data.messages.map(m => ({
                        senderId: m.senderId,
                        senderName: m.senderName,
                        text: m.content,
                        timestamp: m.timestamp,
                        _id: m._id
                    })));
                }
            } catch (error) {
                console.error('Failed to load chat history:', error);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    useEffect(() => {
        if (!roomId) return;
        
        // Listen for real-time messages
        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        // Listen for typing indicators
        socket.on("partner_typing", (data) => {
            if (data.isTyping) {
                setPartnerTyping(true);
            }
        });

        socket.on("partner_stop_typing", () => {
            setPartnerTyping(false);
        });

        // Join room
        socket.emit("join_room", roomId);

        return () => {
            socket.off("receive_message");
            socket.off("partner_typing");
            socket.off("partner_stop_typing");
        };
    }, [roomId, partnerTyping]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
        
        // Emit typing indicator
        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing", { roomId, isTyping: true });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit("typing", { roomId, isTyping: false });
        }, 1000);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Stop typing indicator
        setIsTyping(false);
        socket.emit("typing", { roomId, isTyping: false });

        const optimisticMessage = {
            senderId: user.userId,
            senderName: user.fullName,
            text: input,
            timestamp: new Date(),
            _id: Date.now(), // temporary ID
            sending: true
        };

        // Optimistic UI update
        setMessages((prev) => [...prev, optimisticMessage]);
        setInput('');
        inputRef.current?.focus();

        try {
            // Save to database
            const res = await api.post('/chat/send', { content: optimisticMessage.text });
            
            if (res.data.success) {
                // Broadcast via socket
                const data = {
                    roomId,
                    senderId: user.userId,
                    senderName: user.fullName,
                    text: optimisticMessage.text,
                    timestamp: optimisticMessage.timestamp,
                    _id: res.data.data._id
                };
                socket.emit("send_message", data);
                
                // Replace temporary message with real one
                setMessages((prev) => 
                    prev.map(m => m._id === optimisticMessage._id ? { ...data, sent: true } : m)
                );
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Mark message as failed
            setMessages((prev) => 
                prev.map(m => m._id === optimisticMessage._id ? { ...m, failed: true } : m)
            );
        }
    };

    // Group messages by date
    const groupMessagesByDate = (msgs) => {
        const groups = [];
        let currentDate = null;

        msgs.forEach((msg) => {
            const msgDate = new Date(msg.timestamp).toDateString();
            if (msgDate !== currentDate) {
                groups.push({ type: 'date', date: msg.timestamp });
                currentDate = msgDate;
            }
            groups.push({ type: 'message', ...msg });
        });

        return groups;
    };

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="app-container" style={{ padding: '0', height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(to bottom, #FDECEC, #FFF5F5)' }}>
            {/* Animated Header */}
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    padding: '1.25rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 155, 155, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    zIndex: 10,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem'
                    }}
                >
                    <ArrowLeft size={24} />
                </motion.button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'var(--primary-gradient)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--soft-glow)'
                        }}
                    >
                        <Heart size={20} fill="white" color="white" />
                    </motion.div>
                    <div>
                        <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-serif)', marginBottom: '2px' }}>
                            Quiet Chat
                        </h3>
                        <p style={{
                            fontSize: '0.7rem',
                            color: 'var(--accent-coral)',
                            fontWeight: 600,
                            letterSpacing: '0.05em'
                        }}>
                            {partnerTyping ? 'typing...' : 'PRIVATE SPACE'}
                        </p>
                    </div>
                </div>

                {/* Emoji button placeholder */}
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: 0.6
                    }}
                >
                    <Smile size={22} color="var(--accent-coral)" />
                </motion.button>
            </motion.header>

            {/* Messages Container */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}
                className="custom-scrollbar"
            >
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                            <Loader size={32} color="var(--accent-coral)" />
                        </motion.div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading your memories...</p>
                    </div>
                ) : (
                    <>
                        {groupedMessages.map((item, i) => {
                            if (item.type === 'date') {
                                return <DateSeparator key={`date-${i}`} date={item.date} />;
                            }

                            const msg = item;
                            const isMe = msg.senderId === user.userId;
                            const showAvatar = i === 0 || groupedMessages[i - 1]?.senderId !== msg.senderId;

                            return (
                                <motion.div
                                    key={msg._id || i}
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    style={{
                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                        maxWidth: '75%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isMe ? 'flex-end' : 'flex-start',
                                        marginBottom: showAvatar ? '1rem' : '0.25rem'
                                    }}
                                >
                                    {/* Message Bubble */}
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        style={{
                                            padding: '0.9rem 1.2rem',
                                            borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            background: isMe
                                                ? 'linear-gradient(135deg, #FF9B9B 0%, #FFB4B4 100%)'
                                                : 'rgba(255, 255, 255, 0.9)',
                                            color: isMe ? 'white' : 'var(--text-primary)',
                                            boxShadow: isMe
                                                ? '0 8px 20px rgba(255, 155, 155, 0.3)'
                                                : '0 4px 15px rgba(0,0,0,0.08)',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.5',
                                            border: isMe ? 'none' : '1px solid rgba(255, 155, 155, 0.2)',
                                            position: 'relative',
                                            wordWrap: 'break-word'
                                        }}
                                    >
                                        {msg.text}

                                        {/* Status indicator for sent messages */}
                                        {isMe && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                marginTop: '4px',
                                                justifyContent: 'flex-end'
                                            }}>
                                                {msg.sending ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                        style={{ display: 'flex' }}
                                                    >
                                                        <Loader size={12} color="rgba(255,255,255,0.7)" />
                                                    </motion.div>
                                                ) : msg.failed ? (
                                                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Failed</span>
                                                ) : msg.sent ? (
                                                    <CheckCheck size={14} color="rgba(255,255,255,0.9)" />
                                                ) : (
                                                    <Check size={14} color="rgba(255,255,255,0.7)" />
                                                )}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Timestamp */}
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.6 }}
                                        style={{
                                            fontSize: '0.7rem',
                                            color: 'var(--text-secondary)',
                                            marginTop: '4px',
                                            padding: '0 8px'
                                        }}
                                    >
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </motion.span>
                                </motion.div>
                            );
                        })}

                        {/* Typing Indicator */}
                        <AnimatePresence>
                            {partnerTyping && <TypingIndicator />}
                        </AnimatePresence>

                        <div ref={chatEndRef} />

                        {/* Empty State */}
                        {messages.length === 0 && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    textAlign: 'center',
                                    marginTop: 'auto',
                                    marginBottom: 'auto',
                                    padding: '2rem'
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ fontSize: '4rem', marginBottom: '1rem' }}
                                >
                                    💬
                                </motion.div>
                                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                                    No messages yet
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Send a sweet message to start the conversation
                                </p>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* Input Footer */}
            <motion.form
                onSubmit={sendMessage}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255, 155, 155, 0.2)',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-end',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
                }}
            >
                <motion.input
                    ref={inputRef}
                    type="text"
                    placeholder="Message..."
                    value={input}
                    onChange={handleInputChange}
                    whileFocus={{ scale: 1.01 }}
                    style={{
                        flex: 1,
                        padding: '1rem 1.25rem',
                        borderRadius: '25px',
                        border: '2px solid rgba(255, 155, 155, 0.2)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        outline: 'none',
                        fontSize: '1rem',
                        fontFamily: 'var(--font-sans)',
                        transition: 'all 0.3s ease',
                        maxHeight: '120px',
                        resize: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-coral)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 155, 155, 0.2)'}
                />
                
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={!input.trim()}
                    style={{
                        background: input.trim() ? 'var(--primary-gradient)' : 'rgba(200,200,200,0.3)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '52px',
                        height: '52px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: input.trim() ? 'pointer' : 'not-allowed',
                        boxShadow: input.trim() ? 'var(--soft-glow)' : 'none',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Send size={20} color="white" />
                </motion.button>
            </motion.form>
        </div>
    );
};

export default Chat;
