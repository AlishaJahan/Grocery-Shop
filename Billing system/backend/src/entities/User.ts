import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    phoneNumber?: string;

    @Column({ nullable: true })
    houseNumber?: string;

    @Column({ nullable: true })
    area?: string;

    @Column({ nullable: true })
    landmark?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    pincode?: string;

    @Column({
        type: 'simple-enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role!: UserRole;

    @Column({ nullable: true })
    otp?: string;

    @Column({ type: 'timestamp', nullable: true })
    otpExpires?: Date;

    @Column({ default: false })
    isVerified!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
