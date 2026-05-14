import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';

export const seedProducts = async () => {
    const productRepository = AppDataSource.getRepository(Product);
    const billItemRepository = AppDataSource.getRepository(require('../entities/BillItem').BillItem);
    const billRepository = AppDataSource.getRepository(require('../entities/Bill').Bill);
    const userRepository = AppDataSource.getRepository(User);

    // Initialize Admin from .env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
        const adminExists = await userRepository.findOneBy({ email: adminEmail });
        if (!adminExists) {
            console.log('Initializing admin user...');
            const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
            const admin = userRepository.create({
                email: adminEmail,
                password: hashedAdminPassword,
                role: UserRole.ADMIN
            });
            await userRepository.save(admin);
            console.log('Admin user initialized successfully.');
        }
    }
    
    const count = await productRepository.count();
    if (count > 0) return;

    await AppDataSource.query('TRUNCATE TABLE "bill_items", "bills", "products" RESTART IDENTITY CASCADE');

    console.log('Seeding default products...');
    const products = [
        { 
            name: 'Basmati Rice (5kg)', 
            price: 5.50, 
            stock: 50, 
            description: 'Long-grain, aromatic Basmati rice. Perfectly aged for the best texture and flavor. Ideal for biryanis, pulaos, and daily meals.',
            category: 'Daily Essentials'
        },
        { 
            name: 'Whole Wheat Atta (10kg)', 
            price: 4.60, 
            stock: 40, 
            description: '100% natural whole wheat flour, stone-ground to preserve nutrients. Soft, delicious rotis every time. No added preservatives.',
            category: 'Daily Essentials'
        },
        { 
            name: 'Fresh Milk (1L)', 
            price: 0.80, 
            stock: 100, 
            description: 'Farm-fresh, pure cow milk. Rich in calcium and essential vitamins. Delivered fresh to ensure the highest quality for your family.',
            category: 'Dairy'
        },
        { 
            name: 'Farm Eggs (1 Dozen)', 
            price: 1.00, 
            stock: 60, 
            description: 'Rich, protein-packed farm-fresh eggs. Perfect for a healthy breakfast, baking, or any meal. Sustainably sourced and handled with care.',
            category: 'Dairy'
        },
        { 
            name: 'Sunflower Oil (1L)', 
            price: 1.70, 
            stock: 80, 
            description: 'High-quality, heart-healthy cooking oil. Perfect for frying, sautéing, or dressing. Enhances the natural flavor of your dishes.',
            category: 'Daily Essentials'
        },
        { 
            name: 'Toor Dal (1kg)', 
            price: 1.90, 
            stock: 35, 
            description: 'Protein-rich, unpolished pulses. Sourced directly from farms to ensure maximum nutrition and authentic taste.',
            category: 'Daily Essentials'
        },
        { 
            name: 'Fresh Apples (1kg)', 
            price: 2.40, 
            stock: 25, 
            description: 'Crunchy, juicy, and naturally sweet. Hand-picked from premium orchards to ensure the perfect crunch in every bite.',
            category: 'Fruits & Veggies'
        },
    ];
    
    await productRepository.save(products);
    console.log('Products seeded successfully.');
};
