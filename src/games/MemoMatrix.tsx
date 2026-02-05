import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { verifyGame } from '../lib/api';

interface GameState {
    status: 'idle' | 'showing' | 'playing' | 'gameover' | 'won';
    level: number;
    sequence: number[];
    playerSequence: number[];
}

export function MemoMatrix() {
    const [gameState, setGameState] = useState<GameState>({
        status: 'idle',
        level: 1,
        sequence: [],
        playerSequence: []
    });

    // Using a 4x4 grid (16 tiles)
    const GRID_SIZE = 16;
    const WIN_LEVEL = 10;

    const startGame = () => {
        setGameState({
            status: 'idle',
            level: 1,
            sequence: [],
            playerSequence: []
        });
        // Start sequence generation
        nextLevel(1);
    };

    const nextLevel = (level: number) => {
        const newSequence = Array.from({ length: level + 2 }, () => Math.floor(Math.random() * GRID_SIZE));

        setGameState(prev => ({
            ...prev,
            status: 'showing',
            level,
            sequence: newSequence,
            playerSequence: []
        }));
    };

    const handleTileClick = (index: number) => {
        if (gameState.status !== 'playing') return;

        const newPlayerSequence = [...gameState.playerSequence, index];

        // Check if correct so far
        const currentIndex = newPlayerSequence.length - 1;
        if (newPlayerSequence[currentIndex] !== gameState.sequence[currentIndex]) {
            endGame('gameover');
            return;
        }

        // Check if sequence complete
        if (newPlayerSequence.length === gameState.sequence.length) {
            if (gameState.level >= WIN_LEVEL) {
                endGame('won');
            } else {
                // Good job, next level
                // Add small delay before showing next
                setGameState(prev => ({ ...prev, playerSequence: newPlayerSequence })); // Update for visual feedback
                setTimeout(() => nextLevel(gameState.level + 1), 1000);
            }
        } else {
            setGameState(prev => ({ ...prev, playerSequence: newPlayerSequence }));
        }
    };

    const endGame = async (status: 'gameover' | 'won') => {
        setGameState(prev => ({ ...prev, status }));
        if (status === 'won') {
            const result = await verifyGame('memo-matrix', {
                level: WIN_LEVEL,
                timeElapsed: 20000
            });

            if (result.success) {
                alert(`WINNER! Token: ${result.token}`);
            } else {
                alert(`Verification Failed: ${result.error}`);
            }
        }
    };

    // Playback sequence
    const [activeTile, setActiveTile] = useState<number | null>(null);

    useEffect(() => {
        if (gameState.status !== 'showing') return;

        let step = 0;
        const interval = setInterval(() => {
            if (step >= gameState.sequence.length) {
                clearInterval(interval);
                setActiveTile(null);
                setGameState(prev => ({ ...prev, status: 'playing' }));
                return;
            }

            // Flash tile
            setActiveTile(gameState.sequence[step]);

            // Turn off halfway through interval
            setTimeout(() => setActiveTile(null), 400);

            step++;
        }, 800);

        return () => clearInterval(interval);
    }, [gameState.status, gameState.sequence]);

    return (
        <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
            {/* HUD */}
            <div className="flex justify-between items-center w-full mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                    <div className="text-xs uppercase text-gray-500 font-bold tracking-wider">Level</div>
                    <div className="text-3xl font-mono text-white">{gameState.level} <span className="text-gray-600">/ {WIN_LEVEL}</span></div>
                </div>
                <div className={cn("text-xl font-bold",
                    gameState.status === 'playing' ? "text-yellow-500" :
                        gameState.status === 'showing' ? "text-blue-400" :
                            gameState.status === 'won' ? "text-green-500" : "text-gray-400"
                )}>
                    {gameState.status === 'showing' ? 'WATCH' : gameState.status.toUpperCase()}
                </div>
            </div>

            {/* Grid */}
            <div className="relative p-4 bg-black/40 rounded-2xl border border-white/10 shadow-inner">
                <div className="grid grid-cols-4 gap-3">
                    {Array.from({ length: GRID_SIZE }).map((_, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            disabled={gameState.status !== 'playing'}
                            onClick={() => handleTileClick(i)}
                            className={cn(
                                "w-16 h-16 sm:w-20 sm:h-20 rounded-lg transition-all duration-150",
                                // Active/Flashed state
                                activeTile === i
                                    ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] border-transparent"
                                    : "bg-white/5 border border-white/10 hover:bg-white/10",
                                // Click feedback (if implementing visual feedback for correct clicks instantly, usually nice)
                                gameState.status === 'playing' && gameState.playerSequence.includes(i) // Simple feedback, but ideally should match index
                                    ? "border-emerald-500/50" : ""
                            )}
                        >
                            {/* Optional: Add slight glow if user clicks it correctly? logic is complex for partial match highlighting */}
                        </motion.button>
                    ))}
                </div>

                {/* Overlays */}
                {gameState.status === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl z-10">
                        <h2 className="text-3xl font-bold mb-4 text-emerald-400">MemoMatrix</h2>
                        <p className="text-gray-400 mb-6 text-center max-w-xs">Memorize the pattern. Repeat it perfectly. <br />Level {WIN_LEVEL} required.</p>
                        <button onClick={startGame} className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 flex gap-2">
                            <Play className="w-4 h-4" /> Start
                        </button>
                    </div>
                )}

                {gameState.status === 'gameover' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 backdrop-blur-sm rounded-2xl z-10">
                        <h2 className="text-3xl font-bold mb-2 text-white">Memory Corruption</h2>
                        <p className="text-gray-300 mb-6">Failed at Level {gameState.level}</p>
                        <button onClick={startGame} className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 flex gap-2">
                            <RotateCcw className="w-4 h-4" /> Retry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
