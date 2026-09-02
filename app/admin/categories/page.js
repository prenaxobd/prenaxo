import { prisma } from '@/lib/prisma';
import CategoryManager from '@/components/admin/CategoryManager';
export default async function Categories(){const categories=await prisma.category.findMany({where:{active:true},include:{_count:{select:{products:true}}},orderBy:{name:'asc'}});return <CategoryManager initialCategories={categories}/>}
