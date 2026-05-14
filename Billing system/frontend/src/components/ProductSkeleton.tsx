import React from 'react';
import { motion } from 'framer-motion';

const ProductSkeleton = () => {
    return (
        <div className="glass-card rounded-3xl p-5 border border-white/5 relative overflow-hidden h-full flex flex-col">
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />

            {/* Image Placeholder */}
            <div className="h-48 w-full bg-[var(--color-surface-hover)] rounded-2xl mb-4 relative overflow-hidden" />

            {/* Title & Category Placeholder */}
            <div className="space-y-3 flex-1">
                <div className="h-4 w-3/4 bg-[var(--color-surface-hover)] rounded-lg" />
                <div className="h-3 w-1/2 bg-[var(--color-surface-hover)] rounded-lg opacity-50" />
            </div>

            {/* Footer Placeholder */}
            <div className="mt-6 flex items-center justify-between">
                <div className="h-6 w-16 bg-[var(--color-surface-hover)] rounded-lg" />
                <div className="h-10 w-24 bg-[var(--color-surface-hover)] rounded-xl" />
            </div>
        </div>
    );
};

export const ProductListSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <ProductSkeleton />
                </motion.div>
            ))}
        </div>
    );
};

export default ProductSkeleton;
