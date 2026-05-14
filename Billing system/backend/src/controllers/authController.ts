import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/authMiddleware';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }

            // Block registration with admin email
            if (email === process.env.ADMIN_EMAIL) {
                return res.status(403).json({ success: false, message: 'Registration not allowed for this email' });
            }

            const user = await authService.register(email, password);
            res.status(201).json({ 
                success: true, 
                message: 'OTP sent to your email. Please verify to complete registration.',
                data: { email: user.email }
            });
        } catch (error: any) {
            if (error.message === 'User already exists and is verified.') {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async verifyOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({ success: false, message: 'Email and OTP are required' });
            }

            const success = await authService.verifyOTP(email, otp);
            if (!success) {
                return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
            }

            res.status(200).json({ 
                success: true, 
                message: 'Email verified successfully. You can now login.' 
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // User-only login — blocks admin from logging in here
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }

            // Prevent admin from using user login
            if (email === process.env.ADMIN_EMAIL) {
                return res.status(403).json({ success: false, message: 'Admins must use the admin login portal' });
            }

            const result = await authService.loginAsUser(email, password);
            if (!result) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            res.status(200).json({ 
                success: true, 
                message: 'Login successful',
                data: {
                    user: { id: result.user.id, email: result.user.email, role: result.user.role },
                    token: result.token
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Admin-only login — blocks regular users from using this
    async adminLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }

            const result = await authService.loginAsAdmin(email, password);
            if (!result) {
                return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
            }

            res.status(200).json({ 
                success: true, 
                message: 'Admin login successful',
                data: {
                    user: { id: result.user.id, email: result.user.email, role: result.user.role },
                    token: result.token
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const user = await authService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const user = await authService.updateProfile(userId, req.body);
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, message: 'Email is required' });
            }

            await authService.forgotPassword(email);
            res.status(200).json({ 
                success: true, 
                message: 'Password reset OTP sent to your email.' 
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async verifyResetOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({ success: false, message: 'Email and OTP are required' });
            }

            const success = await authService.verifyResetOTP(email, otp);
            if (!success) {
                return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
            }

            res.status(200).json({ 
                success: true, 
                message: 'OTP verified successfully.' 
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp, newPassword } = req.body;
            if (!email || !otp || !newPassword) {
                return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
            }

            await authService.resetPassword(email, otp, newPassword);
            res.status(200).json({ 
                success: true, 
                message: 'Password has been reset successfully. You can now login with your new password.' 
            });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
