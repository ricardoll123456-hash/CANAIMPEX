import {getCmsSettings} from '@/lib/cms';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {Brand} from './Brand';
import {CookieButton} from './CookieConsent';
import {href,vehicles,ui,type Locale} from '@/lib/content';
export async function Footer({locale}:{locale:Locale}) {const t=ui(locale);const settings=await getCmsSettings();return <footer className="site-footer"><div className="container footer-main"><div className="footer-brand"><Brand light/><p>{t.footerLine}</p><span>{t.footerBody}</span></div><div><h2>{t.products}</h2>{vehicles.map(p=><Link key={p.slug} href={href(locale,'/vehicles/'+p.slug)}>{p.name[locale]}</Link>)}</div><div><h2>Cana Impex</h2>{[['services',t.capabilities],['how-it-works',t.compliance],['about',t.about],['insights',t.insights],['contact',t.contact]].map(([p,l])=><Link key={p} href={href(locale,'/'+p)}>{l}</Link>)}</div><div className="footer-cta"><span className="eyebrow">{t.origin}</span><Link href={href(locale,'/quote')}>{t.quote}<ArrowUpRight/></Link></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {settings?.legalName||'Cana Impex'}. {t.copyright}</span><div><Link href={href(locale,'/privacy')}>{t.privacy}</Link><Link href={href(locale,'/terms')}>{t.terms}</Link><CookieButton label={t.cookies}/></div></div></footer>;}
