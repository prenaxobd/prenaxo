import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';
const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'development-only-secret');
export async function createSession(userId){const token=await new SignJWT({userId}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret);(await cookies()).set('khatibazar_session',token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:604800,path:'/'});}
export async function getCurrentUser(){try{const token=(await cookies()).get('khatibazar_session')?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret);return prisma.user.findUnique({where:{id:payload.userId}})}catch{return null;}}
