import { NextFunction, Request, Response } from "express";
import prisma from "../lib/client";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/email';
import { handlePrismaError } from "../utils/errorPrismaHandler";

// Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (existingUser) {
            res.status(400).json({ status: false, message: "Email telah digunakan.", });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                verificationToken,
                verificationTokenExpiry,
            },
        });
        await sendVerificationEmail({ email, name, verificationToken });
        const { password: _, verificationToken: __, ...userWithoutSensitiveData } = user;
        res.status(201).json({
            status: true,
            message: "User berhasil dibuat. Silakan periksa email Anda untuk memverifikasi akun.",
            data: userWithoutSensitiveData,
        });
    } catch (error) {
        console.error('Create user error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        if (!token) {
            res.status(400).json({
                success: false,
                error: "missing_token",
                message: "Silakan sertakan token verifikasi terlebih dahulu.",
            })
            return;
        }
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpiry: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                error: "invalid_or_expired_token",
                message: "Link verifikasi tidak sah atau sudah kadaluarsa. Silakan kirim permintaan verifikasi ulang.",
            })
            return;
        }
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null,
            },
        });
        res.status(200).json({
            success: true,
            message: "Verifikasi email berhasil. Silakan login untuk melanjutkan.",
        })
        return;
    } catch (error) {
        console.error('Verify email user error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

// Create a new user (For Admin)
export const createUserAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ status: false, message: "Email telah digunakan." })
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                isVerified: true,
                role,
            },
        });
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            status: true,
            message: "User successfully created.",
            data: userWithoutPassword,
        })
        return;
    } catch (error) {
        console.error('Update user for admin error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

// Get all users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                resetToken: true,
                resetTokenExpiry: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        res.status(200).json({
            status: true,
            message: "Users successfully fetched",
            data: users,
        })
        return;
    } catch (error) {
        console.error('Get all user error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

// Get a single user
export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userid;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                resetToken: true,
                resetTokenExpiry: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ status: false, message: "User tidak ditemukan." })
            return;
        }
        res.status(200).json({
            status: true,
            message: "User successfully fetched",
            data: user,
        })
        return;
    } catch (error) {
        console.error('Get user error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userid;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({
                status: false,
                message: "User tidak ditemukan.",
            });
            return;
        }
        await prisma.user.delete({
            where: { id: userId },
        });
        res.json({
            status: true,
            message: "User berhasil dihapus",
        })
        return;
    } catch (error) {
        console.error('Delete user error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

// Update a user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userid;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({
                status: false,
                message: "User tidak ditemukan",
            });
            return;
        }
        const { password, ...otherData } = req.body;
        const updateData = { ...otherData };
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        res.json({
            status: true,
            message: "User successfully updated",
            data: updatedUser,
        });
    } catch (error) {
        console.error('Update user error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Email dan password diperlukan." });
        return;
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(401).json({ message: "Invalid email atau password." });
            return;
        }
        if (!user.isVerified) {
            res.status(403).json({
                message: "Mohon verifikasi email Anda terlebih dahulu sebelum login.",
                isVerified: false
            });
            return;
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: "Invalid email atau password." });
            return;
        }
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: "1y" }
        );
        res.json({ token, message: "Login berhasil" });
    } catch (error) {
        console.error('Login user error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email diperlukan." });
        return;
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(200).json({ status: true, message: 'Jika email terdaftar dan telah diverifikasi, link untuk reset password akan dikirimkan.' });
            return;
        }
        if (!user.isVerified) {
            res.status(403).json({
                status: false,
                message: 'Mohon verifikasi email Anda terlebih dahulu sebelum mereset password.'
            });
            return;
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        await prisma.user.update({
            where: { email },
            data: { resetToken, resetTokenExpiry }
        });
        await sendPasswordResetEmail({ email, name: user.name, token: resetToken });
        res.json({
            status: true,
            message: 'Jika email terdaftar dan telah diverifikasi, link untuk reset password akan dikirimkan.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, password, email } = req.body;
        if (!token || !password || !email) {
            res.status(400).json({ message: "Token, email, dan password diperlukan." });
            return;
        }
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });
        if (!user) {
            res.status(400).json({ status: false, message: 'Invalid atau expired token' });
            return;
        }
        if (user.email !== email) {
            res.status(400).json({ status: false, message: 'Email tidak sesuai dengan token' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.json({
            status: true,
            message: 'Password berhasil diubah'
        });
    } catch (error) {
        console.error('Reset Password error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email diperlukan" });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(404).json({ message: "User tidak ditemukan" });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({ message: "User sudah terverifikasi" });
            return;
        }
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await prisma.user.update({
            where: { email },
            data: { verificationToken, verificationTokenExpiry },
        });
        await sendVerificationEmail({ email, verificationToken, name: user.name });
        res.status(200).json({ success: true, message: "Verification email telah dikirim" });
        return;
    } catch (error) {
        console.error('Resend verification email error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

export const checkVerificationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.query.email as string;
        if (!email) {
            res.status(400).json({
                success: false,
                error: "email_required",
                message: "Email diperlukan"
            });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                isVerified: true,
                name: true
            }
        });
        if (!user) {
            res.status(404).json({
                success: false,
                error: "user_not_found",
                message: "User tidak ditemukan. Mohon register terlebih dahulu."
            });
            return;
        }
        res.status(200).json({
            success: true,
            isVerified: user.isVerified,
            name: user.name
        });
    } catch (error) {
        console.error('Check verification status error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};
