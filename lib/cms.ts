import {createClient} from 'next-sanity';
import {unstable_cache} from 'next/cache';
import {draftMode} from 'next/headers';
import {vehicles,type Locale,type VehicleCategory} from './content';
import type {PageContent} from '@/components/Pages';
export const cmsConfigured=!!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const cmsClient=()=>createClient({projectId:process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,dataset:process.env.NEXT_PUBLIC_SANITY_DATASET||'production',apiVersion:'2026-10-14',useCdn:true});
const published=unstable_cache(async(query:string,params:Record<string,string>)=>cmsClient().fetch(query,params,{perspective:'published'}),['cana-content'],{tags:['cms'],revalidate:3600});
async function content<T>(query:string,params:Record<string,string>={}):Promise<T|null>{if(!cmsConfigured)return null;try{const draft=await draftMode();if(draft.isEnabled&&process.env.SANITY_API_READ_TOKEN)return await cmsClient().withConfig({useCdn:false,token:process.env.SANITY_API_READ_TOKEN}).fetch(query,params,{perspective:'drafts'});return await published(query,params);}catch{return null;}}
export const getCmsPage=(route:string,locale:Locale)=>content<PageContent>('*[_type=="page" && route==$route && locale==$locale][0]{eyebrow,title,lead,sections,seoDescription}',{route,locale});
export const getCmsHome=(locale:Locale)=>content<{headline:string;headlineAccent:string;lead:string}>('*[_type=="homePage" && locale==$locale][0]{headline,headlineAccent,lead}',{locale});
export const getCmsSettings=()=>content<{legalName?:string;publicContactEmail?:string;phone?:string;approvedMarkets?:string[]}>('*[_type=="siteSettings"][0]{legalName,publicContactEmail,phone,approvedMarkets}');
export async function getCmsVehicles(locale:Locale):Promise<VehicleCategory[]>{const entries=await content<{slug:string;title:string;description:string}[]>('*[_type=="vehicleCategory" && locale==$locale]{"slug":slug.current,title,description}',{locale});return vehicles.map(v=>{const entry=entries?.find(e=>e.slug===v.slug);return entry?{...v,name:{...v.name,[locale]:entry.title},description:{...v.description,[locale]:entry.description}}:v;});}
export const getCmsDocuments=(locale:Locale)=>content<{title:string;url:string}[]>('*[_type=="publicDocument" && locale==$locale && approvedForPublic==true && (!defined(expiryDate)||expiryDate>=now()[0...10])]{title,"url":file.asset->url}',{locale});
