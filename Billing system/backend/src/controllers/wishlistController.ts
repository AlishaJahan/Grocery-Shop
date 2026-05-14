import { Request, Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlistService';

const wishlistService = new WishlistService();

export class WishlistController {
    async toggle(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const productId = Number(req.params.productId);
            const result = await wishlistService.toggleWishlist(userId, productId);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async getWishlist(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const wishlist = await wishlistService.getUserWishlist(userId);
            res.status(200).json({ success: true, data: wishlist.map(item => item.product) });
        } catch (error) {
            next(error);
        }
    }
}
