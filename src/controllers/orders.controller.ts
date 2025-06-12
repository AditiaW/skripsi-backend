// src/controllers/orders.controller.ts
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import prisma from "../lib/client";
import midtransClient from "midtrans-client";
import { handlePrismaError } from "../utils/errorPrismaHandler";
import { getPaymentStatus } from "../utils/getPaymentStatus";

// Midtrans configuration
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export const createTransaction = async (
  req: Request,
  res: Response) => {
  try {
    const { items, ...customerDetails } = req.body;
    const userId = req.user?.id;

    // Validate user
    if (!userId) throw createError(401, "User belum terautentikasi.");

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw createError(404, "User tidak ditemukan");

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      throw createError(400, "Items must be a non-empty array");
    }

    // Validate products
    const productIds = items.map(item => item.id);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, quantity: true }
    });

    const validatedItems = items.map(item => {
      const product = existingProducts.find(p => p.id === item.id);
      if (!product) throw createError(400, `Product ${item.id} tidak ditemukan`);
      if (item.quantity > product.quantity) {
        throw createError(400, `Stok tidak cukup pada product ${product.name}`);
      }
      return {
        ...item,
        productId: product.id,
        productName: product.name,
        currentPrice: product.price
      };
    });

    // Calculate total amount
    const totalAmount = validatedItems.reduce(
      (sum, item) => sum + item.currentPrice * item.quantity,
      0
    );

    // Create order ID
    const orderId = `ORDER-${Date.now()}`;

    // Create Midtrans transaction
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      item_details: validatedItems.map(item => ({
        id: item.productId,
        name: item.productName,
        price: item.currentPrice,
        quantity: item.quantity,
      })),
      customer_details: {
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName,
        email: customerDetails.email,
        phone: customerDetails.phone,
        billing_address: {
          address: customerDetails.address,
          city: customerDetails.city,
          postal_code: customerDetails.zip,
        },
      },
    });

    // Save order to database
    const order = await prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          id: orderId,
          userId,
          shippingFirstName: customerDetails.firstName,
          shippingLastName: customerDetails.lastName,
          shippingEmail: customerDetails.email,
          shippingAddress: customerDetails.address,
          shippingCity: customerDetails.city,
          shippingZip: customerDetails.zip,
          shippingPhone: customerDetails.phone,
          shippingNotes: customerDetails.notes,
          totalAmount,
          paymentStatus: "PENDING",
          snapToken: transaction.token,
          orderItems: {
            create: validatedItems.map(item => ({
              productId: item.productId,
              price: item.currentPrice,
              quantity: item.quantity,
            })),
          },
        },
      });

      return order;
    });

    res.json({
      orderId: order.id,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    });

  } catch (error) {
    console.error('Create order error:', error);
    if (error instanceof Error) {
      handlePrismaError(error, res);
    } else {
      res.status(500).json({ success: false, error: 'An unknown error occurred' });
    }
  }
};

export const handlePaymentNotification = async (
  req: Request,
  res: Response
) => {
  try {
    const notification = req.body;
    const {
      order_id: orderId,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus
    } = notification;

    const paymentStatus = getPaymentStatus(transactionStatus, fraudStatus);

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus, updatedAt: new Date() },
      include: { user: true, orderItems: true },
    });

    if (paymentStatus === "PAID") {
      await Promise.all(
        updatedOrder.orderItems.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } },
          })
        )
      );
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Payment notification handling failed:', error);
    if (error instanceof Error) {
      handlePrismaError(error, res);
    } else {
      res.status(500).json({ success: false, error: 'An unknown error occurred' });
    }
  }
};

// Get all orders
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });
    res.json({
      status: true,
      message: "Orders successfully fetched",
      data: orders,
    });
  } catch (error) {
    console.error('Get all order error:', error);
    if (error instanceof Error) {
      handlePrismaError(error, res);
    } else {
      res.status(500).json({ success: false, error: 'An unknown error occurred' });
    }
  }
};

// Get order
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      res.status(400).json({
        status: false,
        message: "Invalid order ID",
      });
      return;
    }
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });
    if (!order) {
      res.status(404).json({
        status: false,
        message: "Order tidak ditemukan",
      });
      return;
    }
    res.json({
      status: true,
      message: "Order successfully fetched",
      data: order,
    });
  } catch (error) {
    console.error('Get single order error:', error);
    if (error instanceof Error) {
      handlePrismaError(error, res);
    } else {
      res.status(500).json({ success: false, error: 'An unknown error occurred' });
    }
  }
};
