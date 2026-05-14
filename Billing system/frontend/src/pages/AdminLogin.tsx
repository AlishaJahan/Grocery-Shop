import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../utils/validation';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Validate using yup
            await loginSchema.validate({ email, password });
            
            setLoading(true);
            const res = await api.post('/auth/admin/login', { email, password });
            login(res.data.data.user, res.data.data.token);
            navigate('/admin');
        } catch (err: any) {
            // Handle yup validation errors or API errors
            setError(err.message || err.response?.data?.message || 'Invalid admin credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
            <div className="max-w-md w-full">
                {/* Admin Badge */}
                <div className="text-center mb-8">
                    <div className="inline-flex bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                        🔐 Admin Portal
                    </div>
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-xl shadow-amber-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-[var(--color-text)]">Admin Access</h1>
                    <p className="text-[var(--color-text-muted)] mt-2">FreshMart Control Panel</p>
                </div>

                <div className="bg-[var(--color-surface)] rounded-2xl p-8 shadow-2xl border border-amber-500/20">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-sm text-center font-medium">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Admin Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                placeholder="admin@freshmart.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Admin Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 mt-2"
                        >
                            {loading ? 'Authenticating...' : 'Access Admin Panel'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[var(--color-text-muted)] text-xs mt-6">
                    Not an admin?{' '}
                    <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold">
                        Go to User Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
