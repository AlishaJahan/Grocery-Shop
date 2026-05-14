import { Router } from 'express';
import productRoutes from './productRoutes';
import billRoutes from './billRoutes';
import authRoutes from './authRoutes';
import wishlistRoutes from './wishlistRoutes';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/bills', authMiddleware, billRoutes);
router.use('/wishlist', authMiddleware, wishlistRoutes);

export default router;
