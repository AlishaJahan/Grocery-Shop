import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
    const [show, setShow] = useState(false);

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
        left: 'right-full top-1/2 -translate-y-1/2 mr-3',
        right: 'left-full top-1/2 -translate-y-1/2 ml-3'
    };

    const arrows = {
        top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-[var(--color-text)]',
        bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-b-[var(--color-text)]',
        left: 'right-[-6px] top-1/2 -translate-y-1/2 border-l-[var(--color-text)]',
        right: 'left-[-6px] top-1/2 -translate-y-1/2 border-r-[var(--color-text)]'
    };

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0, x: position === 'left' ? 10 : position === 'right' ? -10 : 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0, x: position === 'left' ? 10 : position === 'right' ? -10 : 0 }}
                        className={`absolute z-[100] px-3 py-2 rounded-xl bg-[var(--color-text)] text-[var(--color-background)] text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-2xl border border-white/10 pointer-events-none ${positions[position]}`}
                    >
                        {text}
                        <div className={`absolute w-0 h-0 border-4 border-transparent ${arrows[position]}`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
