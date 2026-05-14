import { useState, useEffect, useRef } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import type { Product, BillDetails } from '../types';
import ProductList from '../components/ProductList';
import CartSummary from '../components/CartSummary';
import EmiOptions from '../components/EmiOptions';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from '../components/StripePayment';
import ProductDetailModal from '../components/ProductDetailModal';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Tooltip from '../components/Tooltip';
import { ProductListSkeleton } from '../components/ProductSkeleton';
import { 
    Search, 
    Heart, 
    ShoppingBag, 
    X, 
    ArrowRight, 
    MapPin, 
    CreditCard, 
    Truck,
    PackageSearch,
    ChevronRight,
    ShoppingBasket,
    AlertCircle
} from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const UserDashboard = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [billDetails, setBillDetails] = useState<BillDetails | null>(null);
    const [billId, setBillId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [hasCelebrated, setHasCelebrated] = useState(false);
    const [hasShippingCelebrated, setHasShippingCelebrated] = useState(false);
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [paymentChoice, setPaymentChoice] = useState<'STRIPE' | 'COD' | null>(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [address, setAddress] = useState({
        houseNumber: '',
        area: '',
        landmark: '',
        city: '',
        pincode: ''
    });
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null);
    const [checkoutStep, setCheckoutStep] = useState<number>(1); // 1: Address, 2: Payment, 3: Success
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [showWishlistOnly, setShowWishlistOnly] = useState(false);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const cartControls = useAnimation();

    const categories = ['All', 'Daily Essentials', 'Dairy', 'Snacks', 'Fruits & Veggies', 'Beverages'];
    useEffect(() => {
        fetchProducts();
        initializeBill();
        fetchUserProfile();
        fetchWishlist();
        cartControls.start({ scale: 1, opacity: 1 });

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await api.get('/wishlist');
            setWishlist(res.data.data.map((p: Product) => p.id));
        } catch (err) {
            console.error('Failed to fetch wishlist');
        }
    };

    const toggleWishlist = async (productId: number) => {
        try {
            const res = await api.post(`/wishlist/${productId}`);
            if (res.data.added) {
                setWishlist([...wishlist, productId]);
                toast.success('Added to wishlist! ❤️');
            } else {
                setWishlist(wishlist.filter(id => id !== productId));
                toast.success('Removed from wishlist');
            }
        } catch (err) {
            toast.error('Failed to update wishlist');
        }
    };

    const fetchUserProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            const userData = res.data.data;
            if (userData.houseNumber) {
                setAddress({
                    houseNumber: userData.houseNumber || '',
                    area: userData.area || '',
                    landmark: userData.landmark || '',
                    city: userData.city || '',
                    pincode: userData.pincode || ''
                });
            }
        } catch (err) {
            console.error('Failed to fetch user profile', err);
        }
    };

    useEffect(() => {
        let filtered = products.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (showWishlistOnly) {
            filtered = filtered.filter(product => wishlist.includes(product.id));
        } else if (selectedCategory !== 'All') {
            filtered = filtered.filter(product => {
                const prodCat = product.category || 'Uncategorized';
                return prodCat === selectedCategory;
            });
        }

        setFilteredProducts(filtered);
    }, [searchQuery, products, selectedCategory, showWishlistOnly, wishlist]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                fetchSuggestions();
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchSuggestions = async () => {
        try {
            const res = await api.get(`/products/suggestions?q=${searchQuery}`);
            setSuggestions(res.data.data);
            setShowSuggestions(true);
        } catch (err) {
            console.error('Failed to fetch suggestions');
        }
    };

    useEffect(() => {
        if (billDetails?.bill?.discountAmount && billDetails.bill.discountAmount > 0 && !hasCelebrated) {
            triggerCelebration('Congratulations! 10% Discount Applied! 🎉');
            setHasCelebrated(true);
        } else if (!billDetails?.bill?.discountAmount || billDetails.bill.discountAmount === 0) {
            setHasCelebrated(false);
        }
    }, [billDetails?.bill?.discountAmount]);

    useEffect(() => {
        const subTotal = billDetails?.bill?.subTotal || 0;
        if (subTotal >= 20 && !hasShippingCelebrated) {
            triggerCelebration('Yay! You unlocked FREE SHIPPING! 🚚💨');
            setHasShippingCelebrated(true);
        } else if (subTotal < 20 && subTotal > 0) {
            setHasShippingCelebrated(false);
        }
    }, [billDetails?.bill?.subTotal]);

    const triggerCelebration = (message: string) => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        toast.success(message, {
            duration: 4000,
            position: 'top-center',
            style: {
                background: '#10b981',
                color: '#fff',
                fontWeight: 'bold'
            }
        });
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data.data);
            setFilteredProducts(res.data.data);
        } catch (err: any) {
            console.error('Failed to fetch products', err);
        }
    };

    const initializeBill = async () => {
        try {
            setLoading(true);
            const res = await api.post('/bills');
            setBillId(res.data.data.id);
            fetchBillDetails(res.data.data.id);
        } catch (err: any) {
            setError('Failed to initialize bill');
            setLoading(false);
        }
    };

    const fetchBillDetails = async (billId: number) => {
        try {
            const res = await api.get(`/bills/${billId}`);
            const oldEligibility = billDetails?.emi?.isEligible;
            const newDetails = res.data.data;
            setBillDetails(newDetails);
            
            if (newDetails.emi?.isEligible && !oldEligibility) {
                toast.success('Congratulations! 🎉 You are now eligible for EMI options!', {
                    duration: 5000,
                    icon: '💳',
                    style: {
                        borderRadius: '10px',
                        background: '#1e293b',
                        color: '#f8fafc',
                        border: '1px solid #10b981'
                    }
                });
            }
        } catch (err: any) {
            setError('Failed to fetch bill details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId: number) => {
        if (!billId) return;
        try {
            await api.post(`/bills/${billId}/items`, { productId, quantity: 1 });
            cartControls.start({
                scale: [1, 1.3, 0.9, 1.1, 1],
                rotate: [0, 10, -10, 5, 0],
                transition: { duration: 0.5 }
            });
            fetchBillDetails(billId);
            fetchProducts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add item');
        }
    };

    const handleUpdateQuantity = async (productId: number, change: number) => {
        if (!billId) return;
        try {
            await api.post(`/bills/${billId}/items`, { productId, quantity: change });
            if (change > 0) {
                cartControls.start({
                    scale: [1, 1.2, 0.95, 1.05, 1],
                    transition: { duration: 0.4 }
                });
            }
            fetchBillDetails(billId);
            fetchProducts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update quantity');
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!billId) return;
        try {
            await api.delete(`/bills/${billId}/items/${itemId}`);
            fetchBillDetails(billId);
            fetchProducts();
        } catch (err: any) {
            toast.error('Failed to remove item');
        }
    };

    const handleCheckoutInit = () => {
        if (!billId) return;
        setPaymentChoice(null);
        setStripeClientSecret(null);
        setShowAddressModal(true); // Show address modal first
        setCheckoutStep(1);
        setShowAddressModal(true);
        setShowPaymentModal(false);
    };

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowAddressModal(false);
        setCheckoutStep(2);
        setShowPaymentModal(true);
    };

    const handleOnlinePaymentInit = async () => {
        if (!billId) return;
        try {
            setPaymentChoice('STRIPE');
            const res = await api.post(`/bills/${billId}/payment-intent`);
            setStripeClientSecret(res.data.clientSecret);
        } catch (err: any) {
            toast.error('Failed to initialize online payment');
            setPaymentChoice(null);
        }
    };

    const handleCodPayment = async () => {
        if (!billId) return;
        try {
            await api.post(`/bills/${billId}/checkout`, { 
                paymentMethod: 'COD',
                address 
            });
            toast.success('Order placed successfully (Cash on Delivery)!');
            setShowPaymentModal(false);
            initializeBill();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to process COD order');
        }
    };

    const handleConfirmCheckout = async () => {
        if (!billId) return;
        console.log('Finalizing checkout for bill:', billId);
        try {
            const response = await api.post(`/bills/${billId}/checkout`, { 
                paymentMethod: 'Card',
                address 
            });
            console.log('Checkout response:', response.data);
            toast.success('Payment successful!');
            setShowPaymentModal(false);
            setPaymentChoice(null);
            setStripeClientSecret(null);
            initializeBill();
        } catch (err: any) {
            console.error('Checkout error:', err);
            toast.error(err.response?.data?.message || 'Failed to complete order');
            throw err; // Re-throw so StripePayment catch block catches it
        }
    };



/* Loading state removed here to allow skeletons to show in the list area */


    return (
        <div className="container mx-auto px-4 mt-8 pb-20 relative">
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-2xl mb-6 flex items-center space-x-2"
                >
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                </motion.div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-[var(--color-text)] tracking-tight mb-2">Marketplace</h2>
                    <p className="text-[var(--color-text-muted)] font-medium">Discover fresh products for your home</p>
                </div>
                
                <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 flex-1 justify-end">
                    <div className="relative w-full sm:w-96 group">
                        <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-focus-within:bg-emerald-500/10 transition-all rounded-full pointer-events-none" />
                        <div className="relative glass-card rounded-2xl flex items-center px-4 py-1">
                            <Search className="h-5 w-5 text-[var(--color-text-muted)] group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search fresh items... (Press / to focus)"
                                value={searchQuery}
                                onFocus={() => setShowSuggestions(true)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-[var(--color-text)] px-4 py-3.5 focus:outline-none font-medium"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="text-[var(--color-text-muted)] hover:text-rose-500 transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 w-full mt-3 glass-card rounded-2xl shadow-2xl z-[60] overflow-hidden backdrop-blur-xl"
                                >
                                    {suggestions.map(suggestion => (
                                        <div 
                                            key={suggestion.id}
                                            onClick={() => {
                                                setSearchQuery(suggestion.name);
                                                setShowSuggestions(false);
                                            }}
                                            className="px-5 py-4 hover:bg-emerald-500/5 cursor-pointer flex items-center justify-between group transition-colors border-b border-[var(--color-border)]/50 last:border-0"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                    <ShoppingBasket className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[var(--color-text)] font-bold">{suggestion.name}</p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">{suggestion.category}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-[var(--color-text-muted)] group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowWishlistOnly(!showWishlistOnly)}
                        className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 font-bold transition-all ${
                            showWishlistOnly 
                            ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/20' 
                            : 'glass-card border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-rose-500/30'
                        }`}
                    >
                        <Heart className={`h-5 w-5 ${showWishlistOnly ? 'fill-current' : ''}`} />
                        <span>{showWishlistOnly ? 'Wishlist Only' : 'My Wishlist'}</span>
                    </motion.button>
                </div>
            </div>

            {/* Category Section */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Categories</h3>
                </div>
                <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
                    {categories.map(cat => (
                        <motion.button
                            key={cat}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-3.5 rounded-2xl whitespace-nowrap font-bold transition-all border-2 ${
                                selectedCategory === cat 
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-600/30' 
                                : 'glass-card border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-emerald-500/30'
                            }`}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </div>
            </div>


            <div className="mt-4">
                {loading ? (
                    <ProductListSkeleton />
                ) : filteredProducts.length > 0 ? (
                    <ProductList 
                        products={filteredProducts} 
                        cartItems={billDetails?.bill?.items || []}
                        wishlist={wishlist}
                        onAddToCart={handleAddToCart} 
                        onUpdateQuantity={handleUpdateQuantity}
                        onProductClick={(product) => setSelectedProductForView(product)}
                        onToggleWishlist={toggleWishlist}
                    />
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 bg-[var(--color-surface)] rounded-[3rem] border-2 border-dashed border-[var(--color-border)]/50 overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
                        <div className="relative">
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="bg-emerald-500/10 p-8 rounded-full mb-6 text-emerald-400 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10"
                            >
                                <PackageSearch className="h-16 w-16" />
                            </motion.div>
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="absolute -top-2 -right-2 bg-rose-500 p-2 rounded-lg text-white shadow-lg"
                            >
                                <Search className="h-4 w-4" />
                            </motion.div>
                        </div>
                        <h3 className="text-2xl font-black text-[var(--color-text)] tracking-tight">No Items Found</h3>
                        <p className="text-[var(--color-text-muted)] mt-2 font-medium max-w-xs text-center">
                            We couldn't find any products matching "{searchQuery}". Try a different search or category!
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('All');
                            }}
                            className="mt-8 bg-white/5 hover:bg-white/10 text-[var(--color-text)] px-8 py-3 rounded-2xl font-bold border border-[var(--color-border)] transition-all"
                        >
                            Clear All Filters
                        </motion.button>
                    </motion.div>
                )}
            </div>


            {/* Floating Cart Button */}

            <Tooltip text="Open Cart" position="left">
                <motion.button 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={cartControls}
                    onUpdate={(latest) => {
                        if (typeof latest.scale === 'number' && latest.scale === 1) {
                             // This is just a fallback to ensure it's visible if not animating
                        }
                    }}
                    custom={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-8 right-8 bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all z-40 group"
                >
                    <motion.div animate={{ scale: 1, opacity: 1 }} initial={{ scale: 0, opacity: 0 }}>
                        <ShoppingBag className="h-7 w-7 group-hover:rotate-12 transition-transform" />
                        {billDetails?.bill?.items && billDetails.bill.items.length > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-[var(--color-background)]"
                            >
                                {billDetails.bill.items.length}
                            </motion.span>
                        )}
                    </motion.div>
                </motion.button>
            </Tooltip>


            {/* Floating Cart Drawer */}
            <AnimatePresence>
                {isCartOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative h-full w-full max-w-md bg-[var(--color-background)]/80 backdrop-blur-2xl border-l border-[var(--color-border)] shadow-2xl flex flex-col"
                        >
                            <div className="p-8 border-b border-[var(--color-border)] flex justify-between items-center glass-nav">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500">
                                        <ShoppingBag className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[var(--color-text)]">Your Cart</h3>
                                        <p className="text-xs text-[var(--color-text-muted)] font-medium">Review your fresh items</p>
                                    </div>
                                </div>
                                <motion.button 
                                    whileHover={{ rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsCartOpen(false)} 
                                    className="text-[var(--color-text-muted)] hover:text-rose-500 transition-colors bg-[var(--color-surface-hover)] p-3 rounded-2xl"
                                >
                                    <X className="h-6 w-6" />
                                </motion.button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                                <CartSummary 
                                    bill={billDetails?.bill || null} 
                                    onRemoveItem={handleRemoveItem}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onClose={() => setIsCartOpen(false)}
                                    onCheckout={() => {
                                        setIsCartOpen(false);
                                        handleCheckoutInit();
                                    }} 
                                />
                                {billDetails?.emi?.isEligible && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-8"
                                    >
                                        <EmiOptions 
                                            isEligible={billDetails?.emi?.isEligible} 
                                            options={billDetails?.emi?.options || []} 
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* Unified Checkout Modal */}
            <AnimatePresence>
                {(showAddressModal || showPaymentModal) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowAddressModal(false);
                                setShowPaymentModal(false);
                            }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-[var(--color-surface)] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header & Stepper */}
                            <div className="p-8 pb-0">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black text-[var(--color-text)] tracking-tight">Checkout</h3>
                                    <button 
                                        onClick={() => {
                                            setShowAddressModal(false);
                                            setShowPaymentModal(false);
                                        }} 
                                        className="bg-white/5 hover:bg-rose-500/20 text-[var(--color-text-muted)] hover:text-rose-500 p-2.5 rounded-2xl transition-all"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Progress Stepper */}
                                <div className="flex items-center justify-between mb-10 relative px-4">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
                                    <div 
                                        className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 transition-all duration-500 -translate-y-1/2 z-0" 
                                        style={{ width: checkoutStep === 1 ? '0%' : checkoutStep === 2 ? '50%' : '100%' }}
                                    />
                                    
                                    {[
                                        { step: 1, label: 'Address', icon: MapPin },
                                        { step: 2, label: 'Payment', icon: CreditCard },
                                        { step: 3, label: 'Confirm', icon: Truck }
                                    ].map((s) => (
                                        <div key={s.step} className="relative z-10 flex flex-col items-center group">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                                checkoutStep >= s.step 
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110' 
                                                : 'bg-slate-800 text-slate-500'
                                            }`}>
                                                <s.icon className="h-5 w-5" />
                                            </div>
                                            <span className={`text-[10px] uppercase tracking-widest font-black mt-3 transition-colors ${
                                                checkoutStep >= s.step ? 'text-emerald-500' : 'text-slate-500'
                                            }`}>
                                                {s.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 pt-0 overflow-y-auto custom-scrollbar flex-1">
                                {showAddressModal && (
                                    <motion.form 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onSubmit={handleAddressSubmit} 
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">House / Flat No.</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={address.houseNumber}
                                                    onChange={(e) => setAddress({ ...address, houseNumber: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 text-[var(--color-text)] px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                    placeholder="e.g. Flat 101"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Area / Colony</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={address.area}
                                                    onChange={(e) => setAddress({ ...address, area: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 text-[var(--color-text)] px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                    placeholder="e.g. Model Town"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Landmark (Optional)</label>
                                            <input
                                                type="text"
                                                value={address.landmark}
                                                onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 text-[var(--color-text)] px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                placeholder="e.g. Near City Mall"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">City</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={address.city}
                                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 text-[var(--color-text)] px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Pincode</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={address.pincode}
                                                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 text-[var(--color-text)] px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                    placeholder="123456"
                                                />
                                            </div>
                                        </div>
                                        
                                        <button
                                            type="submit"
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 mt-4 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group"
                                        >
                                            <span>Continue to Payment</span>
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </motion.form>
                                )}

                                {showPaymentModal && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6"
                                    >
                                        {!paymentChoice ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                <button 
                                                    onClick={handleOnlinePaymentInit}
                                                    className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group"
                                                >
                                                    <div className="flex items-center space-x-5">
                                                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg">
                                                            <CreditCard className="h-6 w-6" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-black text-lg text-[var(--color-text)] tracking-tight">Pay Online</p>
                                                            <p className="text-xs text-[var(--color-text-muted)] font-medium">Cards, UPI, GPay Secure Payment</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                                </button>

                                                <button 
                                                    onClick={handleCodPayment}
                                                    className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-amber-500 hover:bg-amber-500/5 transition-all group"
                                                >
                                                    <div className="flex items-center space-x-5">
                                                        <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-lg">
                                                            <Truck className="h-6 w-6" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-black text-lg text-[var(--color-text)] tracking-tight">Cash on Delivery</p>
                                                            <p className="text-xs text-[var(--color-text-muted)] font-medium">Pay when you receive the order</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                                </button>

                                                <button 
                                                    onClick={() => {
                                                        setShowPaymentModal(false);
                                                        setShowAddressModal(true);
                                                        setCheckoutStep(1);
                                                    }}
                                                    className="w-full py-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <ArrowRight className="h-4 w-4 rotate-180" />
                                                    <span>Back to Address</span>
                                                </button>
                                            </div>
                                        ) : paymentChoice === 'STRIPE' && stripeClientSecret ? (
                                            <div className="space-y-6">
                                                <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl flex items-center gap-4">
                                                    <div className="bg-emerald-500 p-2 rounded-lg text-white">
                                                        <CreditCard className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Secure Payment</p>
                                                        <p className="text-sm font-medium text-[var(--color-text)] opacity-80">Enter your card details below</p>
                                                    </div>
                                                </div>

                                                <Elements stripe={stripePromise} options={{ 
                                                    clientSecret: stripeClientSecret,
                                                    appearance: {
                                                        theme: 'night',
                                                        variables: {
                                                            colorPrimary: '#10b981',
                                                            colorBackground: '#1e293b',
                                                            colorText: '#f8fafc',
                                                            colorDanger: '#f43f5e',
                                                        }
                                                    }
                                                }}>
                                                    <StripePayment 
                                                        clientSecret={stripeClientSecret}
                                                        onSuccess={() => {
                                                            setCheckoutStep(3);
                                                            handleConfirmCheckout();
                                                        }}
                                                        onCancel={() => setPaymentChoice(null)}
                                                        address={address}
                                                    />
                                                </Elements>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="relative">
                                                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <CreditCard className="h-6 w-6 text-emerald-500 animate-pulse" />
                                                    </div>
                                                </div>
                                                <p className="text-[var(--color-text-muted)] mt-6 font-bold tracking-tight">Initializing Secure Checkout...</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Product Detail Modal */}
            {selectedProductForView && (
                <ProductDetailModal
                    product={selectedProductForView}
                    cartItem={(billDetails?.bill?.items || []).find(item => item.product.id === selectedProductForView.id)}
                    isWishlisted={wishlist.includes(selectedProductForView.id)}
                    onClose={() => setSelectedProductForView(null)}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onToggleWishlist={toggleWishlist}
                />
            )}
        </div>
    );
};

export default UserDashboard;
