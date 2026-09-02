import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
const schema=z.object({name:z.string().min(2),email:z.string().email(),password:z.string().min(8),phone:z.string().optional()});
export async function POST(request){try{const input=schema.parse(await request.json());const existing=await prisma.user.findUnique({where:{email:input.email}});if(existing)return NextResponse.json({error:'An account with this email already exists.'},{status:409});const user=await prisma.user.create({data:{name:input.name,email:input.email,phone:input.phone,passwordHash:await bcrypt.hash(input.password,12)}});await createSession(user.id);return NextResponse.json({user:{id:user.id,name:user.name,email:user.email}})}catch(error){return NextResponse.json({error:error?.issues?.[0]?.message||'Registration failed.'},{status:400})}}
