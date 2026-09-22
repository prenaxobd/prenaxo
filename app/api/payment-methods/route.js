import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: {
        active: true,
      },
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    return Response.json(
      methods.map((method) => ({
        id: method.code,
        code: method.code,
        title: method.name,
        name: method.name,
        short: method.code,
        detail: method.description,

        accountNumber: method.accountNumber,
        accountName: method.accountName,

        bankName: method.bankName,
        branchName: method.branchName,
        routingNumber: method.routingNumber,

        instructions: method.instructions,
      }))
    );
  } catch (error) {
    console.error('Payment methods API error:', error);

    return Response.json(
      {
        error: 'Unable to load payment methods.',
      },
      {
        status: 500,
      }
    );
  }
}