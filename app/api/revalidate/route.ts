import {revalidateTag} from 'next/cache';
import {parseBody} from 'next-sanity/webhook';
import type {NextRequest} from 'next/server';
export async function POST(request:NextRequest){const secret=process.env.SANITY_REVALIDATE_SECRET;if(!secret)return Response.json({ok:false},{status:503});try{const {isValidSignature}=await parseBody(request,secret);if(!isValidSignature)return Response.json({ok:false},{status:401});revalidateTag('cms','max');return Response.json({ok:true});}catch{return Response.json({ok:false},{status:400});}}
