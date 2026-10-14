import Link from 'next/link';
import type {Metadata} from 'next';
import Studio from '@/components/Studio';
import {redirect} from 'next/navigation';
import {studioCallback} from '@/lib/studio-callback';
export const metadata:Metadata={title:'Cana Impex — Content studio',robots:{index:false,follow:false}};
export default async function StudioPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const callback=studioCallback((await searchParams).url);if(callback)redirect(callback);return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?<Studio/>:<main style={{fontFamily:'system-ui',maxWidth:700,margin:'80px auto',padding:30}}><h1>Cana Impex content studio</h1><p>The content studio is awaiting its Sanity project configuration. Public website content remains available.</p><p>Connect the project using the environment variables documented in the repository, then sign in with an authorized Sanity account.</p><Link href="/">Return to website</Link></main>;}
