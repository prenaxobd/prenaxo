import { prisma } from '@/lib/prisma';
import { ensureDefaultPaymentMethods } from '@/lib/payment-methods';
import PaymentMethodsManager from '@/components/admin/PaymentMethodsManager';

export default async function PaymentMethodsPage() {
  await ensureDefaultPaymentMethods();

  const methods = await prisma.paymentMethod.findMany({
    orderBy: [
      {
        sortOrder: 'asc',
      },
      {
        createdAt: 'asc',
      },
    ],
  });

  const initialMethods = methods.map((method) => ({
    id: method.id,
    code: method.code,
    name: method.name,
    description: method.description || '',
    accountNumber: method.accountNumber || '',
    accountName: method.accountName || '',
    bankName: method.bankName || '',
    branchName: method.branchName || '',
    routingNumber: method.routingNumber || '',
    instructions: method.instructions || '',
    active: method.active,
    sortOrder: method.sortOrder,
    createdAt: method.createdAt?.toISOString(),
    updatedAt: method.updatedAt?.toISOString(),
  }));

  return (
    <>
      <div className="eyebrow" style={{ color: 'var(--coral)' }}>
        Store control
      </div>

      <h1>Payment Methods</h1>

      <p
        style={{
          marginBottom: 24,
          color: 'var(--muted)',
        }}
      >
        Manage Cash on Delivery, bKash, Nagad and bank payment details shown at
        checkout.
      </p>

      <PaymentMethodsManager initialMethods={initialMethods} />
    </>
  );
}