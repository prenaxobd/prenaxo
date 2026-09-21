import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const metadata = {
	title: 'Order Confirmation',
	robots: { index: false, follow: true },
};

export default async function OrderSuccess({searchParams}){const orderNumber=(await searchParams).order;const order=orderNumber?await prisma.order.findUnique({where:{orderNumber},select:{orderNumber:true,total:true,paymentMethod:true,paymentStatus:true}}):null;return <main className="container page-title"><div className="form" style={{maxWidth:650,margin:'30px auto',textAlign:'center'}}><CheckCircle2 size={58} color="var(--green)"/><div className="eyebrow" style={{marginTop:20}}>Order confirmed</div><h1>Thank you for shopping with Prenaxo.</h1>{order?<><p className="muted">Order ID: <strong>{order.orderNumber}</strong></p><h2>৳{Number(order.total).toLocaleString()}</h2><p className="muted">Payment: {order.paymentMethod} · {order.paymentStatus}</p><Link className="btn" href={`/track-order`}>Track your order <ArrowRight size={16}/></Link></>:<p className="muted">Your order details are unavailable.</p>}<p><Link href="/shop" style={{color:'var(--green)',fontWeight:700}}>Continue shopping</Link></p></div></main>}
