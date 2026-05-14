import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'float' })
    price!: number;

    @Column({ type: 'int', default: 0 })
    stock!: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    imageUrl!: string;

    @Column({ type: 'varchar', length: 100, default: 'Uncategorized' })
    category!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    brand?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    unit?: string;

    @CreateDateColumn()
    createdAt!: Date;
}
