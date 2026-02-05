import { Link } from 'react-router-dom';
import { Zap, Brain, Crosshair, Box } from 'lucide-react';
import { cn } from '../lib/utils'; // Assuming cn exists

const GAMES = [
    {
        id: 'quantum-reflex',
        title: 'Quantum Reflex',
        desc: 'Test your reaction time. Blink and you lose.',
        icon: Zap,
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        available: true
    },
    {
        id: 'memo-matrix',
        title: 'MemoMatrix',
        desc: 'Pattern recognition at its absolute limit.',
        icon: Brain,
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        available: true
    },
    {
        id: 'precision-tower',
        title: 'Precision Tower',
        desc: 'Stack it high. One slip is fatal.',
        icon: Crosshair,
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        available: true
    },
    {
        id: 'void-runner',
        title: 'Void Runner',
        desc: 'Survive the endless obstacle tunnel.',
        icon: Box,
        color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        available: true
    }
];

export function Games() {
    return (
        <div className="py-10">
            <h1 className="text-4xl font-bold mb-8 text-center text-white">Select a Challenge</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {GAMES.map((game) => (
                    <Link
                        key={game.id}
                        to={game.available ? `/games/${game.id}` : '#'}
                        className={cn(
                            "group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] transition-colors flex items-center gap-4",
                            game.available ? "hover:bg-white/[0.05]" : "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className={cn("p-4 rounded-xl", game.color)}>
                            <game.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">{game.title}</h3>
                            <p className="text-sm text-gray-400">{game.desc}</p>
                            {!game.available && (
                                <span className="inline-block mt-2 text-xs font-bold text-gray-600 uppercase tracking-wider">Coming Soon</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
