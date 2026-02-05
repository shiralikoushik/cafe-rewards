import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { verifyGame } from '../lib/api';

interface GameState {
    status: 'idle' | 'playing' | 'gameover' | 'won';
    score: number;
    highScore: number;
    timeLeft: number;
    winningTimestamp?: number; // When the game was won
}

export function QuantumReflex() {
    const [gameState, setGameState] = useState<GameState>({
        status: 'idle',
        score: 0,
        highScore: 0,
        timeLeft: 0
    });

    // For live clock on winner screen
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (gameState.status === 'won') {
            const interval = setInterval(() => setNow(Date.now()), 1000);
            return () => clearInterval(interval);
        }
    }, [gameState.status]);

    const [target, setTarget] = useState({ x: 50, y: 50, size: 80 });
    const [clickHistory, setClickHistory] = useState<number[]>([]);
    const fieldRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number | undefined>(undefined);

    const DIFFICULTY = {
        WIN_SCORE: 25, // Production difficulty
        INITIAL_TIME: 2000,
        MIN_TIME: 400, // 400ms is hard
        DECAY: 50, // ms reduced per click
    };

    const spawnTarget = useCallback(() => {
        if (!fieldRef.current) return;
        const size = Math.max(40, 80 - gameState.score * 1.5); // Shrink target
        const x = Math.random() * (100 - size / fieldRef.current.clientWidth * 100);
        const y = Math.random() * (100 - size / fieldRef.current.clientHeight * 100);

        setTarget({
            x: Math.max(5, Math.min(95, x)), // Keep somewhat within bounds (percentage)
            y: Math.max(5, Math.min(95, y)),
            size
        });
    }, [gameState.score]);

    const startGame = () => {
        setGameState(prev => ({ ...prev, status: 'playing', score: 0, timeLeft: DIFFICULTY.INITIAL_TIME }));
        setClickHistory([]);
        spawnTarget();
    };

    const handleClick = () => {
        if (gameState.status !== 'playing') return;

        const now = Date.now();
        // Record click time for anti-cheat verification later
        const newHistory = [...clickHistory, now];
        setClickHistory(newHistory);

        const newScore = gameState.score + 1;
        if (newScore >= DIFFICULTY.WIN_SCORE) {
            endGame('won', newHistory);
            return;
        }

        // Calculate new time limit
        const newTime = Math.max(DIFFICULTY.MIN_TIME, DIFFICULTY.INITIAL_TIME - (newScore * DIFFICULTY.DECAY));

        setGameState(prev => ({
            ...prev,
            score: newScore,
            timeLeft: newTime,
        }));

        spawnTarget();
    };

    const endGame = async (status: 'gameover' | 'won', finalHistory?: number[]) => {
        setGameState(prev => ({
            ...prev,
            status,
            winningTimestamp: status === 'won' ? Date.now() : undefined
        }));

        if (status === 'won') {
            // Verification
            const historyToVerify = finalHistory || clickHistory;
            const result = await verifyGame('quantum-reflex', {
                score: DIFFICULTY.WIN_SCORE,
                history: historyToVerify
            });

            if (result.success) {
                alert(`WINNER! Show this code to the barista: ${result.token}`);
            } else {
                alert(`Verification Failed: ${result.error}`);
            }
        }
    };

    // Game Loop / Timer
    useEffect(() => {
        if (gameState.status !== 'playing') return;

        const tick = 10;
        timerRef.current = window.setInterval(() => {
            setGameState(prev => {
                if (prev.timeLeft <= 0) {
                    endGame('gameover');
                    return prev;
                }
                return { ...prev, timeLeft: prev.timeLeft - tick };
            });
        }, tick);

        return () => clearInterval(timerRef.current);
    }, [gameState.status]);

    return (
        <div className="max-w-4xl mx-auto w-full h-[600px] flex flex-col relative select-none">
            {/* HUD */}
            <div className="flex justify-between items-center mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                    <div className="text-xs uppercase text-gray-500 font-bold tracking-wider">Score</div>
                    <div className="text-3xl font-mono text-white">{gameState.score} <span className="text-gray-600">/ {DIFFICULTY.WIN_SCORE}</span></div>
                </div>

                {gameState.status === 'playing' && (
                    <div className="flex-1 mx-8">
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-purple-500"
                                style={{ width: `${Math.min(100, (gameState.timeLeft / 1000) * 100)}%` }}
                                animate={{
                                    width: `${(gameState.timeLeft / (Math.max(DIFFICULTY.MIN_TIME, DIFFICULTY.INITIAL_TIME - (gameState.score * DIFFICULTY.DECAY)))) * 100}%`
                                }}
                                transition={{ duration: 0 }}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <div className="text-xs uppercase text-gray-500 font-bold tracking-wider">Status</div>
                    <div className={cn("text-xl font-bold",
                        gameState.status === 'playing' ? "text-yellow-500" :
                            gameState.status === 'won' ? "text-green-500" : "text-gray-400"
                    )}>
                        {gameState.status.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Game Field */}
            <div
                ref={fieldRef}
                className="flex-1 bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden shadow-inner"
            >
                {gameState.status === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-400">
                            Quantum Reflex
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-md text-center">
                            Click the targets before time runs out. The timer gets faster with every hit.
                            Reach {DIFFICULTY.WIN_SCORE} to win.
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <Play className="w-5 h-5" /> Start Game
                        </button>
                    </div>
                )}

                {gameState.status === 'gameover' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 backdrop-blur-sm z-10">
                        <h2 className="text-4xl font-bold mb-2 text-red-500">System Failure</h2>
                        <p className="text-gray-400 mb-8">Reflexes synchronized at {Math.floor((gameState.score / DIFFICULTY.WIN_SCORE) * 100)}%</p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" /> Retry
                        </button>
                    </div>
                )}

                {gameState.status === 'won' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/90 backdrop-blur-md z-10 p-6 text-center">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.6)]"
                        >
                            <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>

                        <h2 className="text-4xl font-bold mb-2 text-white">Target Acquired</h2>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/10 mb-6 w-full max-w-sm">
                            <div className="text-gray-400 text-sm mb-1">WINNER TOKEN</div>
                            <div className="font-mono text-xl text-green-400 break-all">
                                REFLEX-{String(new Date(gameState.winningTimestamp || 0).getHours()).padStart(2, '0')}{String(new Date(gameState.winningTimestamp || 0).getMinutes()).padStart(2, '0')}-OK
                            </div>
                        </div>

                        {/* Live Verification Elements for Waiter */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                            <div className="bg-white/10 p-3 rounded-lg">
                                <div className="text-xs text-gray-400 uppercase">Current Time</div>
                                <div className="font-mono text-xl font-bold text-white tabular-nums">
                                    {new Date(now).toLocaleTimeString()}
                                </div>
                            </div>
                            <div className="bg-white/10 p-3 rounded-lg">
                                <div className="text-xs text-gray-400 uppercase">Expires In</div>
                                <div className="font-mono text-xl font-bold text-yellow-400 tabular-nums">
                                    {(() => {
                                        const expiry = (gameState.winningTimestamp || 0) + 1000 * 60 * 5; // 5 mins
                                        const left = Math.max(0, Math.floor((expiry - now) / 1000));
                                        const m = Math.floor(left / 60);
                                        const s = left % 60;
                                        return `${m}:${s.toString().padStart(2, '0')}`;
                                    })()}
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 max-w-xs mb-6 animate-pulse">
                            Show this screen to the staff. Ensure the time above is moving.
                        </p>

                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <Play className="w-5 h-5" /> Play Again
                        </button>
                    </div>
                )}

                {gameState.status === 'playing' && (
                    <motion.button
                        key={gameState.score} // Remount on score change to reset random pos
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.1 }}
                        className="absolute rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.5)] border-2 border-white"
                        style={{
                            left: `${target.x}%`,
                            top: `${target.y}%`,
                            width: target.size,
                            height: target.size,
                            transform: 'translate(-50%, -50%)' // Center anchor
                        }}
                        onMouseDown={handleClick} // MouseDown for faster response than Click
                    />
                )}
            </div>
        </div>
    );
}
