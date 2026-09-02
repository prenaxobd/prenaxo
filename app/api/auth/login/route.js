import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
export async function POST(request){try{const {email,password}=await request.json();const user=await prisma.user.findUnique({where:{email}});if(!user?.passwordHash||!(await bcrypt.compare(password,user.passwordHash)))return NextResponse.json({error:'Invalid email or password.'},{status:401});await createSession(user.id);return NextResponse.json({user:{id:user.id,name:user.name,email:user.email,role:user.role}})}catch{return NextResponse.json({error:'Login failed.'},{status:400})}}
