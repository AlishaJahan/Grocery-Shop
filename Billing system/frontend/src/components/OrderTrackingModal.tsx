import React from 'react';

interface TrackingStep {
    label: string;
    description: string;
    status: 'completed' | 'current' | 'pending' | 'cancelled';
    date?: string;
    icon: React.ReactNode;
}

interface OrderTrackingModalProps {
    order: any;
    onClose: () => void;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
    const getSteps = (): TrackingStep[] => {
        const isCancelled = order.status === 'CANCELLED';
        const steps: TrackingStep[] = [
            {
                label: 'Order Placed',
                description: 'We have received your order.',
                status: 'completed',
                date: new Date(order.createdAt).toLocaleString(),
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                )
            },
            {
                label: 'Processing',
                description: 'Your order is being prepared.',
                status: isCancelled && !order.processingAt ? 'cancelled' : 
                        order.processingAt || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'COMPLETED' ? 'completed' : 'pending',
                date: order.processingAt ? new Date(order.processingAt).toLocaleString() : undefined,
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                )
            },
            {
                label: 'Shipped',
                description: 'Your order is on the way.',
                status: isCancelled && !order.shippedAt ? 'cancelled' :
                        order.shippedAt || order.status === 'SHIPPED' || order.status === 'COMPLETED' ? 'completed' : 'pending',
                date: order.shippedAt ? new Date(order.shippedAt).toLocaleString() : undefined,
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                )
            },
            {
                label: 'Delivered',
                description: 'Package has been delivered.',
                status: isCancelled && !order.deliveredAt ? 'cancelled' :
                        order.status === 'COMPLETED' ? 'completed' : 'pending',
                date: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : undefined,
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            }
        ];

        if (isCancelled) {
            steps.push({
                label: 'Cancelled',
                description: 'Order was cancelled.',
                status: 'cancelled',
                date: new Date().toLocaleString(), // Approximate if not stored
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            });
        }

        return steps;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[var(--color-surface)] w-full max-w-2xl rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-transparent">
                    <div>
                        <h3 className="text-2xl font-black text-[var(--color-text)]">Track Order #{order.id}</h3>
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-surface-hover)] rounded-full transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8">
                    <div className="relative">
                        {/* Stepper Vertical Line */}
                        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-[var(--color-border)]"></div>

                        <div className="space-y-8">
                            {getSteps().map((step, index) => (
                                <div key={index} className="relative flex items-start group">
                                    {/* Icon / Circle */}
                                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                                        step.status === 'completed' ? 'bg-emerald-500 border-emerald-500/20 text-white shadow-lg shadow-emerald-500/30' :
                                        step.status === 'current' ? 'bg-[var(--color-surface)] border-emerald-500 text-emerald-500' :
                                        step.status === 'cancelled' ? 'bg-rose-500 border-rose-500/20 text-white shadow-lg shadow-rose-500/30' :
                                        'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                                    }`}>
                                        {step.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="ml-6 pt-1">
                                        <h4 className={`text-lg font-black tracking-tight ${
                                            step.status === 'completed' ? 'text-emerald-400' :
                                            step.status === 'cancelled' ? 'text-rose-400' :
                                            'text-[var(--color-text)]'
                                        }`}>
                                            {step.label}
                                        </h4>
                                        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">{step.description}</p>
                                        {step.date && (
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/60 mt-2 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {step.date}
                                            </p>
                                        )}
                                    </div>

                                    {/* Vertical Line Connector (Active state) */}
                                    {index < getSteps().length - 1 && step.status === 'completed' && (
                                        <div className="absolute left-6 top-12 h-8 w-0.5 bg-emerald-500 z-0"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-[var(--color-surface-hover)]/30 border-t border-[var(--color-border)] flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Shipping To</p>
                            <p className="text-xs font-bold text-[var(--color-text)]">{order.houseNumber}, {order.area}, {order.city}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingModal;
