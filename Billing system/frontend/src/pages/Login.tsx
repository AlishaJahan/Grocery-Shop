import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../utils/validation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, UserPlus, ShieldAlert, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // Real-time email validation
    useEffect(() => {
        if (!email) {
            setEmailError('');
            return;
        }

        const validateEmail = async () => {
            try {
                await loginSchema.validateAt('email', { email });
                setEmailError('');
            } catch (err: any) {
                setEmailError(err.message);
            }
        };

        const timer = setTimeout(validateEmail, 500);
        return () => clearTimeout(timer);
    }, [email]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await loginSchema.validate({ email, password });
            setLoading(true);
            const res = await api.post('/auth/login', { email, password });
            if (res.data.data.user.role === 'ADMIN') {
                setError('Admins must use the Admin Portal to login.');
                return;
            }
            login(res.data.data.user, res.data.data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.message || err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full glass-card rounded-3xl p-8 relative z-10 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex bg-emerald-500/10 p-4 rounded-2xl mb-4 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                    >
                        <Lock className="h-8 w-8" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight">Welcome Back</h2>
                    <p className="text-[var(--color-text-muted)] mt-2 font-medium">Log in to continue to FreshMart</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-2xl text-sm flex items-center space-x-2 shadow-lg shadow-rose-500/5"
                        >
                            <ShieldAlert className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)] group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full bg-[var(--color-surface-hover)]/50 border ${emailError ? 'border-rose-500/50' : 'border-[var(--color-border)]'} text-[var(--color-text)] pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 ${emailError ? 'focus:ring-rose-500/10 focus:border-rose-500' : 'focus:ring-emerald-500/10 focus:border-emerald-500'} transition-all font-medium`}
                                placeholder="name@example.com"
                            />
                        </div>
                        <AnimatePresence>
                            {emailError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center space-x-1.5 text-rose-500 text-[10px] font-black uppercase tracking-wider mt-1.5 ml-1"
                                >
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{emailError}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">Password</label>
                            <Link to="/forgot-password" intrinsic-id="forgot-password-link" className="text-[10px] text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest transition-colors">
                                Forgot?
                            </Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)] group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[var(--color-surface-hover)]/50 border border-[var(--color-border)] text-[var(--color-text)] pl-12 pr-12 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-emerald-500 transition-colors p-1"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading || !!emailError}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center space-x-2 group mt-2"
                    >
                        <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                        {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                    </motion.button>
                </form>

                <div className="mt-10 pt-8 border-t border-[var(--color-border)] text-center space-y-4">
                    <p className="text-[var(--color-text-muted)] text-sm font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors inline-flex items-center space-x-1">
                            <UserPlus className="h-4 w-4" />
                            <span>Create one now</span>
                        </Link>
                    </p>
                    <div className="inline-block px-5 py-2 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <Link to="/admin/login" className="text-[10px] text-amber-500 hover:text-amber-400 font-black uppercase tracking-widest transition-colors">
                            Access Admin Dashboard →
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


export default Login;

