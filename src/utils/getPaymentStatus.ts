import { PaymentStatus } from "@prisma/client";

export function getPaymentStatus(
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
    case 'failure':
    case 'cancel':
      return 'FAILED';
    case 'pending':
    default:
      return 'PENDING';
  }
}