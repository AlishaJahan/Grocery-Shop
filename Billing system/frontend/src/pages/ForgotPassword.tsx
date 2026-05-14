import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

type Step = 'EMAIL' | 'OTP' | 'PASSWORD';

const ForgotPassword = () => {
    const [step, setStep] = useState<Step>('EMAIL');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('Reset OTP sent to your email! 📧');
            setStep('OTP');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/verify-reset-otp', { email, otp });
            toast.success('OTP verified! Now set your new password. 🔐');
            setStep('PASSWORD');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            toast.success('Password reset successful! You can now login. 🎉');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-[var(--color-surface)] rounded-2xl p-8 shadow-2xl border border-[var(--color-border)]">
                <div className="text-center mb-8">
                    <div className="inline-flex bg-emerald-500/10 p-3 rounded-full mb-4 text-emerald-400">
                        {step === 'EMAIL' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        )}
                        {step === 'OTP' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        )}
                        {step === 'PASSWORD' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        )}
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--color-text)]">
                        {step === 'EMAIL' ? 'Forgot Password' : step === 'OTP' ? 'Verify OTP' : 'New Password'}
                    </h2>
                    <p className="text-[var(--color-text-muted)] mt-2">
                        {step === 'EMAIL' ? 'Enter your email to receive a reset code' : step === 'OTP' ? `Enter the 6-digit code sent to ${email}` : 'Create a strong new password'}
                    </p>
                </div>

                <form onSubmit={step === 'EMAIL' ? handleSendOTP : step === 'OTP' ? handleVerifyOTP : handleResetPassword} className="space-y-6">
                    {error && (
                        <div className="bg-rose-500/20 border border-rose-500 text-rose-300 px-4 py-2 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    {step === 'EMAIL' && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                placeholder="your@email.com"
                            />
                        </div>
                    )}

                    {step === 'OTP' && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-4 text-center">Verification Code</label>
                            <input
                                type="text"
                                maxLength={6}
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-4 rounded-xl text-center text-3xl font-bold tracking-[1em] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                placeholder="000000"
                            />
                        </div>
                    )}

                    {step === 'PASSWORD' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading || (step === 'OTP' && otp.length !== 6)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                    >
                        {loading ? 'Processing...' : step === 'EMAIL' ? 'Send Reset Link' : step === 'OTP' ? 'Verify OTP' : 'Update Password'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                    <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold text-sm">
                        ← Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
