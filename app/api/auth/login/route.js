import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
export async function POST(request){try{const {identifier,email,password}=await request.json();const value=String(identifier||email||'').trim();const user=await prisma.user.findFirst({where:{OR:[{email:value.toLowerCase()},{phone:value}]}});if(!user?.passwordHash||!(await bcrypt.compare(String(password||''),user.passwordHash)))return NextResponse.json({error:'Invalid email/mobile number or password.'},{status:401});await createSession(user.id);return NextResponse.json({user:{id:user.id,name:user.name,email:user.email,role:user.role}})}catch{return NextResponse.json({error:'Login failed.'},{status:400})}}
