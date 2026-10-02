import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { invalidatePublicCache } from '@/lib/cache-tags';
import { z } from 'zod';
import { ensureDefaultPaymentMethods } from '@/lib/payment-methods';
import { assertSslCommerzReady, SSL_COMMERZ_CHANNELS } from '@/lib/sslcommerz';

const emptyToNull = (value) => {
  if (value === '' || value === undefined) return null;
  return value;
};

const methodType = z.enum(['COD', 'BANK_TRANSFER', 'MANUAL_WALLET', 'GATEWAY']);

const schema = z.object({
  code: z.string().trim().min(2).max(32),
  name: z.string().trim().min(2),
  type: methodType.default('MANUAL_WALLET'),
  description: z.preprocess(
    emptyToNull,
    z.string().trim().nullable().optional()
  ),
  logoUrl: z.preprocess(
    emptyToNull,
    z.string().url().max(512).refine((value) => value.startsWith('https://'), 'Logo URLs must use HTTPS.').nullable().optional()
  ),
  accountNumber: z.preprocess(
    emptyToNull,
    z.string().nullable().optional()
  ),
  accountName: z.preprocess(
    emptyToNull,
    z.string().nullable().optional()
  ),
  bankName: z.preprocess(
    emptyToNull,
    z.string().nullable().optional()
  ),
  branchName: z.preprocess(
    emptyToNull,
    z.string().nullable().optional()
  ),
  routingNumber: z.preprocess(
    emptyToNull,
    z.string().nullable().optional()
  ),
  instructions: z.preprocess(
    emptyToNull,
    z.string().trim().nullable().optional()
  ),
  requiresTransactionId: z.boolean().default(false),
  gatewayProvider: z.preprocess(emptyToNull, z.enum(['SSLCOMMERZ']).nullable().optional()),
  gatewayChannel: z.preprocess(emptyToNull, z.string().trim().max(64).nullable().optional()),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

function normalizeMethod(method) {
  if (method.type === 'GATEWAY' && method.gatewayProvider !== 'SSLCOMMERZ') {
    throw new Error('Choose a configured online payment provider.');
  }

  if (method.type === 'COD') {
    return { ...method, requiresTransactionId: false, gatewayProvider: null, gatewayChannel: null };
  }

  if (method.type !== 'GATEWAY') {
    return { ...method, gatewayProvider: null, gatewayChannel: null };
  }

  if (method.gatewayChannel && !SSL_COMMERZ_CHANNELS.includes(method.gatewayChannel.toLowerCase())) {
    throw new Error('Choose a supported SSLCommerz channel or leave it blank for all enabled channels.');
  }

  if (method.active) {
    try {
      assertSslCommerzReady();
    } catch {
      throw new Error('Configure valid SSLCommerz server credentials and a public HTTPS site URL before enabling this method.');
    }
  }

  return { ...method, requiresTransactionId: false, gatewayProvider: 'SSLCOMMERZ' };
}

function paymentMethodError(error) {
  if (error?.code === 'P2002') {
    return Response.json({ error: 'A payment method with this code already exists.' }, { status: 400 });
  }
  return jsonError(error);
}

export async function GET() {
  try {
    await requirePermission('settings.view');

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

    return Response.json(methods);
  } catch (error) {
    return paymentMethodError(error);
  }
}

export async function POST(request) {
  try {
    await requirePermission('settings.edit');

    const input = normalizeMethod(schema.parse(await request.json()));

    const method = await prisma.paymentMethod.create({
      data: {
        ...input,
        code: input.code.toUpperCase(),
      },
    });

    invalidatePublicCache('site-settings');
    return Response.json(method, {
      status: 201,
    });
  } catch (error) {
    return paymentMethodError(error);
  }
}

export async function PATCH(request) {
  try {
    await requirePermission('settings.edit');

    const { id, ...input } = await request.json();

    if (!id) {
      throw new Error('Payment method ID is required.');
    }

    const existing = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!existing) throw new Error('Payment method not found.');

    const data = normalizeMethod({ ...existing, ...schema.partial().parse(input) });
    if (data.code !== existing.code) throw new Error('Payment method code cannot be changed after creation.');
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;

    if (data.code) {
      data.code = data.code.toUpperCase();
    }

    const method = await prisma.paymentMethod.update({
      where: {
        id,
      },
      data,
    });

    invalidatePublicCache('site-settings');
    return Response.json(method);
  } catch (error) {
    return paymentMethodError(error);
  }
}

export async function DELETE(request) {
  try {
    await requirePermission('settings.edit');

    const id = new URL(request.url).searchParams.get('id');

    if (!id) {
      throw new Error('Payment method ID is required.');
    }

    // Payment methods are archived instead of physically deleted.
    const method = await prisma.paymentMethod.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });

    invalidatePublicCache('site-settings');
    return Response.json(method);
  } catch (error) {
    return paymentMethodError(error);
  }
}