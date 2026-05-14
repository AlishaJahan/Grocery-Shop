import React from 'react';
import type { EmiOption } from '../types';

interface EmiOptionsProps {
    isEligible: boolean;
    options: EmiOption[] | null;
}

const EmiOptions: React.FC<EmiOptionsProps> = ({ isEligible, options }) => {
    if (!isEligible || !options) {
        return null;
    }

    return (
        <div className="bg-[var(--color-surface)] rounded-2xl p-6 shadow-2xl border border-[var(--color-border)] mt-6 animate-fade-in-up overflow-hidden relative group">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
            
            <div className="flex items-center space-x-3 mb-6 border-b border-[var(--color-border)] pb-4 relative z-10">
                <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[var(--color-text)]">Flexible EMI Plans</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Buy now, pay in easy installments</p>
                </div>
            </div>
            
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-6 relative z-10">
                <p className="text-sm text-emerald-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Eligible! Your order is over <span className="font-bold mx-1">$100</span>.
                </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 relative z-10">
                {options.map((option) => (
                    <div 
                        key={option.months} 
                        className="bg-[var(--color-surface-hover)] rounded-xl p-4 border border-[var(--color-border)] hover:border-emerald-500/50 hover:bg-[var(--color-surface)] transition-all duration-300 cursor-pointer group/item hover:shadow-lg hover:shadow-emerald-500/5"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[var(--color-text)] font-semibold flex items-center">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 opacity-0 group-hover/item:opacity-100 transition-opacity"></span>
                                {option.months} Months Plan
                            </span>
                            <span className="text-emerald-400 font-black text-xl">${option.emiPerMonth?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || 0}<span className="text-xs font-normal text-[var(--color-text-muted)] ml-1">/mo</span></span>
                        </div>
                        <div className="flex justify-between text-[var(--color-text-muted)] text-xs font-medium">
                            <span>Interest Rate: 10% p.a.</span>
                            <span>Total: ${option.totalPayable?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || 0}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmiOptions;
