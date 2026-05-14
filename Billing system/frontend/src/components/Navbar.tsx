import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Tooltip from './Tooltip';
import { 
    ShoppingBag, 
    History, 
    User, 
    LayoutDashboard, 
    ClipboardList, 
    Sun, 
    Moon, 
    LogOut,
    Store
} from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAuthPage = ['/login', '/register', '/admin/login'].includes(location.pathname);

    if (isAuthPage) return null;

    const navLinks = user?.role === 'ADMIN' ? [
        { to: '/admin', label: 'Inventory', icon: LayoutDashboard, tooltip: 'Manage Stock' },
        { to: '/admin/orders', label: 'All Orders', icon: ClipboardList, tooltip: 'Track All Sales' },
    ] : [
        { to: '/', label: 'Shop', icon: Store, tooltip: 'Fresh Marketplace' },
        { to: '/history', label: 'My Orders', icon: History, tooltip: 'Your Purchase History' },
        { to: '/profile', label: 'Profile', icon: User, tooltip: 'Account Settings' },
    ];

    return (
        <header className="glass-nav sticky top-0 z-50 transition-colors">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-12">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <motion.div 
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-2 rounded-xl shadow-lg shadow-emerald-500/20"
                        >
                            <ShoppingBag className="h-6 w-6 text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 tracking-tight">
                            FreshMart
                        </h1>
                    </Link>
                    
                    <nav className="hidden lg:flex items-center space-x-2">
                        {user && navLinks.map((link) => (
                            <Tooltip key={link.to} text={link.tooltip} position="bottom">
                                <Link 
                                    to={link.to} 
                                    className="relative px-4 py-2 group"
                                >
                                    <div className={`flex items-center space-x-2 text-sm font-medium transition-colors ${location.pathname === link.to ? 'text-emerald-500' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
                                        <link.icon className="h-4 w-4" />
                                        <span>{link.label}</span>
                                    </div>
                                    {location.pathname === link.to && (
                                        <motion.div 
                                            layoutId="nav-underline"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
                                        />
                                    )}
                                </Link>
                            </Tooltip>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center space-x-6">
                    <Tooltip text={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'} position="bottom">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-[var(--color-surface-hover)] text-[var(--color-text)] hover:text-emerald-400 transition-colors border border-[var(--color-border)]"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </motion.button>
                    </Tooltip>

                    {user ? (
                        <div className="flex items-center space-x-6 border-l border-[var(--color-border)] pl-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Account</p>
                                <p className="text-sm font-semibold text-[var(--color-text)] truncate max-w-[150px]">
                                    {user.email.split('@')[0]}
                                </p>
                            </div>
                            <Tooltip text="Goodbye! 👋" position="bottom">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-rose-500/20"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden md:inline">Log Out</span>
                                </motion.button>
                            </Tooltip>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-sm font-semibold text-[var(--color-text-muted)] hover:text-emerald-400 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};


export default Navbar;

