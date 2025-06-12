import { Request, Response } from 'express';
import prisma from '../lib/client';
import { handlePrismaError } from '../utils/errorPrismaHandler';

// Create Product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const product = await prisma.product.create({
      data: data,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('create product error:', error);
    if (error instanceof Error) {
      handlePrismaError(error, res);
    } else {
      res.status(500).json({ success: false, error: 'An unknown error occurred' });
    }
  }
};

// Get All Products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get all product error:', error);
    if (error instanceof Error) {
      handlePrismaError(error, res);
    } else {
      res.status(500).json({ success: false, error: 'An unknown error occurred' });
    }
  }
};

// Get Product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      res.status(404).json({ error: 'Product tidak ditemukan' });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Get single product error:', error);
    if (error instanceof Error) {
      handlePrismaError(error, res);
    } else {
      res.status(500).json({ success: false, error: 'An unknown error occurred' });
    }
  }
};

// Update Product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: data,
    });
    res.status(200).json({ message: 'Product berhasil diperbarui.', data: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    if (error instanceof Error) {
      handlePrismaError(error, res);
    } else {
      res.status(500).json({ success: false, error: 'An unknown error occurred' });
    }
  }
};

// Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id },
    });
    res.status(204).json({ message: 'Product berhasil dihapus.' });
  } catch (error) {
    console.error('Delete product error:', error);
    if (error instanceof Error) {
      handlePrismaError(error, res);
    } else {
      res.status(500).json({ success: false, error: 'An unknown error occurred' });
    }
  }
};
