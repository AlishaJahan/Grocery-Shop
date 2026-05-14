import { AppDataSource } from '../config/database';

const updatePrices = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected.');
        
        // Update product prices by dividing by 83 and rounding to 2 decimal places
        await AppDataSource.query('UPDATE products SET price = ROUND((price / 83)::numeric, 2)');
        console.log('Product prices successfully converted to USD.');
        
        // If there are existing bills and bill_items, we should probably update those too to keep the history consistent,
        // although for a simple update, updating just the products might be enough. Let's update them too just in case.
        await AppDataSource.query('UPDATE bill_items SET "priceAtPurchase" = ROUND(("priceAtPurchase" / 83)::numeric, 2), "totalPrice" = ROUND(("totalPrice" / 83)::numeric, 2)');
        console.log('Bill items prices successfully converted to USD.');
        
        await AppDataSource.query('UPDATE bills SET "subTotal" = ROUND(("subTotal" / 83)::numeric, 2), "taxAmount" = ROUND(("taxAmount" / 83)::numeric, 2), "grandTotal" = ROUND(("grandTotal" / 83)::numeric, 2)');
        console.log('Bills totals successfully converted to USD.');

        process.exit(0);
    } catch (error) {
        console.error('Error updating prices:', error);
        process.exit(1);
    }
};

updatePrices();
