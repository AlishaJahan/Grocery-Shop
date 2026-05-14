import React from 'react';
import type { Product, BillItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Heart,
    ShoppingBag,
    Plus,
    Minus,
    Info,
    CheckCircle2,
    AlertCircle,
    ArrowRight
} from 'lucide-react';

interface ProductDetailModalProps {
    product: Product;
    cartItem?: BillItem;
    onClose: () => void;
    onAddToCart: (productId: number) => void;
    onUpdateQuantity: (productId: number, change: number) => void;
    onToggleWishlist: (productId: number) => void;
    isWishlisted: boolean;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    product,
    cartItem,
    onClose,
    onAddToCart,
    onUpdateQuantity,
    onToggleWishlist,
    isWishlisted
}) => {
    const BACKEND_URL = 'http://localhost:3000';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass-card w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row relative"
            >
                {/* Close Button */}
                <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 bg-white/10 hover:bg-rose-500 text-white p-3 rounded-2xl backdrop-blur-xl transition-colors border border-white/10"
                >
                    <X className="h-6 w-6" />
                </motion.button>

                {/* Left: Image Section */}
                <div className="w-full md:w-1/2 bg-emerald-500/5 flex items-center justify-center p-12 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50" />
                    {product.imageUrl ? (
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            src={`${BACKEND_URL}${product.imageUrl}`}
                            alt={product.name}
                            className="max-h-[400px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <ShoppingBag className="h-40 w-40 text-emerald-500/10" />
                    )}

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onToggleWishlist(product.id)}
                        className={`absolute top-6 left-6 p-4 rounded-2xl backdrop-blur-xl transition-all border ${isWishlisted
                                ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/20'
                                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
                    </motion.button>
                </div>

                {/* Right: Info Section */}
                <div className="w-full md:w-1/2 p-10 flex flex-col bg-[var(--color-background)]/50">
                    <div className="mb-8">
                        <motion.span
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full mb-6 inline-block border border-emerald-500/20"
                        >
                            {product.category || 'Fresh Category'}
                        </motion.span>
                        <h2 className="text-4xl font-black text-[var(--color-text)] mb-3 leading-none tracking-tight">{product.name}</h2>
                        {product.brand && (
                            <p className="text-[var(--color-text-muted)] font-bold text-lg">By <span className="text-emerald-500">{product.brand}</span></p>
                        )}
                    </div>

                    <div className="flex items-center space-x-6 mb-8 p-6 glass-card bg-white/5 rounded-3xl border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Price</span>
                            <span className="text-4xl font-black text-emerald-500 tracking-tighter">${product.price.toLocaleString()}</span>
                        </div>
                        {product.unit && (
                            <div className="h-10 w-px bg-white/10" />
                        )}
                        {product.unit && (
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Unit</span>
                                <span className="text-xl font-bold text-[var(--color-text)] opacity-60">{product.unit}</span>
                            </div>
                        )}
                    </div>

                    <div className="mb-10 flex-1">
                        <div className="flex items-center space-x-2 mb-3 text-[var(--color-text-muted)]">
                            <Info className="h-4 w-4" />
                            <h4 className="text-xs font-black uppercase tracking-widest">Description</h4>
                        </div>
                        <p className="text-[var(--color-text)] leading-relaxed font-medium opacity-70">
                            {product.description || "Indulge in the freshness of our handpicked products. Guaranteed quality and taste for your healthy lifestyle."}
                        </p>
                    </div>

                    <div className="mt-auto space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center space-x-2">
                                {product.stock > 10 ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                )}
                                <span className={`text-sm font-bold uppercase tracking-wider ${product.stock > 10 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Limited Stock' : 'Out of Stock'}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-[var(--color-text-muted)]">{product.stock} items available</span>
                        </div>

                        {cartItem ? (
                            <div className="flex items-center gap-4">
                                <div className="flex-1 flex items-center justify-between bg-white/5 rounded-2xl p-1.5 border border-white/10">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onUpdateQuantity(product.id, -1)}
                                        className="w-12 h-12 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                    >
                                        <Minus className="h-6 w-6" />
                                    </motion.button>
                                    <span className="font-black text-[var(--color-text)] text-2xl">{cartItem.quantity}</span>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onUpdateQuantity(product.id, 1)}
                                        disabled={cartItem.quantity >= 5 || cartItem.quantity >= product.stock}
                                        className="w-12 h-12 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-20 rounded-xl transition-all"
                                    >
                                        <Plus className="h-6 w-6" />
                                    </motion.button>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/20"
                                >
                                    Done
                                </motion.button>
                            </div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onAddToCart(product.id)}
                                disabled={product.stock <= 0}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-2xl shadow-emerald-600/30 text-xl flex items-center justify-center space-x-3 group"
                            >
                                <ShoppingBag className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                <span>Add to Cart</span>
                                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProductDetailModal;
