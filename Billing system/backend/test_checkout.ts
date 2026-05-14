import { AppDataSource } from './src/config/database';
import { BillService } from './src/services/billService';

async function testCheckout() {
    try {
        await AppDataSource.initialize();
        const billService = new BillService();
        
        const billId = 127; // The bill from earlier
        console.log(`Testing checkout for Bill ${billId}...`);
        
        const address = {
            houseNumber: 'Test 101',
            area: 'Test Area',
            city: 'Test City',
            pincode: '123456'
        };

        const result = await billService.completeBill(billId, 'Card', address);
        console.log('Checkout result status:', result.status);
        console.log('Checkout successful!');

        await AppDataSource.destroy();
    } catch (err) {
        console.error('Checkout failed:', err);
    }
}

testCheckout();
