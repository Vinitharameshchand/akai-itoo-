import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music, Film, Radio, Send, Sparkles, Heart, Volume2, SkipForward, SkipBack, Monitor, Mic, Users, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';

// Floating particles component for ambient effect
const FloatingParticles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 15
    }));

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ y: '100vh', x: `${p.x}vw`, opacity: 0 }}
                    animate={{
                        y: '-10vh',
                        opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: 'linear'
                    }}
                    style={{
                        position: 'absolute',
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        background: 'rgba(255, 155, 155, 0.6)',
                        boxShadow: '0 0 10px rgba(255, 155, 155, 0.8)',
                    }}
                />
            ))}
        </div>
    );
};

// Animated music visualizer bars
const MusicVisualizer = ({ isPlaying }) => {
    const bars = [1, 2, 3, 4, 5];
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px', justifyContent: 'center', marginBottom: '1rem' }}>
            {bars.map((bar, i) => (
                <motion.div
                    key={bar}
                    animate={isPlaying ? {
                        height: [15, 40, 20, 35, 15],
                    } : { height: 15 }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut'
                    }}
                    style={{
                        width: '6px',
                        background: 'linear-gradient(to top, #FF9B9B, #FFB4B4)',
                        borderRadius: '3px',
                    }}
                />
            ))}
        </div>
    );
};

const VibeCinema = () => {
    const { user } = useAuth();
    const [isPlaying, setIsPlaying] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    
    // Hosting & Streaming States
    const [isHost, setIsHost] = useState(true);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamType, setStreamType] = useState('screen'); 
    const [remoteStream, setRemoteStream] = useState(null);
    const [localStream, setLocalStream] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);

    // Effect to attach remote stream when it becomes available
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Effect to attach local stream preview
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (!user) return;
        const room = user.partnerId
            ? [user.userId.toString(), user.partnerId.toString()].sort().join("-")
            : user.userId.toString();

        // Signaling handlers
        socket.on("webrtc_offer", async (data) => {
            console.log("Offer received from partner");
            await handleReceiveOffer(data);
        });

        socket.on("webrtc_answer", async (data) => {
            console.log("Answer received from partner");
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        socket.on("webrtc_ice_candidate", async (data) => {
            if (peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) { console.error("Error adding ice candidate", e); }
            }
        });

        socket.on("stream_started", () => {
             console.log("Partner started a stream. Switch to Viewer mode to see it.");
        });

        socket.on("stream_stopped", () => {
            setRemoteStream(null);
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
        });

        return () => {
            socket.off("webrtc_offer");
            socket.off("webrtc_answer");
            socket.off("webrtc_ice_candidate");
            socket.off("stream_started");
            socket.off("stream_stopped");
            stopStreaming();
        };
    }, [user]);

    const startStreaming = async () => {
        try {
            let stream;
            if (streamType === 'screen') {
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: "always" },
                    audio: { echoCancellation: true, noiseSuppression: true }
                });
            } else {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                });
            }

            setLocalStream(stream);
            setIsStreaming(true);

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            peerConnectionRef.current = pc;

            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const room = user.partnerId ? [user.userId.toString(), user.partnerId.toString()].sort().join("-") : user.userId.toString();
                    socket.emit("webrtc_ice_candidate", { roomId: room, candidate: event.candidate });
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const room = user.partnerId ? [user.userId.toString(), user.partnerId.toString()].sort().join("-") : user.userId.toString();
            socket.emit("webrtc_offer", { roomId: room, offer: offer });
            socket.emit("stream_started", { roomId: room });

        } catch (error) {
            console.error("Failed to start stream:", error);
            alert("Streaming failed. Make sure to check 'Share Audio' when sharing your screen!");
        }
    };

    const stopStreaming = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        setIsStreaming(false);

        const room = user.partnerId ? [user.userId.toString(), user.partnerId.toString()].sort().join("-") : user.userId.toString();
        socket.emit("stream_stopped", { roomId: room });
    };

    const handleReceiveOffer = async (data) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnectionRef.current = pc;

        pc.ontrack = (event) => {
            console.log("TRACK DETECTED");
            setRemoteStream(event.streams[0]);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const room = user.partnerId ? [user.userId.toString(), user.partnerId.toString()].sort().join("-") : user.userId.toString();
                socket.emit("webrtc_ice_candidate", { roomId: room, candidate: event.candidate });
            }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        const room = user.partnerId ? [user.userId.toString(), user.partnerId.toString()].sort().join("-") : user.userId.toString();
        socket.emit("webrtc_answer", { roomId: room, answer: answer });
    };

    const toggleRole = () => {
        stopStreaming();
        setRemoteStream(null);
        setIsHost(!isHost);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            color: 'white',
            position: 'relative',
            padding: '2rem 1rem 120px 1rem',
            fontFamily: 'system-ui'
        }}>
            <FloatingParticles />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                <h1 style={{ fontSize: '2.2rem', color: '#fca5a5', marginBottom: '0.5rem', fontWeight: 'bold' }}>Vibe Cinema</h1>
                <p style={{ opacity: 0.6 }}>Watch and Listen together in real-time ✨</p>
            </div>

            {/* Role Switcher */}
            <div style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '4px',
                marginBottom: '2rem',
                position: 'relative',
                zIndex: 2
            }}>
                <button 
                  onClick={() => !isHost && toggleRole()}
                  style={{
                    flex: 1, padding: '12px', border: 'none', borderRadius: '12px', cursor: 'pointer',
                    background: isHost ? '#fca5a5' : 'transparent', color: isHost ? 'black' : 'white',
                    fontWeight: 'bold', transition: '0.3s'
                  }}>
                    Me (Host)
                </button>
                <button 
                  onClick={() => isHost && toggleRole()}
                  style={{
                    flex: 1, padding: '12px', border: 'none', borderRadius: '12px', cursor: 'pointer',
                    background: !isHost ? '#fca5a5' : 'transparent', color: !isHost ? 'black' : 'white',
                    fontWeight: 'bold', transition: '0.3s'
                  }}>
                    Partner (Viewer)
                </button>
            </div>

            {/* Main Interface */}
            <div style={{ position: 'relative', zIndex: 2 }}>
                {isHost ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                            <button onClick={() => setStreamType('screen')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #fca5a5', background: streamType === 'screen' ? '#fca5a533' : 'transparent', color: 'white', cursor: 'pointer' }}>Screen</button>
                            <button onClick={() => setStreamType('audio')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #fca5a5', background: streamType === 'audio' ? '#fca5a533' : 'transparent', color: 'white', cursor: 'pointer' }}>Mic / Audio</button>
                        </div>

                        {localStream && (
                            <div style={{ width: '100%', aspectRatio: '16/9', background: 'black', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', border: '2px solid #fca5a5' }}>
                                <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        )}

                        <button 
                            onClick={isStreaming ? stopStreaming : startStreaming}
                            style={{
                                width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
                                background: isStreaming ? '#ef4444' : '#fca5a5', 
                                color: isStreaming ? 'white' : 'black', fontWeight: 'bold', cursor: 'pointer',
                                fontSize: '1.1rem'
                            }}>
                            {isStreaming ? '🛑 Stop Sharing' : '🚀 Start Sharing Now'}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        {remoteStream ? (
                            <div style={{ width: '100%', background: 'black', borderRadius: '24px', overflow: 'hidden', border: '2px solid #fca5a5', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                                <video 
                                    ref={remoteVideoRef} 
                                    autoPlay 
                                    playsInline 
                                    style={{ width: '100%', maxHeight: '70vh', background: 'black' }} 
                                />
                                <div style={{ padding: '15px', textAlign: 'center', background: 'rgba(252, 165, 165, 0.1)' }}>
                                    <p style={{ color: '#fca5a5', margin: 0, fontWeight: 'bold' }}>🔴 Partner is Streaming Live</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '2px dashed rgba(255,255,255,0.1)' }}>
                                <Eye size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p style={{ opacity: 0.5 }}>Waiting for partner to share...</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Visualizer and Like */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <MusicVisualizer isPlaying={isStreaming || !!remoteStream} />
                <button onClick={() => { setShowHeart(true); setTimeout(() => setShowHeart(false), 1000); }} style={{ background: 'rgba(252, 165, 165, 0.1)', border: 'none', padding: '15px 30px', borderRadius: '30px', color: '#fca5a5', cursor: 'pointer', fontWeight: 'bold' }}>
                    Send Love ❤️
                </button>
            </div>

            <AnimatePresence>
                {showHeart && (
                    <motion.div initial={{ y: 0, opacity: 0 }} animate={{ y: -200, opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', bottom: '20%', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                        <Heart size={60} fill="#fca5a5" color="#fca5a5" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VibeCinema;
