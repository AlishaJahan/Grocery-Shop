export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    category?: string;
    imageUrl?: string;
    description?: string;
    brand?: string;
    unit?: string;
    createdAt: string;
}

export interface BillItem {
    id: number;
    product: Product;
    quantity: number;
    priceAtPurchase: number;
    totalPrice: number;
}

export interface Bill {
    id: number;
    subTotal: number;
    taxAmount: number;
    discountAmount: number;
    discountPercentage: number;
    shippingFee: number;
    refundAmount: number;
    grandTotal: number;
    status: string;
    items: BillItem[];
    paymentMethod?: string;
    houseNumber?: string;
    area?: string;
    landmark?: string;
    city?: string;
    pincode?: string;
    createdAt: string;
}

export interface EmiOption {
    months: number;
    emiPerMonth: number;
    totalPayable: number;
}

export interface BillDetails {
    bill: Bill;
    emi: {
        isEligible: boolean;
        options: EmiOption[];
    }
}
