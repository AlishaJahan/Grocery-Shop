import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { BillItem } from './BillItem';
import { User } from './User';

@Entity('bills')
export class Bill {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'float', default: 0 })
    subTotal!: number;

    @Column({ type: 'float', default: 0 })
    taxAmount!: number;

    @Column({ type: 'float', default: 0.18 })
    taxRate!: number;

    @Column({ type: 'float', default: 0 })
    grandTotal!: number;
    
    @Column({ type: 'float', default: 0 })
    discountAmount!: number;

    @Column({ type: 'float', default: 0 })
    discountPercentage!: number;

    @Column({ type: 'float', default: 0 })
    shippingFee!: number;

    @Column({ type: 'float', default: 0 })
    refundAmount!: number;

    @Column({ type: 'varchar', default: 'DRAFT' })
    status!: string;

    @Column({ type: 'timestamp', nullable: true })
    processingAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    shippedAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    deliveredAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    estimatedDelivery!: Date;

    @Column({ nullable: true })
    deliveryPartnerName!: string;

    @Column({ nullable: true })
    deliveryPartnerPhone!: string;

    @Column({ type: 'varchar', nullable: true })
    paymentMethod!: string;

    @Column({ type: 'varchar', nullable: true })
    houseNumber!: string;

    @Column({ type: 'varchar', nullable: true })
    area!: string;

    @Column({ type: 'varchar', nullable: true })
    landmark!: string;

    @Column({ type: 'varchar', nullable: true })
    city!: string;

    @Column({ type: 'varchar', nullable: true })
    pincode!: string;

    @ManyToOne(() => User)
    user!: User;

    @Column({ nullable: true })
    userId!: number;

    @OneToMany(() => BillItem, (item) => item.bill, { cascade: true })
    items!: BillItem[];

    @CreateDateColumn()
    createdAt!: Date;
}
