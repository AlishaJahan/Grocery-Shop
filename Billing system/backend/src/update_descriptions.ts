import { AppDataSource } from './config/database';
import { Product } from './entities/Product';

const descriptions: { [key: string]: string } = {
    'rice': "Long-grain, aromatic Basmati rice. Perfectly aged for the best texture and flavor. Ideal for biryanis, pulaos, and daily meals.",
    'atta': "100% natural whole wheat flour, stone-ground to preserve nutrients. Soft, delicious rotis every time. No added preservatives.",
    'wheat': "100% natural whole wheat flour, stone-ground to preserve nutrients. Soft, delicious rotis every time. No added preservatives.",
    'milk': "Farm-fresh, pure cow milk. Rich in calcium and essential vitamins. Delivered fresh to ensure the highest quality for your family.",
    'egg': "Rich, protein-packed farm-fresh eggs. Perfect for a healthy breakfast, baking, or any meal. Sustainably sourced and handled with care.",
    'banana': "Sweet, creamy, and 100% organic. Perfect as a quick snack or for your morning smoothies. Packed with potassium and energy.",
    'apple': "Crunchy, juicy, and naturally sweet. Hand-picked from premium orchards to ensure the perfect crunch in every bite.",
    'tea': "Premium antioxidant-rich green tea leaves. A refreshing and healthy way to boost your metabolism and stay focused throughout the day.",
    'coffee': "Rich, aromatic coffee beans roasted to perfection. Start your morning with a bold and energizing cup of pure joy.",
    'oil': "High-quality, heart-healthy cooking oil. Perfect for frying, sautéing, or dressing. Enhances the natural flavor of your dishes.",
    'dal': "Protein-rich, unpolished pulses. Sourced directly from farms to ensure maximum nutrition and authentic taste.",
    'chips': "Crispy, savory, and absolutely addictive. The perfect companion for your tea breaks or movie nights.",
    'chocolate': "Indulgent, velvety smooth chocolate made from the finest cocoa. A perfect treat for your sweet cravings.",
    'potato': "Fresh, versatile farm-grown potatoes. Perfect for mashing, frying, or adding to your favorite curries.",
    'tomato': "Sun-ripened, juicy tomatoes. Packed with flavor and lycopene, perfect for sauces, salads, and cooking.",
    'onion': "Sharp and flavorful farm-fresh onions. An essential base for almost every savory dish in your kitchen.",
    'coke': "The classic, refreshing cola taste you love. Best served chilled for an instant burst of energy and refreshment.",
    'juice': "100% natural fruit juice with no added sugar. A delicious and healthy way to stay hydrated and get your daily vitamins.",
    'snack': "Deliciously crunchy and flavorful. These snacks are made with high-quality ingredients for the perfect bite every time.",
    'biscuit': "Crispy, buttery, and baked to perfection. The ideal partner for your morning tea or evening coffee.",
};

const categoryDescriptions: { [key: string]: string } = {
    'Dairy': "Creamy and delicious dairy essentials. Sourced from high-quality farms to bring you the best in taste and nutrition.",
    'Snacks': "Crispy, savory, and absolutely addictive. The perfect companion for your tea breaks or movie nights.",
    'Fruits & Veggies': "Farm-fresh, vibrant, and packed with nutrients. Our produce is hand-picked to ensure you get the best quality available.",
    'Beverages': "Quench your thirst with our range of refreshing drinks. From energizing coffee to soothing juices, we have it all.",
    'Daily Essentials': "High-quality staples for your modern kitchen. Sourced responsibly and delivered fresh to your doorstep."
};

async function updateDescriptions() {
    try {
        await AppDataSource.initialize();
        const productRepo = AppDataSource.getRepository(Product);
        const products = await productRepo.find();

        console.log(`Updating descriptions for ${products.length} products...`);

        for (const product of products) {
            const name = product.name.toLowerCase();
            let newDescription = "";

            // Try matching by name keywords first
            for (const key in descriptions) {
                if (name.includes(key)) {
                    newDescription = descriptions[key];
                    break;
                }
            }

            // Fallback to category-based description
            if (!newDescription) {
                newDescription = categoryDescriptions[product.category] || categoryDescriptions['Daily Essentials'];
            }

            product.description = newDescription;
            await productRepo.save(product);
            console.log(`Updated description for: ${product.name}`);
        }

        console.log('Product descriptions updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating descriptions:', err);
        process.exit(1);
    }
}

updateDescriptions();
