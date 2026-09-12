import { prisma } from '@/lib/prisma';

export const DEFAULT_PAYMENT_METHODS = [
  {
    code: 'COD',
    name: 'Cash on Delivery',
    description: 'Pay for your order when it is delivered to your address.',
    accountNumber: null,
    accountName: null,
    bankName: null,
    branchName: null,
    routingNumber: null,
    instructions:
      'You can pay cash when your order is delivered to your address.',
    active: true,
    sortOrder: 1,
  },

  {
    code: 'BKASH',
    name: 'bKash',
    description: 'Send payment using bKash and enter your transaction ID.',
    accountNumber: '01608069154',
    accountName: null,
    bankName: null,
    branchName: null,
    routingNumber: null,
    instructions:
      'Send the payment to the bKash number above and enter your transaction ID before placing the order.',
    active: true,
    sortOrder: 2,
  },

  {
    code: 'NAGAD',
    name: 'Nagad',
    description: 'Send payment using Nagad and enter your transaction ID.',
    accountNumber: '01608069154',
    accountName: null,
    bankName: null,
    branchName: null,
    routingNumber: null,
    instructions:
      'Send the payment to the Nagad number above and enter your transaction ID before placing the order.',
    active: true,
    sortOrder: 3,
  },

  {
    code: 'BANK',
    name: 'Bank Payment',
    description: 'Pay through bank transfer.',
    accountNumber: null,
    accountName: null,
    bankName: null,
    branchName: null,
    routingNumber: null,
    instructions:
      'Our team will contact you with bank payment details after placing your order.',
    active: true,
    sortOrder: 4,
  },
];

export async function ensureDefaultPaymentMethods(db = prisma) {
  const count = await db.paymentMethod.count();

  if (count > 0) {
    return;
  }

  await db.paymentMethod.createMany({
    data: DEFAULT_PAYMENT_METHODS,
    skipDuplicates: true,
  });
}