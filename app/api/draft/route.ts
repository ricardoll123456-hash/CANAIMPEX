import {defineEnableDraftMode} from 'next-sanity/draft-mode';
import {cmsClient,cmsConfigured} from '@/lib/cms';
export async function GET(request:Request){if(!cmsConfigured||!process.env.SANITY_API_READ_TOKEN)return new Response('Preview unavailable',{status:503});const {GET}=defineEnableDraftMode({client:cmsClient().withConfig({useCdn:false,token:process.env.SANITY_API_READ_TOKEN})});return GET(request);}
