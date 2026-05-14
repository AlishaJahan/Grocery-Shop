import { AppDataSource } from './config/database';
import { Product } from './entities/Product';

async function autoCategorize() {
    try {
        await AppDataSource.initialize();
        const productRepo = AppDataSource.getRepository(Product);
        const products = await productRepo.find();

        console.log(`Found ${products.length} products to categorize.`);

        for (const product of products) {
            const name = product.name.toLowerCase();
            let category = 'Daily Essentials'; // Default

            if (name.includes('milk') || name.includes('dairy') || name.includes('cheese') || name.includes('butter') || name.includes('curd') || name.includes('paneer') || name.includes('egg')) {
                category = 'Dairy';
            } else if (name.includes('chips') || name.includes('snack') || name.includes('biscuit') || name.includes('kurkure') || name.includes('chocolate') || name.includes('namkeen')) {
                category = 'Snacks';
            } else if (name.includes('apple') || name.includes('banana') || name.includes('potato') || name.includes('tomato') || name.includes('onion') || name.includes('fruit') || name.includes('veg')) {
                category = 'Fruits & Veggies';
            } else if (name.includes('coke') || name.includes('juice') || name.includes('drink') || name.includes('water') || name.includes('tea') || name.includes('coffee')) {
                category = 'Beverages';
            }

            product.category = category;
            await productRepo.save(product);
            console.log(`Updated: ${product.name} -> ${category}`);
        }

        console.log('Auto-categorization complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error during auto-categorization:', err);
        process.exit(1);
    }
}

autoCategorize();
