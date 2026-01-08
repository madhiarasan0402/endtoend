import React, { useState } from 'react';
import { ShieldCheck, Lock, User as UserIcon, ArrowRight, Loader2, Eye, EyeOff, Sparkles, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/login', { username, password });
            localStorage.setItem('user', JSON.stringify(response.data));
            onLoginSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 100, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-500/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        x: [0, -50, 0],
                        y: [0, 100, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-500/10 blur-[120px] rounded-full"
                />
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-20 dark:opacity-10"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-[1000px] flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border-2 border-slate-900 relative z-10"
            >
                {/* Branding Side */}
                <div className="hidden md:flex flex-1 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-emerald-500 opacity-50"></div>
                        <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-8">
                            <ShieldCheck className="text-slate-900" size={28} />
                        </div>
                        <h1 className="text-4xl font-black text-white leading-tight uppercase tracking-tighter">
                            Neural <br /> Intelligence <br /> <span className="text-indigo-400">Gateway</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-6 font-bold uppercase tracking-widest max-w-[200px]">
                            ChurnShield Pro Enterprise Protocol v2.5.0
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white transition-all group-hover:bg-indigo-500 group-hover:border-indigo-500">
                                <Globe size={18} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-white uppercase">Global Registry</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Syncing with remote clusters</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white transition-all group-hover:bg-emerald-500 group-hover:border-emerald-500">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-white uppercase">Neural weights</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">XGBoost optimized analysis</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Side */}
                <div className="flex-1 p-12 bg-white dark:bg-slate-900 border-l-[3px] border-slate-900">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Authentication</h2>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Initialize secure executive session</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-900 dark:text-slate-400 uppercase ml-1 flex items-center gap-2">
                                <UserIcon size={12} className="text-indigo-600" />
                                Secure Identifier
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-900 rounded-2xl py-5 px-6 text-slate-900 dark:text-white placeholder-slate-300 outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-black text-sm uppercase tracking-tight"
                                placeholder="Username"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-900 dark:text-slate-400 uppercase ml-1 flex items-center gap-2">
                                <Lock size={12} className="text-indigo-600" />
                                Access Credential
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-900 rounded-2xl py-5 px-6 text-slate-900 dark:text-white placeholder-slate-300 outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-black text-sm tracking-widest"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-600 text-[10px] font-black uppercase flex items-center gap-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-indigo-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 group uppercase tracking-widest text-xs relative overflow-hidden"
                        >
                            <span className="relative z-10">
                                {loading ? "Verifying..." : "Enter Neural Network"}
                            </span>
                            {!loading && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-12 flex items-center justify-between opacity-50">
                        <div className="flex gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <p className="text-[9px] font-black text-slate-900 dark:text-slate-500 uppercase">Secure Link Active</p>
                    </div>
                </div>
            </motion.div>

            {/* Footer Tag */}
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">
                ChurnShield Pro • Optimized for Neural Telemetry Analysis
            </p>
        </div>
    );
};

export default Login;
