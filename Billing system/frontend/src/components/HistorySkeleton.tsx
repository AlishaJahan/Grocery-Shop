import React from 'react';
import { motion } from 'framer-motion';

const HistorySkeleton = () => {
    return (
        <div className="glass-card rounded-3xl overflow-hidden shadow-xl relative">
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />

            {/* Header Placeholder */}
            <div className="bg-emerald-500/5 px-8 py-6 flex justify-between items-center border-b border-[var(--color-border)]">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[var(--color-surface-hover)] rounded-2xl" />
                    <div className="space-y-2">
                        <div className="h-3 w-32 bg-[var(--color-surface-hover)] rounded-lg" />
                        <div className="h-4 w-48 bg-[var(--color-surface-hover)] rounded-lg opacity-50" />
                    </div>
                </div>
                <div className="h-8 w-24 bg-[var(--color-surface-hover)] rounded-full" />
            </div>

            {/* Body Placeholder */}
            <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-4">
                    <div className="h-4 w-32 bg-[var(--color-surface-hover)] rounded-lg" />
                    <div className="h-32 w-full bg-[var(--color-surface-hover)] rounded-2xl" />
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <div className="h-4 w-32 bg-[var(--color-surface-hover)] rounded-lg" />
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-4 w-1/2 bg-[var(--color-surface-hover)] rounded-lg" />
                                <div className="h-4 w-16 bg-[var(--color-surface-hover)] rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const HistoryListSkeleton = () => {
    return (
        <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <HistorySkeleton />
                </motion.div>
            ))}
        </div>
    );
};

export default HistorySkeleton;
