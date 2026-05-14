import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { BillService } from '../services/billService';
import { AuthRequest } from '../middleware/authMiddleware';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-04-22.dahlia' as any, // Using 'as any' to avoid version mismatch if SDK updates
});

const billService = new BillService();

export class PaymentController {
    async createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const billId = Number(req.params.billId);
            const billDetails = await billService.getBillDetails(billId);
            const bill = billDetails.bill;

            if (!bill) {
                return res.status(404).json({ success: false, message: 'Bill not found' });
            }

            if (bill.status === 'COMPLETED') {
                return res.status(400).json({ success: false, message: 'Bill is already paid' });
            }

            // Stripe amounts are in cents
            const amount = Math.round(bill.grandTotal * 100);

            if (amount <= 0) {
                return res.status(400).json({ success: false, message: 'Invalid bill amount' });
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    billId: bill.id.toString(),
                    userId: req.user?.id.toString() || '',
                },
            });

            res.status(200).json({
                success: true,
                clientSecret: paymentIntent.client_secret,
                amount: bill.grandTotal,
            });
        } catch (error) {
            next(error);
        }
    }
}
