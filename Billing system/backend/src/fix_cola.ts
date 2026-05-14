import { AppDataSource } from './config/database';
import { Product } from './entities/Product';

async function fixCocaCola() {
    try {
        await AppDataSource.initialize();
        const productRepo = AppDataSource.getRepository(Product);
        const products = await productRepo.find();

        for (const product of products) {
            if (product.name.toLowerCase().includes('coca cola') || product.name.toLowerCase().includes('coke')) {
                product.category = 'Beverages';
                await productRepo.save(product);
                console.log(`Updated: ${product.name} -> Beverages`);
            }
        }

        console.log('Coca Cola successfully moved to Beverages!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixCocaCola();
