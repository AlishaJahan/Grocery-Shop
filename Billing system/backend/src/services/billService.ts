import { AppDataSource } from '../config/database';
import { Bill } from '../entities/Bill';
import { BillItem } from '../entities/BillItem';
import { Product } from '../entities/Product';
import { User } from '../entities/User';
import { Not, In } from 'typeorm';
import { BILLING_CONFIG } from '../config/billing';

export class BillService {
    private billRepository = AppDataSource.getRepository(Bill);
    private billItemRepository = AppDataSource.getRepository(BillItem);
    private productRepository = AppDataSource.getRepository(Product);

    async createBill(userId?: number) {
        const bill = new Bill();
        if (userId) {
            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOneBy({ id: userId });
            if (user) bill.user = user;
        }
        return await this.billRepository.save(bill);
    }

    async addItemToBill(billId: number, productId: number, quantity: number) {
        const bill = await this.billRepository.findOne({ where: { id: billId }, relations: ['items'] });
        const product = await this.productRepository.findOneBy({ id: productId });

        if (!bill || !product) throw new Error('Bill or Product not found');
        if (product.stock < quantity) throw new Error('Insufficient stock');

        let billItem = await this.billItemRepository.findOne({
            where: { bill: { id: billId }, product: { id: productId } }
        });

        if (billItem) {
            billItem.quantity += quantity;
            if (billItem.quantity <= 0) {
                await this.billItemRepository.remove(billItem);
                return await this.calculateTotals(billId);
            }
            billItem.totalPrice = billItem.quantity * product.price;
        } else {
            if (quantity <= 0) return await this.calculateTotals(billId);
            billItem = new BillItem();
            billItem.bill = bill;
            billItem.product = product;
            billItem.quantity = quantity;
            billItem.priceAtPurchase = product.price;
            billItem.totalPrice = quantity * product.price;
        }

        await this.billItemRepository.save(billItem);
        return await this.calculateTotals(billId);
    }

    async updateItemQuantity(billId: number, productId: number, quantity: number) {
        const billItem = await this.billItemRepository.findOne({
            where: { bill: { id: billId }, product: { id: productId } }
        });

        if (!billItem) throw new Error('Item not found in bill');

        if (quantity <= 0) {
            await this.billItemRepository.remove(billItem);
        } else {
            const product = await this.productRepository.findOneBy({ id: productId });
            if (!product || product.stock < quantity) throw new Error('Insufficient stock');
            billItem.quantity = quantity;
            billItem.totalPrice = quantity * billItem.priceAtPurchase;
            await this.billItemRepository.save(billItem);
        }

        return await this.calculateTotals(billId);
    }

    async calculateTotals(billId: number) {
        const bill = await this.billRepository.findOne({ where: { id: billId }, relations: ['items', 'items.product'] });
        if (!bill) throw new Error('Bill not found');

        const subTotal = bill.items.reduce((sum, item) => sum + item.totalPrice, 0);
        bill.subTotal = subTotal;
        
        if (subTotal > BILLING_CONFIG.DISCOUNT_THRESHOLD) {
            bill.discountPercentage = BILLING_CONFIG.DISCOUNT_PERCENTAGE * 100;
            bill.discountAmount = subTotal * BILLING_CONFIG.DISCOUNT_PERCENTAGE;
        } else {
            bill.discountPercentage = 0;
            bill.discountAmount = 0;
        }

        bill.taxRate = BILLING_CONFIG.TAX_RATE;
        bill.taxAmount = (subTotal - bill.discountAmount) * BILLING_CONFIG.TAX_RATE;
        bill.shippingFee = subTotal > BILLING_CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : BILLING_CONFIG.SHIPPING_FEE;
        bill.grandTotal = subTotal - bill.discountAmount + bill.taxAmount + bill.shippingFee;

        return await this.billRepository.save(bill);
    }

    async completeBill(billId: number, paymentMethod: string, addressData?: any) {
        const bill = await this.billRepository.findOne({ where: { id: billId }, relations: ['items', 'items.product'] });
        if (!bill) throw new Error('Bill not found');
        if (bill.items.length === 0) throw new Error('Bill is empty');

        for (const item of bill.items) {
            item.product.stock -= item.quantity;
            await this.productRepository.save(item.product);
        }

        bill.status = 'PROCESSING';
        bill.paymentMethod = paymentMethod;
        
        if (addressData) {
            bill.houseNumber = addressData.houseNumber;
            bill.area = addressData.area;
            bill.landmark = addressData.landmark;
            bill.city = addressData.city;
            bill.pincode = addressData.pincode;
        }

        return await this.billRepository.save(bill);
    }

    async getBillById(billId: number) {
        return await this.billRepository.findOne({
            where: { id: billId },
            relations: ['items', 'items.product', 'user']
        });
    }

    async getUserHistory(userId: number) {
        return await this.billRepository.find({
            where: { user: { id: userId }, status: Not(In(['DRAFT'])) },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' }
        });
    }

    async getAdminHistory(page: number = 1, limit: number = 20) {
        const [data, total] = await this.billRepository.findAndCount({
            where: { status: Not(In(['DRAFT'])) },
            relations: ['items', 'items.product', 'user'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: (page - 1) * limit
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async updateBillStatus(billId: number, status: string) {
        const bill = await this.billRepository.findOneBy({ id: billId });
        if (!bill) throw new Error('Bill not found');
        
        bill.status = status;
        
        if (status === 'PROCESSING') bill.processingAt = new Date();
        if (status === 'SHIPPED') bill.shippedAt = new Date();
        if (status === 'COMPLETED') bill.deliveredAt = new Date();
        
        return await this.billRepository.save(bill);
    }

    async getSalesStats() {
        const bills = await this.billRepository.find({ where: { status: 'COMPLETED' } });
        const totalRevenue = bills.reduce((sum, b) => sum + b.grandTotal, 0);
        const totalOrders = bills.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return { totalRevenue, totalOrders, avgOrderValue };
    }

    async getBillDetails(billId: number) {
        const bill = await this.getBillById(billId);
        if (!bill) throw new Error('Bill not found');

        return {
            bill,
            emi: {
                isEligible: bill.grandTotal > BILLING_CONFIG.MIN_EMI_ELIGIBILITY,
                options: bill.grandTotal > BILLING_CONFIG.MIN_EMI_ELIGIBILITY ? [
                    { months: 3, emiPerMonth: bill.grandTotal / 3, totalPayable: bill.grandTotal },
                    { months: 6, emiPerMonth: bill.grandTotal / 6, totalPayable: bill.grandTotal },
                    { months: 12, emiPerMonth: bill.grandTotal / 12, totalPayable: bill.grandTotal }
                ] : []
            }
        };
    }

    async removeItemFromBill(billId: number, itemId: number) {
        const billItem = await this.billItemRepository.findOne({
            where: { id: itemId, bill: { id: billId } }
        });

        if (!billItem) throw new Error('Item not found in bill');

        await this.billItemRepository.remove(billItem);
        return await this.calculateTotals(billId);
    }

    async cancelBill(billId: number) {
        const bill = await this.billRepository.findOne({ 
            where: { id: billId }, 
            relations: ['items', 'items.product'] 
        });
        if (!bill) throw new Error('Bill not found');
        if (bill.status === 'COMPLETED') throw new Error('Completed orders cannot be cancelled');
        if (bill.status !== 'PROCESSING') throw new Error('Only processing orders can be cancelled');

        // Restore stock
        for (const item of bill.items) {
            if (item.product) {
                item.product.stock += item.quantity;
                await this.productRepository.save(item.product);
            }
        }

        // Calculate refund: Grand Total - (Tax + Shipping) = SubTotal - Discount
        bill.refundAmount = bill.subTotal - bill.discountAmount;
        bill.status = 'CANCELLED';

        return await this.billRepository.save(bill);
    }
}
