import { prisma } from '@/lib/prisma';
import { getUserPermissions, requirePermission } from '@/lib/admin';
import { isSslCommerzConfigured } from '@/lib/sslcommerz';
import { ensureDefaultPaymentMethods } from '@/lib/payment-methods';
import PaymentMethodsManager from '@/components/admin/PaymentMethodsManager';

export const dynamic = 'force-dynamic';

export default async function PaymentMethodsPage() {
  const admin = await requirePermission('settings.view');
  await ensureDefaultPaymentMethods();
  const [methods, permissions] = await Promise.all([
    prisma.paymentMethod.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }),
    getUserPermissions(admin.id),
  ]);

  const initialMethods = methods.map((method) => ({
    id: method.id,
    code: method.code,
    name: method.name,
    type: method.type,
    description: method.description || '',
    logoUrl: method.logoUrl || '',
    requiresTransactionId: method.requiresTransactionId,
    gatewayProvider: method.gatewayProvider || '',
    gatewayChannel: method.gatewayChannel || '',
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
      <PaymentMethodsManager initialMethods={initialMethods} gatewayConfigured={isSslCommerzConfigured()} canManage={permissions.includes('settings.edit')} />
    </>
  );
}