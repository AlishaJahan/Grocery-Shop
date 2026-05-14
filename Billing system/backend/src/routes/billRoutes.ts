import { Router } from 'express';
import { BillController } from '../controllers/billController';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();
const billController = new BillController();
const paymentController = new PaymentController();

// User routes (some might need auth, check specific requirements)
router.post('/', authMiddleware, billController.createBill);
router.get('/history', authMiddleware, billController.getUserHistory);
router.get('/:billId', authMiddleware, billController.getBill);
router.post('/:billId/items', authMiddleware, billController.addItem);
router.delete('/:billId/items/:itemId', authMiddleware, billController.removeItem);
router.post('/:billId/checkout', authMiddleware, billController.checkout);
router.post('/:billId/payment-intent', authMiddleware, paymentController.createPaymentIntent);
router.post('/:billId/cancel', authMiddleware, billController.cancelOrder);

// Admin routes
router.get('/admin/history', authMiddleware, adminMiddleware, billController.getAllHistory);
router.get('/admin/stats', authMiddleware, adminMiddleware, billController.getStats);
router.patch('/admin/bills/:billId/status', authMiddleware, adminMiddleware, billController.updateStatus);
router.get('/admin/reports/export', authMiddleware, adminMiddleware, billController.exportReports);

export default router;
