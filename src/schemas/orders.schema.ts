// src/schemas/orders.schema.ts
import { z } from "zod";

export const OrderItemSchema = z.object({
    id: z.string().optional(),
    productName: z.string().min(1, "Product name is required"),
    price: z.number().positive("Price must be positive"),
    quantity: z.number().int().positive("Quantity must be positive integer"),
});

export const CreateTransactionSchema = z.object({
    items: z.array(OrderItemSchema).min(1, "At least one item is required"),
});

export const NotificationSchema = z.object({
    order_id: z.string(),
    transaction_status: z.enum([
        "capture",
        "settlement",
        "pending",
        "deny",
        "cancel",
        "expire",
        "failure",
    ]),
    gross_amount: z.string(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type NotificationInput = z.infer<typeof NotificationSchema>;