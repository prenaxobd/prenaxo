import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
const schema=z.object({name:z.string().min(2),identifier:z.string().min(3),password:z.string().min(8)});
export async function POST(request){try{const input=schema.parse(await request.json());const value=input.identifier.trim();const isEmail=value.includes('@');const phone=isEmail?null:value.replace(/[^0-9+]/g,'');if (!isEmail && phone.length < 7) return NextResponse.json({error:'Enter a valid email or mobile number.'},{status:400});const email=isEmail?value.toLowerCase():`${phone.replace(/\D/g,'')}@phone.prenaxo.local`;const existing=await prisma.user.findFirst({where:{OR:[{email},{...(phone?{phone}:{})}]}});if(existing)return NextResponse.json({error:'An account with this email or mobile number already exists.'},{status:409});const user=await prisma.user.create({data:{name:input.name.trim(),email,phone,passwordHash:await bcrypt.hash(input.password,12)}});await createSession(user.id);return NextResponse.json({user:{id:user.id,name:user.name,email:user.email}})}catch(error){return NextResponse.json({error:error?.issues?.[0]?.message||'Registration failed.'},{status:400})}}
