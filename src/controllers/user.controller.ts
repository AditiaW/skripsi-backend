import { NextFunction, Request, Response } from "express";
import prisma from "../lib/client";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/email';

// Create a new user
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            res.status(400).json({
                status: false,
                message: "Email already in use",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            status: true,
            message: "User successfully created",
            data: userWithoutPassword,
        });
    } catch (error) {
        next(error);
    }
};

// Create a new user (supports Admin role)
export const createUserAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        // Validasi apakah role diberikan dengan benar
        if (!role || !["ADMIN", "USER"].includes(role)) {
            res.status(400).json({
                status: false,
                message: "Invalid role. Role must be ADMIN or USER.",
            });
            return;
        }

        // Cek apakah email sudah digunakan
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({
                status: false,
                message: "Email already in use",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Membuat pengguna dengan peran yang ditentukan
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role, // Menambahkan role ADMIN atau USER
            },
        });

        // Hapus password dari respons API
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            status: true,
            message: "User successfully created",
            data: userWithoutPassword,
        });
    } catch (error) {
        next(error);
    }
};


// Get all users
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

        res.json({
            status: true,
            message: "Users successfully fetched",
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

// Get a single user
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.params.userid;

        if (!userId) {
            res.status(400).json({
                status: false,
                message: "Invalid user ID",
            });
            return; // Add return to prevent further execution
        }

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
            }
        });

        if (!user) {
            res.status(404).json({
                status: false,
                message: "User not found",
            });
            return;
        }

        res.json({
            status: true,
            message: "User successfully fetched",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.params.userid;

        if (!userId) {
            res.status(400).json({
                status: false,
                message: "Invalid user ID",
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({
                status: false,
                message: "User not found",
            });
            return;
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        res.json({
            status: true,
            message: "User successfully deleted",
        });
    } catch (error) {
        next(error);
    }
};

// Update a user
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.params.userid;

        if (!userId) {
            res.status(400).json({
                status: false,
                message: "Invalid user ID",
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({
                status: false,
                message: "User not found",
            });
            return;
        }

        // Handle password updates securely
        const { password, ...otherData } = req.body;
        const updateData = { ...otherData };

        // Only hash and update password if it's provided
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
        next(error);
    }
};

// Login user
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: "1y" }
        );

        res.json({ token, message: "Login successful" });
    } catch (error) {
        next(error);
    }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(200).json({ status: true, message: 'If the email exists, a reset link will be sent' });
            return;
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        await prisma.user.update({
            where: { email },
            data: { resetToken, resetTokenExpiry }
        });

        await sendPasswordResetEmail({ email, token: resetToken });

        res.json({
            status: true,
            message: 'If the email exists, a reset link will be sent'
        });
    } catch (error) {
        next(error);
    }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token, password, email } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            res.status(400).json({ status: false, message: 'Invalid or expired token' });
            return;
        }

        if (user.email !== email) {
            res.status(400).json({ status: false, message: 'Email does not match the token' });
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
            message: 'Password successfully reset'
        });
    } catch (error) {
        next(error);
    }
};