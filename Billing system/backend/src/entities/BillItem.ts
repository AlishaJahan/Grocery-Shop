import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Bill } from './Bill';
import { Product } from './Product';

@Entity('bill_items')
export class BillItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Bill, (bill) => bill.items, { onDelete: 'CASCADE' })
    bill!: Bill;

    @ManyToOne(() => Product)
    product!: Product;

    @Column({ type: 'int' })
    quantity!: number;

    @Column({ type: 'float' })
    priceAtPurchase!: number;

    @Column({ type: 'float' })
    totalPrice!: number;
}
