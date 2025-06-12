import { Request, Response } from 'express';
import prisma from "../lib/client";
import { handlePrismaError } from '../utils/errorPrismaHandler';

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        const category = await prisma.category.create({ data });
        res.status(201).json(category);
        return;
    } catch (error) {
        console.error('Create category error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await prisma.category.findMany();
        res.status(200).json(categories);
        return;
    } catch (error) {
        console.error('Get all category error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id },
            include: { products: true },
        });
        if (!category) {
            res.status(404).json({ error: 'Kategori dengan ID tersebut tidak ditemukan.' });
            return;
        }
        res.status(200).json(category);
        return;
    } catch (error) {
        console.error('Get category by id error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body;
        const existingCategory = await prisma.category.findUnique({
            where: { id },
        });

        if (!existingCategory) {
            res.status(404).json({ error: 'Kategori dengan ID tersebut tidak ditemukan.' });
            return;
        }
        const updatedCategory = await prisma.category.update({
            where: { id },
            data,
        });
        res.status(200).json({ message: 'Kategori berhasil diperbarui.', data: updatedCategory });
        return;
    } catch (error) {
        console.error('Update category error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const existingCategory = await prisma.category.findUnique({ where: { id } });
        if (!existingCategory) {
            res.status(404).json({ error: 'Kategori dengan ID tersebut tidak ditemukan.' });
            return;
        }
        await prisma.category.delete({ where: { id } });
        res.status(204).json({ message: 'Kategori berhasil dihapus.' });
        return;
    } catch (error) {
        console.error('Delete category error:', error);
        if (error instanceof Error) {
            handlePrismaError(error, res);
        } else {
            res.status(500).json({ success: false, error: 'An unknown error occurred' });
        }
    }
};