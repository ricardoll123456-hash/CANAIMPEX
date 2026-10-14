import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import '@fontsource-variable/manrope';
import '@fontsource/ibm-plex-mono/400.css';
import '@/styles/global.css';
import {Header} from '@/components/Header';
import {Footer} from '@/components/Footer';
import {CookieConsent} from '@/components/CookieConsent';
import {siteUrl,ui,type Locale} from '@/lib/content';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'Cana Impex — Vehicle sourcing & exports',template:'%s | Cana Impex'},description:'Vehicle sourcing, export preparation and shipping coordination. Find your next car with Cana Impex.',icons:{icon:'/brand/favicon.svg',apple:'/brand/apple-touch-icon.png'}};
export function generateStaticParams(){return [{locale:'en'},{locale:'fr'}];}
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {const {locale:l}=await params;if(l!=='en'&&l!=='fr')notFound();const locale=l as Locale;return <html lang={locale}><body><a className="skip-link" href="#main">{ui(locale).skip}</a><Header locale={locale}/><noscript><nav className="noscript-nav" aria-label="Navigation"><a href={locale==='fr'?'/fr/vehicles':'/vehicles'}>{ui(locale).products}</a><a href={locale==='fr'?'/fr/services':'/services'}>{ui(locale).capabilities}</a><a href={locale==='fr'?'/fr/quote':'/quote'}>{ui(locale).quote}</a></nav><style>{'.cookie-panel{display:none}'}</style></noscript>{children}<Footer locale={locale}/><CookieConsent locale={locale}/></body></html>;}
