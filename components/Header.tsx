'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useRef} from 'react';
import {ArrowUpRight, Menu, X} from 'lucide-react';
import {Brand} from './Brand';
import {href, ui, type Locale} from '@/lib/content';
export function Header({locale}: {locale: Locale}) {
 const t=ui(locale); const path=usePathname(); const dialog=useRef<HTMLDialogElement>(null);
 const current=path.replace(/^\/(en|fr)(?=\/|$)/,'') || '/';
 const other=href(locale==='en'?'fr':'en', current);
 const links=[['vehicles',t.products],['services',t.capabilities],['how-it-works',t.compliance],['about',t.about],['insights',t.insights]];
 const switcher=<a className="language" href={other} hrefLang={locale==='en'?'fr':'en'} aria-label={locale==='en'?'Lire en français':'Read in English'} onClick={e=>{e.currentTarget.href=other+window.location.search;}}>{locale==='en'?'FR':'EN'} <span aria-hidden="true">↗</span></a>;
 return <header className="site-header"><div className="header-inner"><Link href={href(locale)} aria-label="Cana Impex — home"><Brand/></Link><nav className="desktop-nav" aria-label={locale==='fr'?'Navigation principale':'Main navigation'}>{links.map(([p,label])=><Link key={p} href={href(locale,'/'+p)} aria-current={current.startsWith('/'+p)?'page':undefined}>{label}</Link>)}</nav><div className="header-actions">{switcher}<Link className="button button-small header-quote" href={href(locale,'/quote')}>{t.quote}<ArrowUpRight size={15}/></Link><button className="menu-trigger" aria-label={t.menu} onClick={()=>dialog.current?.showModal()}><Menu/></button></div></div><dialog ref={dialog} className="mobile-menu" aria-label={locale==='fr'?'Navigation principale':'Main navigation'}><div className="mobile-top"><Brand/><button aria-label={t.close} onClick={()=>dialog.current?.close()}><X/></button></div><nav>{links.map(([p,label])=><Link key={p} href={href(locale,'/'+p)} onClick={()=>dialog.current?.close()}>{label}<ArrowUpRight/></Link>)}<Link href={href(locale,'/contact')} onClick={()=>dialog.current?.close()}>{t.contact}<ArrowUpRight/></Link><Link className="button" href={href(locale,'/quote')} onClick={()=>dialog.current?.close()}>{t.quote}<ArrowUpRight/></Link></nav></dialog></header>;
}
