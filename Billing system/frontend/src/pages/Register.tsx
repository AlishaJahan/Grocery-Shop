import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { registerSchema } from '../utils/validation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlus, 
    Mail, 
    Lock, 
    ShieldCheck, 
    ArrowRight, 
    ArrowLeft,
    ShieldAlert,
    KeyRound,
    Eye,
    EyeOff,
    AlertCircle
} from 'lucide-react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Real-time email validation
    useEffect(() => {
        if (!email) {
            setEmailError('');
            return;
        }
        
        const validateEmail = async () => {
            try {
                await registerSchema.validateAt('email', { email });
                setEmailError('');
            } catch (err: any) {
                setEmailError(err.message);
            }
        };

        const timer = setTimeout(validateEmail, 500);
        return () => clearTimeout(timer);
    }, [email]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await registerSchema.validate({ email, password, confirmPassword });
            setLoading(true);
            await api.post('/auth/register', { email, password });
            toast.success('OTP sent to your email! 📧');
            setShowOtpInput(true);
        } catch (err: any) {
            setError(err.message || err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/verify-otp', { email, otp });
            toast.success('Email verified successfully! 🎉');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
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
                        {showOtpInput ? <ShieldCheck className="h-8 w-8" /> : <UserPlus className="h-8 w-8" />}
                    </motion.div>
                    <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight">
                        {showOtpInput ? 'Verify Account' : 'Join FreshMart'}
                    </h2>
                    <p className="text-[var(--color-text-muted)] mt-2 font-medium">
                        {showOtpInput ? `Enter the code sent to ${email}` : 'Start your fresh grocery journey'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!showOtpInput ? (
                        <motion.form 
                            key="register-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleRegister} 
                            className="space-y-5"
                        >
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
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Password</label>
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

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)] group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-[var(--color-surface-hover)]/50 border border-[var(--color-border)] text-[var(--color-text)] pl-12 pr-12 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-emerald-500 transition-colors p-1"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading || !!emailError}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center space-x-2 group mt-4"
                            >
                                <span>{loading ? 'Sending OTP...' : 'Get Verification Code'}</span>
                                {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="otp-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleVerifyOtp} 
                            className="space-y-6"
                        >
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
                            
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <KeyRound className="h-12 w-12 text-emerald-500 opacity-50" />
                                </div>
                                <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-[var(--color-surface-hover)]/50 border border-[var(--color-border)] text-[var(--color-text)] px-4 py-5 rounded-2xl text-center text-4xl font-bold tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-inner"
                                    placeholder="000000"
                                />
                                <p className="text-center text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-widest">Please enter the 6-digit code</p>
                            </div>

                            <div className="space-y-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Complete'}
                                </motion.button>
                                <button 
                                    type="button"
                                    onClick={() => setShowOtpInput(false)}
                                    className="w-full text-[var(--color-text-muted)] hover:text-emerald-500 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center space-x-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Back to Registration</span>
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
                
                <div className="mt-10 pt-8 border-t border-[var(--color-border)] text-center">
                    <p className="text-[var(--color-text-muted)] text-sm font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors">
                            Sign In instead
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};


export default Register;

