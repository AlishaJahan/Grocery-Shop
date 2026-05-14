export const TAX_RATE = 0.18; // 18% GST
export const EMI_THRESHOLD = 100;
export const EMI_INTEREST_RATE_PA = 10; // 10% per annum
export const DISCOUNT_THRESHOLD = 50;
export const DISCOUNT_RATE = 0.10; // 10%
export const SHIPPING_THRESHOLD = 20; // Free shipping above $20
export const SHIPPING_FEE = 5; // $5 shipping fee

export interface EmiOption {
    months: number;
    emiPerMonth: number;
    totalPayable: number;
}

export const calculateEmiOptions = (principal: number): EmiOption[] => {
    const R = (EMI_INTEREST_RATE_PA / 12) / 100;
    const tenures = [3, 6, 9];

    return tenures.map((months) => {
        const emi = (principal * R * Math.pow(1 + R, months)) / (Math.pow(1 + R, months) - 1);
        const totalAmount = emi * months;
        return {
            months,
            emiPerMonth: Math.round(emi),
            totalPayable: Math.round(totalAmount),
        };
    });
};
