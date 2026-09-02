import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonError } from '@/lib/admin';

const schema = z.object({ title: z.string().min(2), subtitle: z.string().nullable().optional(), image: z.string().nullable().optional(), desktopImage: z.string().nullable().optional(), mobileImage: z.string().nullable().optional(), link: z.string().nullable().optional(), buttonText: z.string().nullable().optional(), startAt: z.coerce.date().nullable().optional(), endAt: z.coerce.date().nullable().optional(), active: z.boolean().default(true), sortOrder: z.coerce.number().int().default(0) });

export async function GET() { try { await requireAdmin(); return Response.json(await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } })); } catch (error) { return jsonError(error); } }
export async function POST(request) { try { await requireAdmin(); return Response.json(await prisma.banner.create({ data: schema.parse(await request.json()) }), { status: 201 }); } catch (error) { return jsonError(error); } }
export async function PATCH(request) { try { await requireAdmin(); const { id, ...input } = await request.json(); return Response.json(await prisma.banner.update({ where: { id }, data: schema.partial().parse(input) })); } catch (error) { return jsonError(error); } }
export async function DELETE(request) { try { await requireAdmin(); const id = new URL(request.url).searchParams.get('id'); return Response.json(await prisma.banner.update({ where: { id }, data: { active: false } })); } catch (error) { return jsonError(error); } }
