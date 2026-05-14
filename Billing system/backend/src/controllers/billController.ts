import { Request, Response } from 'express';
import { BillService } from '../services/billService';

const billService = new BillService();

export class BillController {
    async createBill(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const bill = await billService.createBill(userId);
            res.status(201).json({ success: true, data: bill });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    async addItem(req: Request, res: Response) {
        try {
            const { billId } = req.params;
            const { productId, quantity } = req.body;
            await billService.addItemToBill(Number(billId), productId, quantity);
            const details = await billService.getBillDetails(Number(billId));
            res.status(200).json({ success: true, data: details });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    async updateQuantity(req: Request, res: Response) {
        try {
            const { billId } = req.params;
            const { productId, quantity } = req.body;
            await billService.updateItemQuantity(Number(billId), productId, quantity);
            const details = await billService.getBillDetails(Number(billId));
            res.status(200).json({ success: true, data: details });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    async removeItem(req: Request, res: Response) {
        try {
            const { billId, itemId } = req.params;
            await billService.removeItemFromBill(Number(billId), Number(itemId));
            const details = await billService.getBillDetails(Number(billId));
            res.status(200).json({ success: true, data: details });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    async checkout(req: Request, res: Response) {
        try {
            const { billId } = req.params;
            const { paymentMethod, address, ...rest } = req.body;
            console.log(`Processing checkout for Bill ID: ${billId}, Method: ${paymentMethod}`);
            
            // Handle both { address: {...} } and { houseNumber, area, ... } structures
            const addressData = address || (rest.houseNumber ? rest : undefined);
            
            const bill = await billService.completeBill(Number(billId), paymentMethod, addressData);
            console.log(`Checkout successful for Bill ID: ${billId}`);
            res.status(200).json({ success: true, data: bill });
        } catch (err: any) {
            console.error(`Checkout failed for Bill ID: ${req.params.billId}:`, err.message);
            res.status(400).json({ success: false, error: err.message });
        }
    }

    async cancelOrder(req: Request, res: Response) {
        try {
            const { billId } = req.params;
            const bill = await billService.cancelBill(Number(billId));
            res.status(200).json({ success: true, data: bill });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    async getBill(req: Request, res: Response) {
        try {
            const { billId } = req.params;
            const details = await billService.getBillDetails(Number(billId));
            res.status(200).json({ success: true, data: details });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    async getUserHistory(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const history = await billService.getUserHistory(userId);
            res.status(200).json({ success: true, data: history });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    async getAllHistory(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const history = await billService.getAdminHistory(page, limit);
            res.status(200).json({ success: true, ...history });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            const { billId } = req.params;
            const { status } = req.body;
            const bill = await billService.updateBillStatus(Number(billId), status);
            res.status(200).json({ success: true, data: bill });
        } catch (err: any) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    async getStats(req: Request, res: Response) {
        try {
            const stats = await billService.getSalesStats();
            res.status(200).json({ success: true, data: stats });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    async exportReports(req: Request, res: Response) {
        try {
            const history = await billService.getAdminHistory(1, 1000);
            const csvRows = [
                ['ID', 'Date', 'Customer', 'Total', 'Payment', 'Status'],
                ...history.data.map((b: any) => [
                    b.id,
                    new Date(b.createdAt).toLocaleDateString(),
                    b.user?.email || 'Walk-in',
                    b.grandTotal,
                    b.paymentMethod,
                    b.status
                ])
            ];

            const csvContent = csvRows.map(r => r.join(',')).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.csv');
            res.status(200).send(csvContent);
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}
