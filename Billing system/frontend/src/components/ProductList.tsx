import React from 'react';
import type { Product, BillItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Plus, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProductListProps {
    products: Product[];
    cartItems: BillItem[];
    onAddToCart: (productId: number) => void;
    onUpdateQuantity: (productId: number, change: number) => void;
    onProductClick: (product: Product) => void;
    onToggleWishlist: (productId: number) => void;
    wishlist: number[];
}

const ProductList: React.FC<ProductListProps> = ({ products, cartItems, onAddToCart, onUpdateQuantity, onProductClick, onToggleWishlist, wishlist }) => {
    const BACKEND_URL = 'http://localhost:3000';

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            {products.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                const cartItem = cartItems.find(item => item.product.id === product.id);
                return (
                    <motion.div
                        key={product.id}
                        variants={item}
                        whileHover={{
                            y: -10,
                            scale: 1.02,
                            boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.15)"
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onClick={() => onProductClick(product)}
                        className="glass-card glass-glow rounded-3xl p-4 shadow-lg transition-all flex flex-col h-full cursor-pointer group relative overflow-hidden"
                    >
                        {/* Wishlist Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleWishlist(product.id);
                            }}
                            className={`absolute top-4 right-4 z-10 p-2.5 rounded-2xl backdrop-blur-md transition-all ${isWishlisted
                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                }`}
                        >
                            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                        </motion.button>

                        {/* Product Image */}
                        <div className="w-full aspect-[4/3] bg-[var(--color-surface-hover)]/30 rounded-2xl mb-4 flex items-center justify-center text-[var(--color-text-muted)] border border-[var(--color-border)]/50 overflow-hidden relative">
                            {product.imageUrl ? (
                                <img
                                    src={`${BACKEND_URL}${product.imageUrl}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                />
                            ) : (
                                <ShoppingBag className="h-12 w-12 opacity-10" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex-1 flex flex-col px-1">
                            <div className="mb-2">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    {product.category || 'Grocery'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">{product.name}</h3>

                            <div className="flex justify-between items-center mb-4 mt-auto">
                                <span className="text-xl font-bold text-[var(--color-text)]">${product.price.toLocaleString('en-US')}</span>
                                {product.stock > 10 ? (
                                    <div className="flex items-center space-x-1 text-emerald-500">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span className="text-xs font-bold uppercase">In Stock</span>
                                    </div>
                                ) : product.stock > 0 ? (
                                    <div className="flex items-center space-x-1 text-amber-500">
                                        <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
                                        <span className="text-xs font-bold uppercase">Limited</span>
                                    </div>
                                ) : (
                                    <span className="text-xs font-bold text-slate-500 uppercase">Out of Stock</span>
                                )}
                            </div>

                            {cartItem ? (
                                <div className="flex items-center justify-between bg-emerald-500/5 rounded-2xl p-1.5 border border-emerald-500/20">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateQuantity(product.id, -1);
                                        }}
                                        className="w-9 h-9 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </motion.button>
                                    <span className="font-bold text-[var(--color-text)] text-lg">{cartItem.quantity}</span>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateQuantity(product.id, 1);
                                        }}
                                        disabled={cartItem.quantity >= 5 || cartItem.quantity >= product.stock}
                                        className="w-9 h-9 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-50 rounded-xl transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </motion.button>
                                </div>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToCart(product.id);
                                    }}
                                    disabled={product.stock <= 0}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800/50 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center space-x-2"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>Add to Cart</span>
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default ProductList;

