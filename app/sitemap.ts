import type {MetadataRoute} from 'next';
import {routePaths,href,siteUrl} from '@/lib/content';
export default function sitemap():MetadataRoute.Sitemap{return routePaths.flatMap(path=>{const p=path?'/'+path:'/';return (['en','fr']as const).map(locale=>({url:siteUrl+href(locale,p),alternates:{languages:{en:siteUrl+href('en',p),fr:siteUrl+href('fr',p)}}}));});}
