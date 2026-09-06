import { prisma } from '@/lib/prisma';
import CouponManager from '@/components/admin/CouponManager';
export default async function Coupons(){const coupons=await prisma.coupon.findMany({orderBy:{code:'asc'}});return <CouponManager initialCoupons={coupons.map(c=>({...c,value:Number(c.value),minimumOrder:c.minimumOrder?Number(c.minimumOrder):null,expiresAt:c.expiresAt?.toISOString()||null}))}/>}
