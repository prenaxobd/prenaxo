import { prisma } from '@/lib/prisma';
import { ensureDefaultPaymentMethods } from '@/lib/payment-methods';
import PaymentMethodsManager from '@/components/admin/PaymentMethodsManager';

export default async function PaymentMethodsPage() {
  await ensureDefaultPaymentMethods();

  const methods = await prisma.paymentMethod.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
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
      <div className="admin-page-heading payment-methods-heading">
        <div>
          <div className="eyebrow">Store control</div>
          <h1>Payment Methods</h1>
          <p className="muted">Manage payment options and account details shown at checkout.</p>
        </div>
        <span className="payment-methods-count">{initialMethods.length} methods</span>
      </div>
      <PaymentMethodsManager initialMethods={initialMethods} />
    </>
  );
}