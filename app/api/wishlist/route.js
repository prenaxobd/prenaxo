import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function currentUser() { return getCurrentUser(); }
	export async function GET() {
	  const user = await currentUser();
	  if (!user) return NextResponse.json({ items: [], count: 0 });

	  const wishlist = await prisma.wishlist.findUnique({
	    where: { userId: user.id },
	    include: { items: { select: { productId: true } } },
	  });

	  const items = wishlist?.items || [];
	  return NextResponse.json({ ...(wishlist || {}), items, count: items.length });
	}
	export async function POST(request) {
	  const user = await currentUser();
	  if (!user) return NextResponse.json({ error: 'অনুগ্রহ করে আগে লগইন করুন।' }, { status: 401 });

	  try {
	    const { productId } = await request.json();
	    const product = await prisma.product.findFirst({ where: { id: productId, active: true } });
	    if (!product) return NextResponse.json({ error: 'পণ্যটি এখন পাওয়া যাচ্ছে না।' }, { status: 404 });

	    const wishlist = await prisma.wishlist.upsert({
	      where: { userId: user.id },
	      create: { userId: user.id },
	      update: {},
	    });
	    const existing = await prisma.wishlistItem.findUnique({
	      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
	    });

	    if (existing) {
	      await prisma.wishlistItem.delete({ where: { id: existing.id } });
	    } else {
	      await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
	    }

	    const count = await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } });
	    return NextResponse.json({ saved: !existing, count });
	  } catch {
	    return NextResponse.json({ error: 'উইশলিস্ট আপডেট করা যায়নি।' }, { status: 400 });
	  }
	}
