import { getCurrentUser } from './auth';
export async function requireAdmin(){
  const user=await getCurrentUser();
  if(!user || user.role!=='ADMIN') throw new Error('ADMIN_REQUIRED');
  return user;
}
export function jsonError(error){
  const status=error.message==='ADMIN_REQUIRED'?403:400;
  return Response.json({error:status===403?'Admin access required.':error.message||'Request failed.'},{status});
}
