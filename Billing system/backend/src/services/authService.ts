import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

import { sendOTP, sendResetPasswordOTP } from './emailService';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    async register(email: string, password: string, role: UserRole = UserRole.USER): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let user = await this.userRepository.findOneBy({ email });

        if (user) {
            if (user.isVerified) {
                throw new Error('User already exists and is verified.');
            }
            // Update existing unverified user
            user.password = hashedPassword;
            user.otp = otp;
            user.otpExpires = otpExpires;
        } else {
            user = this.userRepository.create({
                email,
                password: hashedPassword,
                role,
                otp,
                otpExpires,
                isVerified: false
            });
        }

        await this.userRepository.save(user);
        await sendOTP(email, otp);
        return user;
    }

    async verifyOTP(email: string, otp: string): Promise<boolean> {
        const user = await this.userRepository.findOneBy({ email });
        
        if (!user || !user.otp || !user.otpExpires) return false;
        
        if (new Date() > user.otpExpires) {
            throw new Error('OTP has expired.');
        }

        if (user.otp !== otp) {
            throw new Error('Invalid OTP.');
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await this.userRepository.save(user);
        return true;
    }

    // User-only login — rejects if the credentials belong to admin
    async loginAsUser(email: string, password: string): Promise<{ user: User, token: string } | null> {
        const user = await this.userRepository.findOneBy({ email });
        if (!user) return null;

        if (!user.isVerified) {
            throw new Error('Please verify your email before logging in.');
        }

        // Block admin from using user login (extra safety)
        if (user.role === UserRole.ADMIN) return null;

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { user, token };
    }

    // Admin-only login — only succeeds for ADMIN_EMAIL + ADMIN_PASSWORD from .env
    async loginAsAdmin(email: string, password: string): Promise<{ user: User, token: string } | null> {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) return null;

        // Credentials must match exactly with .env
        if (email !== adminEmail || password !== adminPassword) return null;

        // Ensure admin user exists in DB, seed if not
        let adminUser = await this.userRepository.findOneBy({ email: adminEmail });

        if (!adminUser) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            adminUser = this.userRepository.create({
                email: adminEmail,
                password: hashedPassword,
                role: UserRole.ADMIN
            });
            adminUser = await this.userRepository.save(adminUser);
        }

        const token = jwt.sign(
            { id: adminUser.id, email: adminUser.email, role: adminUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { user: adminUser, token };
    }

    // Kept for backwards compatibility (used by register check)
    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOneBy({ email });
    }

    async getUserById(id: number): Promise<User | null> {
        return await this.userRepository.findOneBy({ id });
    }

    async updateProfile(userId: number, data: any): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new Error('User not found');

        // Update fields if provided
        if (data.name !== undefined) user.name = data.name;
        if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
        if (data.houseNumber !== undefined) user.houseNumber = data.houseNumber;
        if (data.area !== undefined) user.area = data.area;
        if (data.landmark !== undefined) user.landmark = data.landmark;
        if (data.city !== undefined) user.city = data.city;
        if (data.pincode !== undefined) user.pincode = data.pincode;

        return await this.userRepository.save(user);
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await this.userRepository.findOneBy({ email });
        if (!user) {
            throw new Error('User with this email does not exist.');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await this.userRepository.save(user);

        await sendResetPasswordOTP(email, otp);
    }

    async verifyResetOTP(email: string, otp: string): Promise<boolean> {
        const user = await this.userRepository.findOneBy({ email });
        
        if (!user || !user.otp || !user.otpExpires) return false;
        
        if (new Date() > user.otpExpires) {
            throw new Error('OTP has expired.');
        }

        if (user.otp !== otp) {
            throw new Error('Invalid OTP.');
        }

        return true;
    }

    async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findOneBy({ email });
        
        if (!user || !user.otp || !user.otpExpires) {
            throw new Error('Invalid request.');
        }

        if (new Date() > user.otpExpires) {
            throw new Error('OTP has expired.');
        }

        if (user.otp !== otp) {
            throw new Error('Invalid OTP.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        
        await this.userRepository.save(user);
    }
}
