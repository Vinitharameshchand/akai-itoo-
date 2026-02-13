import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, RefreshCcw, User, UserPlus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import socket from '../socket';

const GameCenter = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState(null);
    const [room, setRoom] = useState('');
    const [role, setRole] = useState(null); // 'X' or 'O'
    const [partnerLinked, setPartnerLinked] = useState(!!user?.partnerId);

    useEffect(() => {
        if (!user) return;
        setPartnerLinked(!!user.partnerId);

        const initGame = async () => {
            try {
                const res = await api.post('/games/init', { gameType: 'tictactoe' });
                if (res.data.success) {
                    const roomId = res.data.roomId;
                    setRoom(roomId);
                    console.log(`[TTT] Room ID from backend: ${roomId}`);
                    // Global room already joined in App.jsx

                    if (user.partnerId) {
                        const myId = user.userId.toString();
                        const partnerId = user.partnerId.toString();
                        // Deterministic room ID: sort IDs as strings
                        const roomIds = [myId, partnerId].sort();
                        const assignedRole = myId === roomIds[0] ? 'X' : 'O';
                        setRole(assignedRole);
                        console.log(`[TTT] My ID: ${myId}, Role: ${assignedRole}`);
                    } else {
                        setRole('X');
                    }
                }
            } catch (err) {
                console.error("Game init failed", err);
            }
        };

        initGame();

        socket.on("game_move", (data) => {
            console.log("Move received:", data);
            if (data.gameType === 'tictactoe') {
                if (data.action === 'move') {
                    setBoard(data.board);
                    setIsXNext(data.isXNext);
                    const win = calculateWinner(data.board);
                    if (win) setWinner(win);
                } else if (data.action === 'reset') {
                    setBoard(Array(9).fill(null));
                    setIsXNext(true);
                    setWinner(null);
                }
            }
        });

        return () => {
            socket.off("game_move");
        };
    }, [user]);

    const handleClick = (i) => {
        if (!partnerLinked) return;
        if (winner || board[i]) return;

        // Check if it's my turn
        const myTurn = (isXNext && role === 'X') || (!isXNext && role === 'O');
        if (!myTurn) return;

        const newBoard = board.slice();
        newBoard[i] = isXNext ? 'X' : 'O';

        const nextIsX = !isXNext;
        setBoard(newBoard);
        setIsXNext(nextIsX);

        const win = calculateWinner(newBoard);
        if (win) setWinner(win);

        socket.emit("game_action", {
            roomId: room,
            gameType: 'tictactoe',
            action: 'move',
            board: newBoard,
            isXNext: nextIsX
        });
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        socket.emit("game_action", {
            roomId: room,
            gameType: 'tictactoe',
            action: 'reset'
        });
    };

    const calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        if (!squares.includes(null)) return 'Draw';
        return null;
    };

    const renderSquare = (i) => (
        <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            className="square"
            onClick={() => handleClick(i)}
            style={{
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: board[i] === 'X' ? 'var(--accent-coral)' : '#5C6BC0',
                cursor: board[i] || !partnerLinked || (isXNext && role !== 'X') || (!isXNext && role !== 'O') ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {board[i]}
        </motion.button>
    );

    if (!partnerLinked) {
        return (
            <div className="app-container" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>Game Center</h1>
                </header>
                <div className="glass-card" style={{ padding: '2rem', marginTop: '4rem' }}>
                    <AlertCircle size={48} color="var(--accent-coral)" style={{ marginBottom: '1rem' }} />
                    <h3>Partner Not Linked</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                        You need to link with your partner to play together!
                    </p>
                    <button onClick={() => navigate('/link')} className="btn-primary" style={{ margin: '0 auto' }}>
                        Link Partner Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container" style={{ padding: '1.5rem 1.5rem 120px 1.5rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>Tic-Tac-Toe</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Playful sparks, together.</p>
                </div>
            </header>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1rem', display: 'inline-block', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {winner ? (winner === 'Draw' ? "It's a tie!" : `Winner: ${winner}`) :
                            isXNext ? (role === 'X' ? "Your turn (X)" : "Partner's turn (X)") :
                                (role === 'O' ? "Your turn (O)" : "Partner's turn (O)")}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '10px', justifyContent: 'center' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSquare(i))}
                </div>

                <AnimatePresence>
                    {(winner || !board.includes(null)) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{ marginTop: '2rem' }}
                        >
                            <button
                                onClick={resetGame}
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                            >
                                <RefreshCcw size={18} /> Play Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <User size={20} color="var(--accent-coral)" />
                    <span style={{ fontWeight: 600 }}>Your identity: {role}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Roles are assigned automatically based on your connection.
                </p>
            </div>

            <style>{`
                .square:hover {
                    background: rgba(255, 255, 255, 1) !important;
                }
            `}</style>
        </div>
    );
};

export default GameCenter;
