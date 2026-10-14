import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/content';
export default function robots():MetadataRoute.Robots{return {rules:process.env.VERCEL_ENV==='preview'?{userAgent:'*',disallow:'/'}:{userAgent:'*',allow:'/',disallow:['/studio','/api/','/request-received','/fr/request-received']},sitemap:siteUrl+'/sitemap.xml'};}
