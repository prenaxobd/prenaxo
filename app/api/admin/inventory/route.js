import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonError } from '@/lib/admin';
import { z } from 'zod';

const adjustmentSchema = z.object({
  productId: z.string().min(1),
  quantityChange: z.coerce.number().int(),
  reason: z.string().min(2),
  type: z.string().min(2).default('ADJUSTMENT'),
});

export async function PATCH(request) {
  try {
    const admin = await requireAdmin();
    const input = adjustmentSchema.parse(await request.json());
    const result = await prisma.$transaction(async transaction => {
      const product = await transaction.product.findUnique({ where: { id: input.productId }, select: { stock: true } });
      if (!product) throw new Error('Product not found.');
      const newStock = product.stock + input.quantityChange;
      if (newStock < 0) throw new Error('Stock cannot be negative.');
      await transaction.product.update({ where: { id: input.productId }, data: { stock: newStock } });
      return transaction.inventoryMovement.create({ data: { ...input, previousStock: product.stock, newStock, adminId: admin.id } });
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
