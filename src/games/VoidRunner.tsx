import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

// Game Constants
const LANE_COUNT = 3;
const GAME_DURATION = 60000; // 60s to win
const SPAWN_RATE_INITIAL = 1500;
const SPEED_INITIAL = 5;

interface Obstacle {
    id: number;
    lane: number; // 0, 1, 2
    y: number; // % from top
    type: 'wall';
}

interface GameState {
    status: 'idle' | 'playing' | 'gameover' | 'won';
    timeElapsed: number; // ms
    playerLane: number; // 0, 1, 2
    obstacles: Obstacle[];
    speed: number;
}

export function VoidRunner() {
    const [gameState, setGameState] = useState<GameState>({
        status: 'idle',
        timeElapsed: 0,
        playerLane: 1, // Center
        obstacles: [],
        speed: SPEED_INITIAL
    });

    const requestRef = useRef<number>(undefined);
    const lastSpawnRef = useRef<number>(0);
    const obstacleIdRef = useRef<number>(0);

    const startGame = () => {
        setGameState({
            status: 'playing',
            timeElapsed: 0,
            playerLane: 1,
            obstacles: [],
            speed: SPEED_INITIAL
        });
        lastSpawnRef.current = performance.now();
    };

    const endGame = (status: 'gameover' | 'won') => {
        setGameState(prev => ({ ...prev, status }));
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (gameState.status !== 'playing') return;

        if (e.key === 'ArrowLeft' || e.key === 'a') {
            setGameState(prev => ({
                ...prev,
                playerLane: Math.max(0, prev.playerLane - 1)
            }));
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            setGameState(prev => ({
                ...prev,
                playerLane: Math.min(LANE_COUNT - 1, prev.playerLane + 1)
            }));
        }
    }, [gameState.status]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Game Loop
    useEffect(() => {
        if (gameState.status !== 'playing') {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        let lastTime = performance.now();

        const animate = (time: number) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            setGameState(prev => {
                // 1. Update Time
                const newTime = prev.timeElapsed + deltaTime;
                if (newTime >= GAME_DURATION) {
                    endGame('won');
                    return prev;
                }

                // 2. Spawn Obstacles
                // Speed increases over time
                const progress = newTime / GAME_DURATION;
                const currentSpeed = SPEED_INITIAL + (progress * 5); // Max speed 10
                const spawnRate = Math.max(400, SPAWN_RATE_INITIAL - (progress * 1000));

                let newObstacles = [...prev.obstacles];

                if (time - lastSpawnRef.current > spawnRate) {
                    // Spawn logic
                    const lane = Math.floor(Math.random() * LANE_COUNT);
                    newObstacles.push({
                        id: obstacleIdRef.current++,
                        lane: lane,
                        y: -20, // Start above screen
                        type: 'wall'
                    });
                    lastSpawnRef.current = time;
                }

                // 3. Move Obstacles
                newObstacles = newObstacles.map(obs => ({
                    ...obs,
                    y: obs.y + (currentSpeed * (deltaTime / 16))
                })).filter(obs => obs.y < 120); // Remove off-screen

                // 4. Collision Detection
                // Player is at bottom (e.g., 80% to 90%)
                const playerYStart = 80;
                const playerYEnd = 90;

                for (const obs of newObstacles) {
                    // Simple box collision
                    // Obstacle height approx 10%
                    const obsYStart = obs.y;
                    const obsYEnd = obs.y + 10;

                    if (
                        obs.lane === prev.playerLane &&
                        obsYEnd > playerYStart &&
                        obsYStart < playerYEnd
                    ) {
                        endGame('gameover');
                        return prev;
                    }
                }

                return {
                    ...prev,
                    timeElapsed: newTime,
                    obstacles: newObstacles,
                    speed: currentSpeed
                };
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameState.status]);

    return (
        <div className="max-w-xl mx-auto w-full h-[700px] flex flex-col relative select-none">
            {/* HUD */}
            <div className="flex justify-between items-center mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                    <div className="text-xs uppercase text-gray-500 font-bold tracking-wider">Survival Time</div>
                    <div className="text-3xl font-mono text-white">{(gameState.timeElapsed / 1000).toFixed(1)}s <span className="text-gray-600">/ 60s</span></div>
                </div>
                <div className={cn("text-xl font-bold",
                    gameState.status === 'playing' ? "text-rose-500" :
                        gameState.status === 'won' ? "text-green-500" : "text-gray-400"
                )}>
                    {gameState.status.toUpperCase()}
                </div>
            </div>

            {/* Game Field */}
            <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden shadow-inner perspective-1000" style={{ perspective: '500px' }}>
                {/* 3D-effect Grid Lines */}
                <div className="absolute inset-0 flex">
                    <div className="flex-1 border-r border-white/5 bg-white/[0.02]" />
                    <div className="flex-1 border-r border-white/5" />
                    <div className="flex-1 bg-white/[0.02]" />
                </div>

                {/* Obstacles */}
                {gameState.obstacles.map(obs => (
                    <div
                        key={obs.id}
                        className="absolute h-[10%] w-[33.33%] bg-rose-500/80 border border-white/20 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                        style={{
                            left: `${obs.lane * 33.33}%`,
                            top: `${obs.y}%`,
                            // Simple depth effect scaling?
                        }}
                    />
                ))}

                {/* Player */}
                {gameState.status !== 'gameover' && (
                    <div
                        className="absolute bottom-[10%] h-[10%] w-[33.33%] flex justify-center items-center transition-all duration-100 ease-out"
                        style={{
                            left: `${gameState.playerLane * 33.33}%`
                        }}
                    >
                        <div className="w-12 h-12 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.8)] border-4 border-gray-200">
                            {/* Inner detail */}
                            <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-200 to-white" />
                        </div>
                    </div>
                )}

                {/* Overlays */}
                {gameState.status === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-30">
                        <h2 className="text-4xl font-bold mb-4 text-rose-500">Void Runner</h2>
                        <p className="text-gray-400 mb-8 max-w-xs text-center">
                            Dodge the falling walls. Controls: Left/Right Arrow or A/D. <br />
                            Survive 60 seconds.
                        </p>
                        <button onClick={startGame} className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 flex items-center gap-2">
                            <Play className="w-5 h-5" /> Run
                        </button>
                    </div>
                )}

                {gameState.status === 'gameover' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 backdrop-blur-sm z-30">
                        <h2 className="text-3xl font-bold mb-2 text-white">Collision Detected</h2>
                        <p className="text-gray-300 mb-6">Survived for {(gameState.timeElapsed / 1000).toFixed(2)}s</p>
                        <button onClick={startGame} className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 flex gap-2">
                            <RotateCcw className="w-4 h-4" /> Retry
                        </button>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-4 grid grid-cols-2 gap-4 px-4 h-24">
                <button
                    className="bg-white/10 active:bg-white/20 rounded-xl border border-white/10 flex items-center justify-center text-gray-300 font-bold text-lg active:scale-95 transition-all touch-manipulation"
                    onClick={() => {
                        if (gameState.status !== 'playing') return;
                        setGameState(prev => ({
                            ...prev,
                            playerLane: Math.max(0, prev.playerLane - 1)
                        }));
                    }}
                >
                    ← LEFT
                </button>
                <button
                    className="bg-white/10 active:bg-white/20 rounded-xl border border-white/10 flex items-center justify-center text-gray-300 font-bold text-lg active:scale-95 transition-all touch-manipulation"
                    onClick={() => {
                        if (gameState.status !== 'playing') return;
                        setGameState(prev => ({
                            ...prev,
                            playerLane: Math.min(LANE_COUNT - 1, prev.playerLane + 1)
                        }));
                    }}
                >
                    RIGHT →
                </button>
            </div>
        </div>
    );
}
