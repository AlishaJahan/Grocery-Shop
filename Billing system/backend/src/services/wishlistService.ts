import { AppDataSource } from '../config/database';
import { Wishlist } from '../entities/Wishlist';
import { User } from '../entities/User';
import { Product } from '../entities/Product';

export class WishlistService {
    private wishlistRepo = AppDataSource.getRepository(Wishlist);
    private productRepo = AppDataSource.getRepository(Product);

    async toggleWishlist(userId: number, productId: number): Promise<{ added: boolean }> {
        const user = { id: userId } as User;
        const product = await this.productRepo.findOneBy({ id: productId });
        if (!product) throw new Error('Product not found');

        const existing = await this.wishlistRepo.findOne({
            where: { user: { id: userId }, product: { id: productId } }
        });

        if (existing) {
            await this.wishlistRepo.remove(existing);
            return { added: false };
        } else {
            const newItem = this.wishlistRepo.create({ user, product });
            await this.wishlistRepo.save(newItem);
            return { added: true };
        }
    }

    async getUserWishlist(userId: number): Promise<Wishlist[]> {
        return await this.wishlistRepo.find({
            where: { user: { id: userId } },
            relations: ['product'],
            order: { createdAt: 'DESC' }
        });
    }
}
