import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
export async function GET(){const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Authentication required.'},{status:401});return NextResponse.json(await prisma.order.findMany({where:{userId:user.id},include:{items:true},orderBy:{createdAt:'desc'}}))}
