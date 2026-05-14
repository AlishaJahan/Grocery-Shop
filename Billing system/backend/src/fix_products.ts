import { AppDataSource } from './config/database';
import { seedProducts } from './utils/seeder';

const fix = async () => {
    await AppDataSource.initialize();
    
    // truncate products
    await AppDataSource.query('TRUNCATE TABLE "products" RESTART IDENTITY CASCADE');
    console.log("Truncated products.");
    
    await seedProducts();
    console.log("Re-seeded products.");
    
    process.exit(0);
};

fix();
