import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Trophy, Home, Gamepad2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-gray-100 font-sans selection:bg-purple-500/30">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#3b0764,transparent_70%)]" />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0f0f0f]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-2 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                                <Coffee className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Cafe Arcade
                            </span>
                        </Link>

                        <div className="flex items-center gap-1">
                            <NavLink to="/" icon={Home} label="Home" active={location.pathname === '/'} />
                            <div className="h-4 w-px bg-white/10 mx-2" />
                            <NavLink to="/games" icon={Gamepad2} label="Games" active={location.pathname.startsWith('/games')} />
                            <NavLink to="/leaderboard" icon={Trophy} label="Rankings" active={location.pathname === '/leaderboard'} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} // Exit animations require AnimatePresence in App.tsx but simple enter is fine here
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col"
                >
                    <Outlet />
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 mt-20 py-8 text-center text-gray-500 text-sm">
                <p>&copy; 2024 Cafe Rewards. Play responsibly.</p>
                <div className="mt-2 text-xs">
                    <Link to="/staff" className="text-gray-700 hover:text-gray-500 transition-colors">Staff Access</Link>
                </div>
            </footer>
        </div>
    );
}

function NavLink({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) {
    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                active
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </Link>
    );
}
