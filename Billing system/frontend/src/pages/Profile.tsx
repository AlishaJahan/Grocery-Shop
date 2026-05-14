import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
    useAuth();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        houseNumber: '',
        area: '',
        landmark: '',
        city: '',
        pincode: ''
    });

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            setUser(res.data.data);
            setFormData({
                name: res.data.data.name || '',
                phoneNumber: res.data.data.phoneNumber || '',
                houseNumber: res.data.data.houseNumber || '',
                area: res.data.data.area || '',
                landmark: res.data.data.landmark || '',
                city: res.data.data.city || '',
                pincode: res.data.data.pincode || ''
            });
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/auth/profile', formData);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            toast.error('Failed to update profile');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 mt-12 pb-20">
            <div className="max-w-4xl mx-auto">
                <div className="bg-[var(--color-surface)] rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-2xl">
                    {/* Header/Cover */}
                    <div className="h-32 bg-gradient-to-r from-emerald-500 to-lime-500"></div>

                    <div className="px-8 pb-8">
                        {/* Profile Image & Name Section */}
                        <div className="relative flex flex-col items-center -mt-16 mb-8">
                            <div className="w-32 h-32 bg-[var(--color-surface)] rounded-full p-2 shadow-xl border-4 border-[var(--color-surface)]">
                                <div className="w-full h-full bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-[var(--color-text)] mt-4">{user?.name || user?.email.split('@')[0]}</h2>
                            <p className="text-[var(--color-text-muted)] font-medium">Customer Account</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-[var(--color-surface-hover)]/30 p-6 rounded-2xl border border-[var(--color-border)]/50">
                                <h3 className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-4">Account Information</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[var(--color-text-muted)]">Full Name</span>
                                        <span className="text-sm text-[var(--color-text)] font-bold">{user?.name || 'Not Set'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[var(--color-text-muted)]">Phone Number</span>
                                        <span className="text-sm text-[var(--color-text)] font-bold">{user?.phoneNumber || 'Not Set'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[var(--color-text-muted)]">Email Address</span>
                                        <span className="text-sm text-[var(--color-text)] font-bold">{user?.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[var(--color-text-muted)]">Status</span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-black uppercase tracking-tighter ${user?.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            {user?.isVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[var(--color-surface-hover)]/30 p-6 rounded-2xl border border-[var(--color-border)]/50">
                                <h3 className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-4">Shipping Address</h3>
                                <div className="space-y-4">
                                    {user?.houseNumber ? (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[var(--color-text-muted)]">House No.</span>
                                                <span className="text-sm text-[var(--color-text)] font-bold">{user?.houseNumber}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[var(--color-text-muted)]">Area</span>
                                                <span className="text-sm text-[var(--color-text)] font-bold">{user?.area}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-[var(--color-text-muted)]">City/Pincode</span>
                                                <span className="text-sm text-[var(--color-text)] font-bold">{user?.city}, {user?.pincode}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-[var(--color-text-muted)] italic">No address saved yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20"
                            >
                                Edit Profile
                            </button>
                            <button
                                onClick={() => window.location.href = '/history'}
                                className="px-8 py-3 bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-[var(--color-text)] rounded-xl font-bold transition-all border border-[var(--color-border)]"
                            >
                                View Order History
                            </button>
                        </div>

                        {/* Policies Section */}
                        <div className="mt-12 pt-8 border-t border-[var(--color-border)]/50">
                            <h3 className="text-xs font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-6 text-center">Policies & Support</h3>
                            <div className="max-w-md mx-auto">
                                <Link
                                    to="/cancellation-policy"
                                    className="flex items-center justify-between p-4 bg-[var(--color-surface-hover)]/30 rounded-2xl border border-[var(--color-border)]/50 hover:bg-[var(--color-surface-hover)] transition-all group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--color-text)]">Cancellation & Refund Policy</p>
                                            <p className="text-xs text-[var(--color-text-muted)]">When can I cancel my order?</p>
                                        </div>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[var(--color-surface)] w-full max-w-lg rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
                            <h3 className="text-xl font-black text-[var(--color-text)]">Edit Profile</h3>
                            <button onClick={() => setIsEditing(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-[var(--color-text-muted)] uppercase mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-[var(--color-text-muted)] uppercase mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-[var(--color-text-muted)] uppercase mb-1">House No.</label>
                                    <input
                                        type="text"
                                        value={formData.houseNumber}
                                        onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                                        className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-[var(--color-text-muted)] uppercase mb-1">Area/Colony</label>
                                    <input
                                        type="text"
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-[var(--color-text-muted)] uppercase mb-1">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-[var(--color-text-muted)] uppercase mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                        className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-[var(--color-text-muted)] uppercase mb-1">Landmark</label>
                                    <input
                                        type="text"
                                        value={formData.landmark}
                                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                        className="w-full bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-[var(--color-text)] focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 bg-[var(--color-surface-hover)] text-[var(--color-text)] rounded-xl font-bold border border-[var(--color-border)]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
