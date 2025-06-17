import admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')
  })
});

const prisma = new PrismaClient();

export async function sendNotificationToAdmins(orderId: string) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', fcmToken: { not: null } },
      select: { fcmToken: true }
    });

    const tokens = admins.map(admin => admin.fcmToken).filter(Boolean);

    if (tokens.length === 0) {
      return { success: false, message: 'No admin FCM tokens available' };
    }

    const message = {
      notification: {
        title: "Pesanan Baru Diterima!",
        body: `Pesanan baru #${orderId || "Tidak Ada order ID"} telah dibuat oleh pengguna.`,
      },
      tokens,
    };

    console.log('Sending notifications to admins:', message);

    const response = await admin.messaging().sendEachForMulticast(message);

    return {
      success: true,
      message: `Notification sent to ${response.successCount} admins successfully.`,
      failed: response.failureCount,
    };
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      message: 'Failed to send notifications',
      error: error.message,
    };
  }
}

export async function sendPaymentNotification(orderId: string) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", fcmToken: { not: null } },
      select: { fcmToken: true },
    });

    const tokens = admins.map((admin) => admin.fcmToken).filter(Boolean);

    if (tokens.length === 0) {
      return { success: false, message: "No admin FCM tokens available" };
    }

    // 📢 Pesan notifikasi untuk pesanan yang telah dibayar
    const message = {
      notification: {
        title: "Pembayaran Berhasil!",
        body: `Pesanan #${orderId || "Tidak Ada order ID"} telah berhasil dibayar oleh pelanggan.`,
      },
      tokens,
    };

    console.log("Sending payment notifications to admins:", message);

    const response = await admin.messaging().sendEachForMulticast(message);

    return {
      success: true,
      message: `Payment notification sent to ${response.successCount} admins successfully.`,
      failed: response.failureCount,
    };
  } catch (error: any) {
    console.error("Error sending payment notification:", error);
    return {
      success: false,
      message: "Failed to send payment notifications",
      error: error.message,
    };
  }
}
