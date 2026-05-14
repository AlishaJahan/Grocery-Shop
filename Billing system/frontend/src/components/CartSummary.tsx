import React from 'react';
import type { Bill } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ChevronRight,
    CheckCircle2,
    Truck,
    ArrowRight,
    Tag
} from 'lucide-react';

interface CartSummaryProps {
    bill: Bill | null;
    onRemoveItem: (itemId: number) => void;
    onUpdateQuantity: (productId: number, change: number) => void;
    onCheckout: () => void;
    onClose?: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ bill, onRemoveItem, onUpdateQuantity, onCheckout, onClose }) => {
    const BACKEND_URL = 'http://localhost:3000';

    if (!bill || !bill.items || bill.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500/5 p-8 rounded-full mb-6 border border-emerald-500/10"
                >
                    <ShoppingBag className="h-16 w-16 text-emerald-500 opacity-20" />
                </motion.div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Your cart is empty</h3>
                <p className="text-sm text-[var(--color-text-muted)] font-medium mb-10 max-w-[200px] mx-auto">
                    Looks like you haven't added anything to your cart yet.
                </p>

                {onClose && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 flex items-center space-x-2 group"
                    >
                        <span>Start Shopping</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                )}
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {bill.items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card bg-white/5 p-4 rounded-2xl border border-[var(--color-border)]/30 group hover:border-emerald-500/30 transition-all"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-xl bg-emerald-500/5 overflow-hidden border border-[var(--color-border)]/50 shrink-0">
                                    {item.product.imageUrl ? (
                                        <img
                                            src={`${BACKEND_URL}${item.product.imageUrl}`}
                                            alt={item.product.name}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-[var(--color-text-muted)]">
                                            <ShoppingBag className="h-6 w-6 opacity-20" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[var(--color-text)] font-bold text-sm truncate group-hover:text-emerald-400 transition-colors">{item.product.name}</h4>
                                    <p className="text-xs text-emerald-500 font-black mt-0.5">${item.priceAtPurchase.toLocaleString()}</p>

                                    <div className="flex items-center space-x-3 mt-2">
                                        <div className="flex items-center bg-[var(--color-surface)]/50 rounded-lg p-0.5 border border-[var(--color-border)]/50">
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => onUpdateQuantity(item.product.id, -1)}
                                                className="w-7 h-7 flex items-center justify-center text-[var(--color-text)] hover:text-rose-500 transition-colors"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </motion.button>
                                            <span className="text-xs font-bold text-[var(--color-text)] w-6 text-center">{item.quantity}</span>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => onUpdateQuantity(item.product.id, 1)}
                                                disabled={item.quantity >= 5 || item.quantity >= item.product.stock}
                                                className="w-7 h-7 flex items-center justify-center text-[var(--color-text)] hover:text-emerald-500 disabled:opacity-30 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </motion.button>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => onRemoveItem(item.id)}
                                            className="text-[var(--color-text-muted)] hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[var(--color-text)] font-black text-sm">${item.totalPrice.toLocaleString()}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="glass-card bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                    <span>Subtotal</span>
                    <span className="text-[var(--color-text)]">${bill.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                    <span>Tax ({(((bill as any).taxRate || 0.18) * 100).toFixed(0)}%)</span>
                    <span className="text-[var(--color-text)]">${bill.taxAmount.toFixed(2)}</span>
                </div>
                {bill.discountAmount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between text-xs font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 p-2 rounded-xl"
                    >
                        <div className="flex items-center space-x-2">
                            <Tag className="h-3 w-3" />
                            <span>Discount ({bill.discountPercentage}%)</span>
                        </div>
                        <span>-${bill.discountAmount.toFixed(2)}</span>
                    </motion.div>
                )}
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <span className="text-[var(--color-text-muted)]">Shipping</span>
                    {bill.shippingFee > 0 ? (
                        <span className="text-amber-500 font-black">${bill.shippingFee.toLocaleString()}</span>
                    ) : (
                        <span className="text-emerald-500 font-black bg-emerald-500/10 px-2 py-0.5 rounded-lg text-[10px]">Free</span>
                    )}
                </div>

                {bill.shippingFee > 0 && (
                    <div className="bg-amber-500/5 p-3 rounded-2xl border border-amber-500/10 mt-2">
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-tighter text-center">
                            Shop for ${(20 - bill.subTotal).toFixed(2)} more for FREE shipping!
                        </p>
                    </div>
                )}

                <div className="flex justify-between items-end pt-4 border-t border-[var(--color-border)]/50">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Grand Total</p>
                        <p className="text-3xl font-black text-emerald-500 tracking-tighter leading-none mt-1">
                            ${bill.grandTotal.toLocaleString()}
                        </p>
                    </div>
                    {bill.grandTotal > 40 && (
                        <div className="flex items-center space-x-1.5 text-emerald-500 mb-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">EMI Ready</span>
                        </div>
                    )}
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCheckout}
                disabled={bill.status === 'COMPLETED'}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center space-x-2 group"
            >
                <span>{bill.status === 'COMPLETED' ? 'Order Processed' : 'Proceed to Checkout'}</span>
                {bill.status !== 'COMPLETED' && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </motion.button>
        </div>
    );
};

export default CartSummary;

