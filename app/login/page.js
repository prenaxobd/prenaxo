'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Login(){
	const [email,setEmail]=useState('');
	const [password,setPassword]=useState('');
	const [error,setError]=useState('');
	const [loading,setLoading]=useState(false);
	async function submit(event){
		event.preventDefault();
		setError(''); setLoading(true);
		try{
			const response=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
			const result=await response.json();
			if(!response.ok) throw new Error(result.error||'Unable to sign in.');
			const next=new URLSearchParams(window.location.search).get('next');
			const safeNext=next === '/admin' || next?.startsWith('/admin/') ? next : '/account';
			window.location.assign(safeNext);
		}catch(error){setError(error.message)}finally{setLoading(false)}
	}
	return <main className="container page-title"><form className="form" style={{margin:'20px auto'}} onSubmit={submit}><div className="eyebrow" style={{color:'var(--coral)'}}>Welcome back</div><h1>Sign in</h1><label>Email address<input type="email" value={email} onChange={event=>setEmail(event.target.value)} required autoComplete="email"/></label><label>Password<input type="password" value={password} onChange={event=>setPassword(event.target.value)} required autoComplete="current-password"/></label>{error&&<p role="alert" style={{color:'var(--coral)'}}>{error}</p>}<button className="btn" disabled={loading} style={{width:'100%',justifyContent:'center',marginTop:18}}>{loading?'Signing in...':'Sign in'}</button><p className="muted">New to Prenaxo? <Link href="/register" style={{color:'var(--green)',fontWeight:700}}>Create an account</Link></p></form></main>}
