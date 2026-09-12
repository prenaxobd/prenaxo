import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { z } from 'zod';
import { ensureDefaultPaymentMethods } from '@/lib/payment-methods';

const emptyToNull = (value) => {
  if (value === '' || value === undefined) return null;
  return value;
};

const schema = z.object({
  code: z.string().min(2).max(32),
  name: z.string().min(2),
  description: z.preprocess(
    emptyToNull,
    z.string().nullable().optional()
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
    z.string().nullable().optional()
  ),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

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
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    await requirePermission('settings.edit');

    const input = schema.parse(await request.json());

    const method = await prisma.paymentMethod.create({
      data: {
        ...input,
        code: input.code.toUpperCase(),
      },
    });

    return Response.json(method, {
      status: 201,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request) {
  try {
    await requirePermission('settings.edit');

    const { id, ...input } = await request.json();

    if (!id) {
      throw new Error('Payment method ID is required.');
    }

    const data = schema.partial().parse(input);

    if (data.code) {
      data.code = data.code.toUpperCase();
    }

    const method = await prisma.paymentMethod.update({
      where: {
        id,
      },
      data,
    });

    return Response.json(method);
  } catch (error) {
    return jsonError(error);
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

    return Response.json(method);
  } catch (error) {
    return jsonError(error);
  }
}