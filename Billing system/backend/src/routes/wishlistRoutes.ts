import { Router } from 'express';
import { WishlistController } from '../controllers/wishlistController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const wishlistController = new WishlistController();

router.post('/:productId', authMiddleware, wishlistController.toggle);
router.get('/', authMiddleware, wishlistController.getWishlist);

export default router;
