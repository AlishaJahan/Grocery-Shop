import { AppDataSource } from './src/config/database';
import { Bill } from './src/entities/Bill';

async function checkBills() {
    try {
        await AppDataSource.initialize();
        const billRepo = AppDataSource.getRepository(Bill);
        const bills = await billRepo.find({
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['items']
        });

        console.log('Recent Bills:');
        bills.forEach(b => {
            console.log(`ID: ${b.id}, Status: ${b.status}, Total: ${b.grandTotal}, Items: ${b.items.length}, CreatedAt: ${b.createdAt}`);
        });

        await AppDataSource.destroy();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkBills();
