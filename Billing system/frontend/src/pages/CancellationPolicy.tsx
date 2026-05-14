import React from 'react';
import { Link } from 'react-router-dom';

const CancellationPolicy = () => {
    return (
        <div className="container mx-auto px-4 mt-12 pb-12">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center space-x-4 mb-8">
                    <Link to="/profile" className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h1 className="text-4xl font-bold text-[var(--color-text)] tracking-tight">Cancellation Policy</h1>
                </div>

                <div className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] shadow-2xl space-y-8">
                    <section className="space-y-4">
                        <div className="flex items-center space-x-3 text-emerald-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-bold uppercase tracking-widest">Cancellation Window</h2>
                        </div>
                        <p className="text-[var(--color-text-muted)] leading-relaxed">
                            You can cancel your order as long as it is in the <span className="text-blue-400 font-bold">Processing</span> or <span className="text-amber-400 font-bold">Pending</span> state. This means the order has been placed but the final delivery has not yet been completed.
                        </p>
                        <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-lg mt-4">
                            <p className="text-emerald-400 font-medium">Once an order is marked as <span className="font-black underline">Delivered (Completed)</span>, it can no longer be cancelled.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center space-x-3 text-rose-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-bold uppercase tracking-widest">Refund Policy</h2>
                        </div>
                        <p className="text-[var(--color-text-muted)] leading-relaxed">
                            If you cancel an eligible order, the refund will be calculated as follows:
                        </p>
                        <ul className="space-y-3 list-none">
                            <li className="flex items-start space-x-3">
                                <span className="text-emerald-500 mt-1">✓</span>
                                <span className="text-[var(--color-text)]"><span className="font-bold">Full Refund</span> for all product costs and applied discounts.</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <span className="text-rose-500 mt-1">✕</span>
                                <span className="text-[var(--color-text)]"><span className="font-bold text-rose-400">Non-Refundable:</span> Tax charges and Shipping fees are not included in the refund amount.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center space-x-3 text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-bold uppercase tracking-widest">How to Cancel</h2>
                        </div>
                        <ol className="list-decimal list-inside space-y-2 text-[var(--color-text-muted)]">
                            <li>Go to your <Link to="/history" className="text-emerald-400 hover:underline">Order History</Link>.</li>
                            <li>Locate the order you wish to cancel.</li>
                            <li>If it is still eligible, you will see a <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">Cancel Order</span> button.</li>
                            <li>Confirm the cancellation in the popup that appears.</li>
                        </ol>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CancellationPolicy;
