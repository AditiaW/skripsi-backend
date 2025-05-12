// src/controllers/orders.controller.ts
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import prisma from "../lib/client";
import midtransClient from "midtrans-client";
import { sendFCMNotification } from "../lib/firebase";
import { PaymentStatus } from "@prisma/client";

// Midtrans configuration
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items, ...customerDetails } = req.body;
    const userId = req.user?.id;

    // Validate user
    if (!userId) throw createError(401, "User not authenticated");
    
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw createError(404, "User not found");

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
      if (!product) throw createError(400, `Product ${item.id} not found`);
      if (item.quantity > product.quantity) {
        throw createError(400, `Insufficient stock for ${product.name}`);
      }
      return {
        ...item,
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
        id: item.id,
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
              productId: item.id,
              price: item.currentPrice,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Update product quantities
      await Promise.all(
        validatedItems.map(item =>
          prisma.product.update({
            where: { id: item.id },
            data: { quantity: { decrement: item.quantity } },
          })
        )
      );

      return order;
    });

    res.json({
      orderId: order.id,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    });

  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { status, limit, page } = req.query;
    
    // Validate user
    if (!userId) throw createError(401, "User not authenticated");

    // Pagination settings
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause
    const where: any = { userId };
    if (status) {
      where.paymentStatus = status;
    }

    // Get orders with pagination
    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total: totalOrders,
        page: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalOrders / pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    // Validate user
    if (!userId) throw createError(401, "User not authenticated");

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                description: true
              }
            }
          }
        }
      }
    });

    // Check if order exists and belongs to the user
    if (!order) throw createError(404, "Order not found");
    if (order.userId !== userId) throw createError(403, "Unauthorized access");

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const handlePaymentNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notification = req.body;
    const { 
      order_id: orderId, 
      transaction_status: transactionStatus, 
      fraud_status: fraudStatus 
    } = notification;

    // Map Midtrans status to PaymentStatus enum
    const paymentStatus = getPaymentStatus(transactionStatus, fraudStatus);

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus, updatedAt: new Date() },
      include: { user: true },
    });

    // Send notification if payment succeeded
    if (paymentStatus === 'PAID' && updatedOrder.user?.fcmToken) {
      await sendPaymentSuccessNotification(updatedOrder.user.fcmToken, orderId);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Payment notification handling failed:', error);
    next(error);
  }
};

// Helper functions
function getPaymentStatus(
  transactionStatus: string,
  fraudStatus: string
): PaymentStatus {
  switch (transactionStatus) {
    case 'capture':
      return fraudStatus === 'accept' ? 'PAID' : 'FAILED';
    case 'settlement':
      return 'PAID';
    case 'deny':
    case 'expire':
    case 'cancel':
      return 'FAILED';
    case 'pending':
    default:
      return 'PENDING';
  }
}

async function sendPaymentSuccessNotification(
  fcmToken: string,
  orderId: string
): Promise<void> {
  const notificationPayload = {
    notification: {
      title: 'Payment Successful 🎉',
      body: `Order #${orderId} has been paid successfully!`,
    },
    data: {
      orderId,
      type: 'PAYMENT_SUCCESS',
    },
  };

  await sendFCMNotification(fcmToken, notificationPayload);
}