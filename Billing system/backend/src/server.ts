import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { AppDataSource } from './config/database';

const PORT = process.env.PORT || 3000;

import { seedProducts } from './utils/seeder';

AppDataSource.initialize()
    .then(async () => {
        console.log('Database connection established successfully.');
        await seedProducts();
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error during Database initialization:', error);
    });