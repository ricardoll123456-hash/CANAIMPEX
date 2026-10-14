// Vercel's native Sanity integration can return the legacy ?url= callback.
// Current Sanity consumes #sid=. Normalize only the exact trusted endpoint;
// Sanity itself still exchanges and validates the session credential.
export function studioCallback(value:unknown):string|null{
 if(typeof value!=='string')return null;
 try{
  const url=new URL(value),sid=url.searchParams.get('sid');
  if(url.origin!=='https://api.sanity.io'||url.pathname!=='/v1/auth/fetch'||url.username||url.password||!sid||!/^[a-zA-Z0-9_-]{20,512}$/.test(sid))return null;
  return '/studio#sid='+encodeURIComponent(sid);
 }catch{return null;}
}
