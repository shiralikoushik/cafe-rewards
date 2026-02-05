import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export function StaffVerify() {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [message, setMessage] = useState('');

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic format check: GAME-HHMM-OK
        const regex = /^([A-Z]+)-(\d{4})-OK$/;
        const match = code.toUpperCase().match(regex);

        if (!match) {
            setStatus('invalid');
            setMessage('Invalid code format. Expected format: GAME-HHMM-OK');
            return;
        }

        const timeStr = match[2];
        const hours = parseInt(timeStr.substring(0, 2));
        const minutes = parseInt(timeStr.substring(2, 4));

        const now = new Date();
        const codeTime = new Date();
        codeTime.setHours(hours, minutes, 0, 0);

        // Handle day rollover (if code was generated just before midnight)
        // If code time is > future (by a lot), assume it was yesterday (not possible for 5 min expiry)
        // If code time is < past (by a lot), check if it matches "today".

        // Simple logic: Compare current minutes since midnight.
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
        const codeTotalMinutes = hours * 60 + minutes;

        let diffMinutes = currentTotalMinutes - codeTotalMinutes;

        // Handle rollover
        // Case 1: Code is 23:55, Now is 00:05. Diff = 5 - 1435 = -1430. Add 1440 => 10. Valid.
        if (diffMinutes < -720) {
            diffMinutes += 1440;
        }
        // Case 2: Code is 00:05, Now is 23:55 (User clock wrong?). Diff = 1435 - 5 = 1430. Subtract 1440 => -10. Future.
        else if (diffMinutes > 720) {
            diffMinutes -= 1440;
        }

        // Allow -5 mins (future drift) to +15 mins (expiry)
        if (diffMinutes >= -5 && diffMinutes <= 15) {
            setStatus('valid');
            setMessage(`Code is VALID. Issued ${diffMinutes < 0 ? 'just now' : diffMinutes + ' minutes ago'}.`);
        } else if (diffMinutes < -5) {
            setStatus('invalid');
            setMessage(`Invalid time (Future code by ${Math.abs(diffMinutes)} mins). Check clocks.`);
        } else {
            setStatus('invalid');
            setMessage(`Code EXPIRED. Issued ${diffMinutes} minutes ago (Max 15 mins).`);
        }
    };

    return (
        <div className="min-h-screen pt-24 px-4 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
            >
                <div className="flex items-center justify-between mb-6 text-white">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-blue-400" />
                        <h1 className="text-2xl font-bold">Staff Verification</h1>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-400 uppercase">System Time</div>
                        <div className="font-mono text-lg font-bold text-blue-300">
                            {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2 uppercase font-bold tracking-wider">
                            Enter Winner Code
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value.toUpperCase());
                                    setStatus('idle');
                                }}
                                placeholder="REFLEX-1430-OK"
                                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-4 text-xl font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 uppercase transition-colors"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!code}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Verify Code
                    </button>
                </form>

                {status !== 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={cn("mt-6 p-4 rounded-xl border border-l-4",
                            status === 'valid'
                                ? "bg-green-900/20 border-green-500/50 border-l-green-500"
                                : "bg-red-900/20 border-red-500/50 border-l-red-500"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {status === 'valid' ? (
                                <ShieldCheck className="w-6 h-6 text-green-500 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
                            )}
                            <div>
                                <div className={cn("font-bold text-lg mb-1",
                                    status === 'valid' ? "text-green-400" : "text-red-400"
                                )}>
                                    {status === 'valid' ? "VERIFIED VALID" : "VERIFICATION FAILED"}
                                </div>
                                <div className="text-gray-300 text-sm leading-relaxed">
                                    {message}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
