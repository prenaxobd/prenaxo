import { prisma } from '@/lib/prisma';
import ProductManager from '@/components/admin/ProductManager';
export default async function Products(){const [products,categories]=await Promise.all([prisma.product.findMany({where:{active:true},include:{category:true,images:{orderBy:{sortOrder:'asc'}}},orderBy:{createdAt:'desc'}}),prisma.category.findMany({where:{active:true},orderBy:{name:'asc'}})]);return <ProductManager initialProducts={products.map(p=>({...p,regularPrice:Number(p.regularPrice),salePrice:p.salePrice?Number(p.salePrice):null}))} categories={categories}/>}
