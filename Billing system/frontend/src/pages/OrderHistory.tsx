import { useState, useEffect } from 'react';
import api from '../api';
import type { Bill } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import OrderTrackingModal from '../components/OrderTrackingModal';
import { motion } from 'framer-motion';
import { HistoryListSkeleton } from '../components/HistorySkeleton';
import {
    ShoppingBag,
    Calendar,
    MapPin,
    Clock,
    CreditCard,
    ArrowRight,
    Ban,
    Truck,
    Receipt,
    Package,
    AlertCircle
} from 'lucide-react';

const OrderHistory = () => {
    const [orders, setOrders] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/bills/history');
                setOrders(res.data.data);
            } catch (err) {
                console.error('Failed to fetch order history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleCancelOrder = async () => {
        if (!selectedOrderId) return;

        try {
            await api.post(`/bills/${selectedOrderId}/cancel`);
            const res = await api.get('/bills/history');
            setOrders(res.data.data);
            setShowCancelModal(false);
            setSelectedOrderId(null);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to cancel order');
        }
    };

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
        <div className="container mx-auto px-4 mt-8 pb-20">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10"
            >
                <h2 className="text-4xl font-bold text-[var(--color-text)] tracking-tight mb-2">Purchase History</h2>
                <p className="text-[var(--color-text-muted)] font-medium">Keep track of your fresh grocery orders</p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8"
            >
                {loading ? (
                    <HistoryListSkeleton />
                ) : orders.map((order) => (
                    <motion.div
                        key={order.id}
                        variants={item}
                        className="glass-card rounded-3xl overflow-hidden shadow-xl"
                    >
                        <div className="bg-emerald-500/5 px-8 py-6 flex flex-wrap justify-between items-center gap-4 border-b border-[var(--color-border)]">
                            <div className="flex items-center space-x-4">
                                <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest font-black">Order ID: #{order.id}</p>
                                    <div className="flex items-center space-x-2 text-[var(--color-text-muted)] text-sm font-medium">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        <Clock className="h-4 w-4 ml-1" />
                                        <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                            order.status === 'CANCELLED' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' :
                                                'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <div className="flex items-center justify-end space-x-1 mt-1.5 text-emerald-500 font-bold text-sm">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        <span>{order.paymentMethod}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {order.status !== 'CANCELLED' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowTrackingModal(true);
                                            }}
                                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all border border-emerald-500/20 flex items-center space-x-2"
                                        >
                                            <Truck className="h-4 w-4" />
                                            <span>Track Order</span>
                                        </motion.button>
                                    )}
                                    {order.status === 'PROCESSING' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setSelectedOrderId(order.id);
                                                setShowCancelModal(true);
                                            }}
                                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all border border-rose-500/20 flex items-center space-x-2"
                                        >
                                            <Ban className="h-4 w-4" />
                                            <span>Cancel</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-1">
                                <div className="flex items-center space-x-2 mb-4">
                                    <MapPin className="h-4 w-4 text-emerald-500" />
                                    <h4 className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest font-black">Delivery Address</h4>
                                </div>
                                <div className="glass-card bg-white/5 p-5 rounded-2xl border border-[var(--color-border)]/30 text-sm text-[var(--color-text)]">
                                    {order.houseNumber ? (
                                        <div className="space-y-1.5">
                                            <p className="font-bold text-lg">{order.houseNumber}</p>
                                            <p className="font-medium opacity-80">{order.area}</p>
                                            {order.landmark && (
                                                <div className="flex items-start space-x-2 text-xs opacity-60 italic mt-2">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    <p>Landmark: {order.landmark}</p>
                                                </div>
                                            )}
                                            <p className="font-bold mt-2 text-emerald-500">{order.city} - {order.pincode}</p>
                                        </div>
                                    ) : (
                                        <p className="italic text-[var(--color-text-muted)] font-medium">Walk-in Order / Store Pickup</p>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Receipt className="h-4 w-4 text-emerald-500" />
                                    <h4 className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest font-black">Order Summary</h4>
                                </div>
                                <div className="overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-widest border-b border-[var(--color-border)]/30">
                                                <th className="pb-4 font-black">Item Description</th>
                                                <th className="pb-4 text-center font-black">Qty</th>
                                                <th className="pb-4 text-right font-black">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[var(--color-text)] text-sm">
                                            {order.items.map((item: any) => (
                                                <tr key={item.id} className="group">
                                                    <td className="py-4 font-bold group-hover:text-emerald-400 transition-colors">{item.product?.name || 'Deleted Product'}</td>
                                                    <td className="py-4 text-center font-medium opacity-70">x{item.quantity}</td>
                                                    <td className="py-4 text-right font-black text-emerald-500">${item.totalPrice.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 px-8 py-6 border-t border-[var(--color-border)]/50 flex flex-wrap justify-between items-center gap-6">
                            {order.status === 'CANCELLED' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-3xl max-w-md"
                                >
                                    <div className="flex items-center space-x-2 text-rose-500 mb-2">
                                        <Ban className="h-4 w-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Refund Processed</p>
                                    </div>
                                    <p className="text-[var(--color-text)] text-sm font-medium">A refund of <span className="text-rose-500 font-black text-xl">${order.refundAmount.toFixed(2)}</span> has been credited back to your account.</p>
                                </motion.div>
                            )}
                            <div className="text-right space-y-2 ml-auto w-full sm:w-64">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-[var(--color-text-muted)]">Subtotal</span>
                                    <span className="text-[var(--color-text)]">${order.subTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-[var(--color-text-muted)]">VAT / Tax ({((order as any).taxRate * 100).toFixed(0)}%)</span>
                                    <span className="text-[var(--color-text)]">${order.taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]/30">
                                    <span className="text-lg font-bold text-[var(--color-text)]">Grand Total</span>
                                    <span className="text-3xl font-black text-emerald-500 tracking-tighter">${order.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {!loading && orders.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 glass-card rounded-3xl border-2 border-dashed border-[var(--color-border)]/50"
                    >
                        <div className="bg-emerald-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500/30">
                            <ShoppingBag className="h-12 w-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">No orders found</h3>
                        <p className="text-[var(--color-text-muted)] font-medium mb-8">Start shopping to see your purchase history here!</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = '/'}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 flex items-center space-x-2 mx-auto"
                        >
                            <span>Browse Marketplace</span>
                            <ArrowRight className="h-5 w-5" />
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>

            <ConfirmModal
                isOpen={showCancelModal}
                title="Cancel Order"
                message="Are you sure you want to cancel this order? Please note that tax and shipping charges are non-refundable."
                confirmText="Yes, Cancel Order"
                cancelText="No, Keep Order"
                onConfirm={handleCancelOrder}
                onCancel={() => {
                    setShowCancelModal(false);
                    setSelectedOrderId(null);
                }}
                isDanger={true}
            />

            {showTrackingModal && selectedOrder && (
                <OrderTrackingModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowTrackingModal(false);
                        setSelectedOrder(null);
                    }}
                />
            )}
        </div>
    );
};

export default OrderHistory;
