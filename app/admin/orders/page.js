import { prisma } from '@/lib/prisma';
import OrderManager from '@/components/admin/OrderManager';
export default async function Orders(){const orders=await prisma.order.findMany({include:{items:true},orderBy:{createdAt:'desc'}});return <OrderManager initialOrders={orders.map(order=>({...order,total:Number(order.total),createdAt:order.createdAt.toISOString()}))}/>}
