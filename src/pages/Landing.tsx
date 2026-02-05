import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Brain, Crosshair, Box } from 'lucide-react';
import { cn } from '../lib/utils';

export function Landing() {
    return (
        <div className="space-y-20">
            {/* Hero Section */}
            <section className="text-center space-y-6 pt-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                        Win a Free Drink • Beat the Challenge
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                        Prove Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Skill</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Experience our collection of brutally difficult mini-games.
                        Achieve the impossible score and claim your reward at the counter.
                    </p>
                </motion.div>

                <div className="flex justify-center gap-4">
                    <Link
                        to="/games"
                        className="px-8 py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        Start Playing <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        to="/leaderboard"
                        className="px-8 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                    >
                        View Leaderboard
                    </Link>
                </div>
            </section>

            {/* Game Features / Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GameCard
                    to="/games/quantum-reflex"
                    icon={Zap}
                    title="Quantum Reflex"
                    desc="Test your reaction time. Blink and you lose."
                    color="bg-blue-500/10 text-blue-400 border-blue-500/20"
                />
                <GameCard
                    to="/games/memo-matrix"
                    icon={Brain}
                    title="MemoMatrix"
                    desc="Pattern recognition at its absolute limit."
                    color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                />
                <GameCard
                    to="/games/precision-tower"
                    icon={Crosshair}
                    title="Precision Tower"
                    desc="Stack it high. One slip is fatal."
                    color="bg-amber-500/10 text-amber-400 border-amber-500/20"
                />
                <GameCard
                    to="/games/void-runner"
                    icon={Box}
                    title="Void Runner"
                    desc="Survive the endless obstacle tunnel."
                    color="bg-rose-500/10 text-rose-400 border-rose-500/20"
                />
            </section>
        </div>
    );
}

function GameCard({ to, icon: Icon, title, desc, color }: { to: string, icon: any, title: string, desc: string, color: string }) {
    return (
        <Link
            to={to}
            className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors overflow-hidden block"
        >
            <div className={cn("inline-flex p-3 rounded-xl mb-4", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
                {desc}
            </p>
        </Link>
    );
}
