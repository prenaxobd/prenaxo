import { prisma } from '@/lib/prisma';
import CategoryManager from '@/components/admin/CategoryManager';
export default async function Categories(){const [categories,attributes]=await Promise.all([prisma.category.findMany({where:{active:true},include:{_count:{select:{products:true}},attributes:{include:{attribute:true}}},orderBy:{name:'asc'}}),prisma.attribute.findMany({where:{active:true},orderBy:[{sortOrder:'asc'},{name:'asc'}]})]);return <CategoryManager initialCategories={categories} attributes={attributes}/>}
