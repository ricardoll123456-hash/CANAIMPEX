'use client';
import {useEffect,useState,useSyncExternalStore} from 'react';
import Script from 'next/script';
import Link from 'next/link';
import {ui,href,type Locale} from '@/lib/content';
function subscribe(callback:()=>void){ window.addEventListener('storage',callback);window.addEventListener('cana-consent',callback);return()=>{window.removeEventListener('storage',callback);window.removeEventListener('cana-consent',callback);}; }
function snapshot(){try{return localStorage.getItem('cana-consent');}catch{return null;}}
export function CookieConsent({locale}:{locale:Locale}){
 const t=ui(locale);const consent=useSyncExternalStore(subscribe,snapshot,()=>null);const [open,setOpen]=useState(false);
 useEffect(()=>{const fn=()=>setOpen(true);window.addEventListener('cana-cookie-open',fn);return()=>window.removeEventListener('cana-cookie-open',fn);},[]);
 function choose(value:string){const revoke=consent==='accepted'&&value!=='accepted';try{localStorage.setItem('cana-consent',value);}catch{} window.dispatchEvent(new Event('cana-consent'));setOpen(false);if(revoke){document.cookie.split(';').forEach(c=>{const key=c.trim().split('=')[0];if(key.startsWith('_ga')){document.cookie=`${key}=;max-age=0;path=/`;document.cookie=`${key}=;max-age=0;path=/;domain=.${location.hostname}`;}});location.reload();}}
 const gtm=process.env.NEXT_PUBLIC_GTM_ID;
 return <>{consent==='accepted'&&gtm&&/^GTM-[A-Z0-9]+$/.test(gtm)&&<><Script id="gtm-init">{`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`}</Script><Script id="gtm" src={`https://www.googletagmanager.com/gtm.js?id=${gtm}`}/></>}{(consent===null||open)&&<section className="cookie-panel" aria-label={t.cookies}><div><strong>{t.consentTitle}</strong><p>{t.consentBody} <Link href={href(locale,'/privacy')}>{t.learn}</Link></p></div><div className="cookie-actions"><button className="button button-secondary" onClick={()=>choose('rejected')}>{t.reject}</button><button className="button" onClick={()=>choose('accepted')}>{t.accept}</button></div></section>}</>;
}
export function CookieButton({label}:{label:string}){return <button className="text-button" onClick={()=>window.dispatchEvent(new Event('cana-cookie-open'))}>{label}</button>;}
