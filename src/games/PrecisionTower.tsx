import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

interface Block {
    width: number; // Percentage width
    left: number;  // Percentage left position
    color: string;
}

interface GameState {
    status: 'idle' | 'playing' | 'gameover' | 'won';
    score: number;
    stack: Block[];
    currentBlockPos: number; // 0-100%
    direction: 1 | -1;
    speed: number;
}

export function PrecisionTower() {
    const [gameState, setGameState] = useState<GameState>({
        status: 'idle',
        score: 0,
        stack: [],
        currentBlockPos: 0,
        direction: 1,
        speed: 1
    });

    const requestRef = useRef<number>(undefined);
    const WIN_SCORE = 20;
    const INITIAL_WIDTH = 50; // %
    // Colors for gradient stack
    const COLORS = ['bg-amber-500', 'bg-orange-500', 'bg-rose-500', 'bg-purple-500', 'bg-blue-500'];

    const startGame = () => {
        setGameState({
            status: 'playing',
            score: 0,
            stack: [{ width: INITIAL_WIDTH, left: (100 - INITIAL_WIDTH) / 2, color: COLORS[0] }], // Base block
            currentBlockPos: 0,
            direction: 1,
            speed: 1.5 // Initial speed
        });
    };

    const placeBlock = useCallback(() => {
        if (gameState.status !== 'playing') return;

        const currentStackTop = gameState.stack[gameState.stack.length - 1];
        const currentWidth = currentStackTop.width;

        // Calculate overlap
        // The moving block has the SAME width as the one below it physically, but visually we render it at 'currentBlockPos'
        // Actually, logic is: moving block width = currentStackTop.width
        // Its left edge is currentBlockPos.

        const movingBlockLeft = gameState.currentBlockPos;
        const previousBlockLeft = currentStackTop.left;
        const previousBlockRight = previousBlockLeft + currentWidth;
        const movingBlockRight = movingBlockLeft + currentWidth;

        // Intersection
        const overlapLeft = Math.max(movingBlockLeft, previousBlockLeft);
        const overlapRight = Math.min(movingBlockRight, previousBlockRight);
        const overlapWidth = overlapRight - overlapLeft;

        if (overlapWidth <= 0) {
            // Missed completely
            endGame('gameover');
            return;
        }

        // Hit!
        const newScore = gameState.score + 1;
        const newBlock: Block = {
            width: overlapWidth,
            left: overlapLeft,
            color: COLORS[newScore % COLORS.length]
        };

        if (newScore >= WIN_SCORE) {
            endGame('won');
        } else {
            setGameState(prev => ({
                ...prev,
                score: newScore,
                stack: [...prev.stack, newBlock],
                currentBlockPos: 0, // Reset to arbitrary pos, will be handled by loop? better to start from side
                speed: prev.speed + 0.2 // Increase speed
            }));
        }
    }, [gameState]);

    const endGame = (status: 'gameover' | 'won') => {
        setGameState(prev => ({ ...prev, status }));
    };

    // Animation Loop
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
                // Move block back and forth
                // We need valid range. Range is 0 to (100 - currentWidth).
                const currentWidth = prev.stack[prev.stack.length - 1].width;
                const maxPos = 100 - currentWidth;

                let newPos = prev.currentBlockPos + (prev.speed * prev.direction * (deltaTime / 10)); // Speed factor adjustment

                let newDir = prev.direction;
                if (newPos >= maxPos) {
                    newPos = maxPos;
                    newDir = -1;
                } else if (newPos <= 0) {
                    newPos = 0;
                    newDir = 1;
                }

                return { ...prev, currentBlockPos: newPos, direction: newDir };
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameState.status, gameState.score]); // Re-bind on score change (speedup)?? actually better to depend on stack length or just status

    // Effect for controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                placeBlock();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [placeBlock]);

    return (
        <div className="max-w-xl mx-auto w-full h-[700px] flex flex-col relative select-none">
            {/* HUD */}
            <div className="flex justify-between items-center mb-4 p-4 bg-white/5 rounded-xl border border-white/10 z-20">
                <div>
                    <div className="text-xs uppercase text-gray-500 font-bold tracking-wider">Height</div>
                    <div className="text-3xl font-mono text-white">{gameState.score} <span className="text-gray-600">/ {WIN_SCORE}</span></div>
                </div>
                <div className={cn("text-xl font-bold",
                    gameState.status === 'playing' ? "text-amber-500" :
                        gameState.status === 'won' ? "text-green-500" : "text-gray-400"
                )}>
                    {gameState.status.toUpperCase()}
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 relative overflow-hidden shadow-inner flex flex-col-reverse" onClick={placeBlock}>
                {/* Stack */}
                <div className="relative w-full h-full flex flex-col-reverse justify-start pb-10">
                    <div className="w-full h-1 bg-white/10 mb-0 flex-shrink-0" />

                    {gameState.stack.map((block, i) => (
                        <div
                            key={i}
                            className={cn("h-10 transition-all duration-300 flex-shrink-0", block.color)}
                            style={{
                                width: `${block.width}%`,
                                marginLeft: `${block.left}%`
                            }}
                        />
                    ))}

                    {/* Current Moving Block */}
                    {gameState.status === 'playing' && gameState.stack.length > 0 && (
                        <div
                            className={cn("h-10 absolute flex-shrink-0 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]")}
                            style={{
                                bottom: `${(gameState.stack.length) * 40}px`, // 4px (border?) + 40px per block
                                width: `${gameState.stack[gameState.stack.length - 1].width}%`,
                                left: `${gameState.currentBlockPos}%`
                            }}
                        />
                    )}
                </div>

                {/* Custom message overlays */}
                {gameState.status === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30">
                        <h2 className="text-4xl font-bold mb-4 text-amber-500">Precision Tower</h2>
                        <p className="text-gray-400 mb-8 max-w-xs text-center">
                            Stack the blocks perfectly. Any overhang is cut off. <br />
                            Reach height {WIN_SCORE}.
                        </p>
                        <button onClick={startGame} className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 flex items-center gap-2">
                            <Play className="w-5 h-5" /> Start
                        </button>
                    </div>
                )}

                {gameState.status === 'gameover' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/40 backdrop-blur-sm z-30">
                        <div className="text-5xl mb-4">💥</div>
                        <h2 className="text-3xl font-bold mb-2 text-white">Tower Collapsed</h2>
                        <button onClick={startGame} className="mt-6 px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 flex items-center gap-2">
                            <RotateCcw className="w-5 h-5" /> Retry
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
                Press SPACE or Click/Tap to place block
            </div>
        </div>
    );
}
