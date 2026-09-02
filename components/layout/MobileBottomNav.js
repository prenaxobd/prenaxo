'use client';
import Link from 'next/link';
import { Home, LayoutGrid, Search, ShoppingBag, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';
export default function MobileBottomNav(){const pathname=usePathname();const cart=useCart();const items=[['/',Home,'Home'],['/shop-menu',LayoutGrid,'Menu'],['/search',Search,'Search'],['/account',UserRound,'Account']];return <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{items.slice(0,2).map(([href,Icon,label])=><Link className={pathname===href?'active':''} href={href} key={href}><Icon size={19}/><span>{label}</span></Link>)}<button className="mobile-nav-cart" onClick={()=>cart?.open()}><ShoppingBag size={19}/><span>Cart</span>{cart?.count>0&&<b className="mobile-cart-badge">{cart.count}</b>}</button>{items.slice(2).map(([href,Icon,label])=><Link className={pathname===href?'active':''} href={href} key={href}><Icon size={19}/><span>{label}</span></Link>)}</nav>}
