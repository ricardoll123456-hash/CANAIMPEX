import {NextResponse,type NextRequest} from 'next/server';
export function proxy(request:NextRequest){ const p=request.nextUrl.pathname;if(p==='/en'||p.startsWith('/en/')){const url=request.nextUrl.clone();url.pathname=p.replace(/^\/en/,'')||'/';return NextResponse.redirect(url,308);}if(p==='/fr'||p.startsWith('/fr/'))return NextResponse.next();const url=request.nextUrl.clone();url.pathname='/en'+(p==='/'?'':p);return NextResponse.rewrite(url);}
export const config={matcher:['/((?!api|_next|studio|.*\\..*).*)']};
