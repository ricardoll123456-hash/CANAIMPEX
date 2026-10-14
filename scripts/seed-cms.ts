import {createClient} from '@sanity/client';
import pages from '../lib/pages.json' with {type:'json'};
import data from '../lib/data.json' with {type:'json'};
const {NEXT_PUBLIC_SANITY_PROJECT_ID:projectId,SANITY_API_WRITE_TOKEN:token}=process.env;
if(!projectId||!token)throw new Error('Set the Sanity project and a scoped write token before seeding.');
const client=createClient({projectId,dataset:process.env.NEXT_PUBLIC_SANITY_DATASET||'production',apiVersion:'2026-10-14',useCdn:false,token});
let tx=client.transaction();tx=tx.createIfNotExists({_id:'siteSettings',_type:'siteSettings',title:'Cana Impex'});
for(const locale of ['en','fr']as const){tx=tx.createIfNotExists({_id:'home-'+locale,_type:'homePage',locale,translationKey:'home',lastReviewedAt:'2026-10-14',headline:locale==='fr'?'Votre prochain véhicule.':'Your next car.',headlineAccent:locale==='fr'?'Au-delà des frontières.':'Beyond borders.',lead:locale==='fr'?'De la recherche du bon véhicule à la préparation de son voyage. Un interlocuteur pour clarifier votre prochain projet automobile.':'From finding the right vehicle to preparing its journey. A focused conversation for your next international vehicle purchase.'});
for(const [route,translations]of Object.entries(pages)){const p=translations[locale];tx=tx.createIfNotExists({_id:route.replaceAll('/','-')+'-'+locale,_type:'page',locale,translationKey:route,route,lastReviewedAt:'2026-10-14',...p,sections:p.sections.map((s,i)=>({...s,_key:'section-'+i,_type:'object'}))});}
for(const v of data.vehicles)tx=tx.createIfNotExists({_id:'category-'+v.slug+'-'+locale,_type:'vehicleCategory',locale,translationKey:v.slug,lastReviewedAt:'2026-10-14',slug:{_type:'slug',current:v.slug},title:v.name[locale],description:v.description[locale]});}
let result;try{result=await tx.commit();}catch(error){console.error('CMS seed failed:',error instanceof Error?error.message:'Request failed');process.exit(1);}console.log(`Seeded initial automotive content. Transaction: ${result.transactionId}. Existing documents were preserved.`);
