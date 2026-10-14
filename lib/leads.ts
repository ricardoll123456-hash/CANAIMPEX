import {createHash,createHmac,randomUUID} from 'node:crypto';
import {Redis} from '@upstash/redis';
import {Ratelimit} from '@upstash/ratelimit';
import {Resend} from 'resend';
import {schemaFor,type LeadKind} from './validation';
export type Store={get:(key:string)=>Promise<{status:string;reference:string}|null>;set:(key:string,value:unknown,options:{nx?:boolean;ex:number})=>Promise<unknown>;del:(key:string)=>Promise<unknown>};
export type LeadDependencies={store:Store;limit:(id:string)=>Promise<boolean>;send:(message:{subject:string;text:string;replyTo:string},key:string)=>Promise<boolean>;salt:string};
export async function processLead(kind:LeadKind,input:unknown,ip:string,deps:LeadDependencies){
 const parsed=schemaFor(kind).safeParse(input);
 if(!parsed.success)return {status:400,body:{ok:false,code:'validation',fieldErrors:parsed.error.flatten().fieldErrors}};
 const lead=parsed.data;if(lead.website)return {status:400,body:{ok:false,code:'invalid'}};
 const {submissionId,website,sourcePage,...data}=lead;void website;
 const fingerprint=createHash('sha256').update(JSON.stringify(data)).digest('hex');
 const key='cana:lead:'+createHash('sha256').update((submissionId||randomUUID())+fingerprint).digest('hex');
 const cached=await deps.store.get(key);if(cached?.status==='sent')return {status:200,body:{ok:true,reference:cached.reference}};
 if(cached)return {status:409,body:{ok:false,code:'pending'}};
 const client=createHmac('sha256',deps.salt).update(ip).digest('hex');
 if(!await deps.limit(client))return {status:429,body:{ok:false,code:'rate_limit'}};
 const reference='CI-'+key.slice(-10).toUpperCase();
 const locked=await deps.store.set(key,{status:'pending',reference},{nx:true,ex:300});
 if(!locked)return {status:409,body:{ok:false,code:'pending'}};
 try{
 const lines=Object.entries(data).map(([name,value])=>`${name}: ${String(value)}`).join('\n');
 const accepted=await deps.send({subject:`Cana Impex — ${kind==='quote'?'Vehicle export request':'Contact inquiry'} — ${reference}`,text:`Reference: ${reference}\n\n${lines}\n\nSource page: ${sourcePage||'direct'}\n\nMarketing consent is separate from this commercial inquiry.`,replyTo:lead.email},key);
 if(!accepted){await deps.store.del(key);return {status:502,body:{ok:false,code:'delivery'}};}
 await deps.store.set(key,{status:'sent',reference},{ex:86400});
 return {status:200,body:{ok:true,reference}};
 }catch{await deps.store.del(key).catch(()=>undefined);return {status:503,body:{ok:false,code:'unavailable'}};}
}
function dependencies():LeadDependencies|null{const {RESEND_API_KEY,QUOTE_FROM_EMAIL,QUOTE_TO_EMAIL,RATE_LIMIT_SALT}=process.env;const UPSTASH_REDIS_REST_URL=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;const UPSTASH_REDIS_REST_TOKEN=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;if(!RESEND_API_KEY||!QUOTE_FROM_EMAIL||!QUOTE_TO_EMAIL||!UPSTASH_REDIS_REST_URL||!UPSTASH_REDIS_REST_TOKEN||!RATE_LIMIT_SALT)return null;const redis=new Redis({url:UPSTASH_REDIS_REST_URL,token:UPSTASH_REDIS_REST_TOKEN});const limiter=new Ratelimit({redis,limiter:Ratelimit.slidingWindow(5,'10 m'),prefix:'cana:rate',analytics:false});const mail=new Resend(RESEND_API_KEY);return {store:redis as Store,salt:RATE_LIMIT_SALT,limit:async id=>(await limiter.limit(id)).success,send:async(m,key)=>{const result=await mail.emails.send({from:QUOTE_FROM_EMAIL,to:[QUOTE_TO_EMAIL],subject:m.subject,text:m.text,replyTo:m.replyTo},{idempotencyKey:key});return !!result.data?.id&&!result.error;}};}
export async function handleLead(request:Request,kind:LeadKind){
 const publicUrl=new URL(request.url);const host=request.headers.get('host');if(host&&/^[a-zA-Z0-9.:[\]-]+$/.test(host))publicUrl.host=host;if(request.headers.get('x-forwarded-proto')==='https')publicUrl.protocol='https:';
 const origin=request.headers.get('origin');if(origin&&origin!==publicUrl.origin)return Response.json({ok:false,code:'origin'},{status:403});
 if(Number(request.headers.get('content-length'))>16384)return Response.json({ok:false,code:'size'},{status:413});
 const form=!request.headers.get('content-type')?.includes('application/json');let input:unknown;
 try{const raw=await request.text();if(Buffer.byteLength(raw)>16384)return Response.json({ok:false,code:'size'},{status:413});if(form){const fields=Object.fromEntries(new URLSearchParams(raw));input={...fields,privacy:fields.privacy==='on',marketingConsent:fields.marketingConsent==='on'};}else input=JSON.parse(raw);}catch{return Response.json({ok:false,code:'invalid'},{status:400});}
 const parsed=schemaFor(kind).safeParse(input);if(!parsed.success)return Response.json({ok:false,code:'validation',fieldErrors:parsed.error.flatten().fieldErrors},{status:400});
 if(process.env.INQUIRY_DELIVERY_MODE==='email')return Response.json({ok:false,code:'email_required'},{status:409,headers:{'Cache-Control':'no-store'}});
 const deps=dependencies();if(!deps)return Response.json({ok:false,code:'unavailable'},{status:503});
 try{const result=await processLead(kind,parsed.data,request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'unknown',deps);if(form&&result.body.ok){const url=new URL(parsed.data.locale==='fr'?'/fr/request-received':'/request-received',publicUrl.origin);url.searchParams.set('reference',result.body.reference!);return Response.redirect(url,303);}return Response.json(result.body,{status:result.status,headers:{'Cache-Control':'no-store'}});}catch{return Response.json({ok:false,code:'unavailable'},{status:503});}
}
