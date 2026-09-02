'use client';
import { useCart } from '@/components/cart/CartProvider';
export default function CartCount() { const cart = useCart(); return <i className="count">{cart?.count || 0}</i>; }