import { DataSource } from 'typeorm';
import { Product } from '../entities/Product';
import { Bill } from '../entities/Bill';
import { BillItem } from '../entities/BillItem';
import { User } from '../entities/User';
import { Wishlist } from '../entities/Wishlist';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5433,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'billing_system',
    synchronize: true, // Auto-create/update tables — disable in production
    logging: false,
    entities: [Product, Bill, BillItem, User, Wishlist],
    subscribers: [],
    migrations: [],
});
